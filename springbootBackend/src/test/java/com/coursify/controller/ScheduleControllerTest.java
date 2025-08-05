package com.coursify.controller;

import com.coursify.dto.ReceiveResponseRequestDTO;
import com.coursify.entity.Course;
import com.coursify.service.CourseService;
import com.coursify.service.OpenAIService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CourseService courseService;

    @MockBean
    private OpenAIService openAIService;

    @Test
    void testWelcomeEndpoint() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string("Welcome to the Coursify API!"));
    }

    @Test
    void testGetCoursesEndpoint_Success() throws Exception {
        Course course = new Course("12345", "Fall 2024", "CSCI-101", "Intro to CS", "01", "MWF", "10:00am-10:50am", "Hall A", "Active", 30, 25, "Dr. Hopper", "In-Person", new BigDecimal("3.0"), "", "");
        when(courseService.findCourses(anyString())).thenReturn(List.of(course));

        mockMvc.perform(get("/courses").param("name", "CSCI-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].crn").value("12345"))
                .andExpect(jsonPath("$[0].title").value("Intro to CS"));
    }

    @Test
    void testChatEndpoint_Success() throws Exception {
        String mockAiResponse = "{\"c1\":\"CS101\"}";
        when(openAIService.getChatResponse(anyString(), any())).thenReturn(Optional.of(mockAiResponse));

        Course course = new Course("12345", "Fall 2024", "CS101", "Intro to CS", "01", "MWF", "10:00am-10:50am", "Hall A", "Active", 30, 25, "Dr. Hopper", "In-Person", new BigDecimal("3.0"), "", "");
        when(courseService.createScheduleFromAIResponse(mockAiResponse)).thenReturn(List.of(course));

        mockMvc.perform(post("/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userMessage\": \"Hello\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseCode").value("CS101"));
    }
}