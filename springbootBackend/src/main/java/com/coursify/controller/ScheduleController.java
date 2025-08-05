package com.coursify.controller;

import com.coursify.dto.*;
import com.coursify.entity.Course;
import com.coursify.service.CourseService;
import com.coursify.service.OpenAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
public class ScheduleController {

    private final CourseService courseService;
    private final OpenAIService openAIService;

    public ScheduleController(CourseService courseService, OpenAIService openAIService) {
        this.courseService = courseService;
        this.openAIService = openAIService;
    }


    @GetMapping
    public ResponseEntity<String> welcome() {
        return ResponseEntity.ok("Welcome to the Coursify API!");
    }


    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponseDTO>> getCourses(@RequestParam(name = "name") String courseName) {
        List<Course> courses = courseService.findCourses(courseName);
        List<CourseResponseDTO> courseDTOs = courses.stream()
                .map(CourseResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(courseDTOs);
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ScheduleRequestDTO request) {
        String fullMessage = String.format(
                "Please generate a course schedule for a %s student majoring in %s. They are a %s planning for the %s semester.",
                request.getStudentType(),
                request.getMajor(),
                request.getAcademicYear(),
                request.getSemester()
        );

        Optional<String> aiResponseJsonOptional = openAIService.getChatResponse(fullMessage, request.getThreadId());

        if (aiResponseJsonOptional.isPresent()) {
            List<Course> finalSchedule = courseService.createScheduleFromAIResponse(aiResponseJsonOptional.get());
            List<CourseResponseDTO> scheduleDTOs = finalSchedule.stream()
                    .map(CourseResponseDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(scheduleDTOs);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not generate a schedule. The request may have been empty or the AI service failed to respond."));
        }
    }


    @PostMapping("/preferences")
    public ResponseEntity<Map<String, Object>> savePreferences(@RequestBody PreferencesDTO preferences) {
        System.out.println("Received preferences for user: " + preferences.getUserId());
        return ResponseEntity.ok(Map.of("status", "success", "receivedData", preferences));
    }
}