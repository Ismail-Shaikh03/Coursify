package com.coursify.service;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OpenAIService {

    private static final Logger log = LoggerFactory.getLogger(OpenAIService.class);
    private final WebClient webClient;
    private final String assistantId;

    @Data @NoArgsConstructor private static class MessagesList { private List<MessageData> data; }
    @Data @NoArgsConstructor private static class MessageData { private String role; private List<MessageContent> content; }
    @Data @NoArgsConstructor private static class MessageContent { private String type; private TextContent text; }
    @Data @NoArgsConstructor private static class TextContent { private String value; private List<Object> annotations; }
    @Data @NoArgsConstructor private static class OpenAIThread { private String id; }
    @Data @NoArgsConstructor private static class OpenAIRun { private String id; private String status; }
    private static class OpenAIMessage {
        public final String role;
        public final String content;
        public OpenAIMessage(String role, String content) { this.role = role; this.content = content; }
    }

    public OpenAIService(WebClient.Builder webClientBuilder,
                         @Value("${OPENAI_API_KEY}") String apiKey,
                         @Value("${DEP_RICHIE_ASSISTANT_API_KEY}") String assistantId) {
        this.assistantId = assistantId;
        this.webClient = webClientBuilder
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader("OpenAI-Beta", "assistants=v2")
                .build();
    }


    public Optional<String> getChatResponse(String userMessage, String threadId) {
        if (userMessage == null || userMessage.isBlank()) {
            log.warn("getChatResponse called with an empty or null message.");
            return Optional.empty();
        }

        String currentThreadId = (threadId == null || threadId.isBlank()) ? createThread() : threadId;
        sendMessage(currentThreadId, userMessage);
        createAndPollRun(currentThreadId);
        return fetchLatestAssistantMessage(currentThreadId);
    }


    private String createThread() {
        try {
            return webClient.post().uri("/threads").bodyValue(Map.of()).retrieve().bodyToMono(OpenAIThread.class).map(OpenAIThread::getId).block();
        } catch (WebClientResponseException e) {
            log.error("Error from OpenAI [createThread]: Status {}, Body {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }

    private void sendMessage(String threadId, String userMessage) {
        try {
            if (userMessage == null || userMessage.isBlank()) {
                log.warn("Attempted to send an empty or null message to thread {}", threadId);

                return;
            }
            OpenAIMessage message = new OpenAIMessage("user", userMessage);
            webClient.post().uri("/threads/" + threadId + "/messages").bodyValue(message).retrieve().bodyToMono(Void.class).block();
        } catch (WebClientResponseException e) {

            log.error("Error from OpenAI [sendMessage]: Status {}, Body {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }

    private void createAndPollRun(String threadId) {
        try {
            OpenAIRun run = webClient.post().uri("/threads/" + threadId + "/runs").bodyValue(Map.of("assistant_id", this.assistantId)).retrieve().bodyToMono(OpenAIRun.class).block();
            String status;
            do {
                Thread.sleep(1000);
                OpenAIRun currentRun = webClient.get().uri("/threads/" + threadId + "/runs/" + run.getId()).retrieve().bodyToMono(OpenAIRun.class).block();
                status = Optional.ofNullable(currentRun).map(OpenAIRun::getStatus).orElse("failed");
            } while ("queued".equals(status) || "in_progress".equals(status));
        } catch (WebClientResponseException e) {
            log.error("Error from OpenAI [createAndPollRun]: Status {}, Body {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Polling was interrupted", e);
        }
    }


    private Optional<String> fetchLatestAssistantMessage(String threadId) {
        try {
            MessagesList messagesList = webClient.get().uri("/threads/" + threadId + "/messages").retrieve().bodyToMono(MessagesList.class).block();

            return Optional.ofNullable(messagesList)
                    .map(MessagesList::getData)
                    .flatMap(data -> data.stream().filter(message -> "assistant".equals(message.getRole())).findFirst())
                    .map(MessageData::getContent)
                    .flatMap(content -> content.stream().filter(c -> "text".equals(c.getType())).findFirst())
                    .map(MessageContent::getText)
                    .map(TextContent::getValue);
        } catch (WebClientResponseException e) {
            log.error("Error from OpenAI [fetchLatestAssistantMessage]: Status {}, Body {}", e.getStatusCode(), e.getResponseBodyAsString());
            return Optional.empty();
        }
    }
}