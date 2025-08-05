package com.coursify.service.impl;

import com.coursify.entity.Course;
import com.coursify.repository.CourseRepository;
import com.coursify.service.CourseService;
import org.springframework.stereotype.Service;

import com.coursify.utils.ScheduleUtils;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;


    public CourseServiceImpl(CourseRepository courseRepository, ObjectMapper objectMapper) {
        this.courseRepository = courseRepository;
        this.objectMapper = objectMapper;
    }


    @Override
    public List<Course> findCourses(String courseName) {
        List<Course> courses = courseRepository.findCoursesWithRatings(courseName);

        if (courses == null || courses.isEmpty()) {
            return courseRepository.findFallbackCourses(courseName);
        }

        return courses;
    }


    @Override
    public Optional<Course> findCourseByCrn(String crn) {
        return courseRepository.findCourseByCRN(crn);
    }
    @Override
    public List<Course> createScheduleFromAIResponse(String aiResponseJson) {
        try {
            Map<String, String> courseCodesMap = objectMapper.readValue(aiResponseJson, new TypeReference<>() {});
            List<String> courseCodes = courseCodesMap.values().stream()
                    .filter(code -> code != null && !code.equalsIgnoreCase("N/A"))
                    .distinct()
                    .collect(Collectors.toList());

            List<List<Course>> allCourseOptions = courseCodes.stream()
                    .map(this::findCourses)
                    .filter(list -> !list.isEmpty())
                    .collect(Collectors.toList());

            return findConflictFreeSchedule(new ArrayList<>(), allCourseOptions);

        } catch (Exception e) {
            System.err.println("Error building schedule from AI response: " + e.getMessage());
            return Collections.emptyList();
        }
    }


    private List<Course> findConflictFreeSchedule(List<Course> currentSchedule, List<List<Course>> remainingOptions) {
        if (remainingOptions.isEmpty()) {
            return currentSchedule;
        }

        List<Course> nextCourseOptions = remainingOptions.get(0);
        List<List<Course>> nextRemainingOptions = remainingOptions.subList(1, remainingOptions.size());

        for (Course option : nextCourseOptions) {
            currentSchedule.add(option);

            if (!ScheduleUtils.hasConflict(currentSchedule)) {
                List<Course> result = findConflictFreeSchedule(currentSchedule, nextRemainingOptions);
                if (!result.isEmpty()) {
                    return result;
                }
            }


            currentSchedule.remove(currentSchedule.size() - 1);
        }

        return Collections.emptyList();
    }
}