package com.coursify.service.impl;

import com.coursify.entity.Course;
import com.coursify.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private Course course1;
    private Course course2;

    @BeforeEach
    void setUp() {
        course1 = new Course("12345", "Fall 2024", "CSCI-101", "Intro to CS", "01", "MWF", "10:00am-10:50am", "Hall A", "Active", 30, 25, "Dr. Hopper", "In-Person", new BigDecimal("3.0"), "", "");
        course2 = new Course("67890", "Fall 2024", "CSCI-101", "Intro to CS", "02", "TR", "1:00pm-2:15pm", "Hall B", "Active", 30, 30, "Dr. Liskov", "Online", new BigDecimal("3.0"), "", "");
    }

    @Test
    void whenFindCoursesWithRatings_thenReturnsRatedCourses() {
        List<Course> ratedCourses = List.of(course1);
        when(courseRepository.findCoursesWithRatings("CSCI-101")).thenReturn(ratedCourses);
        List<Course> result = courseService.findCourses("CSCI-101");
        assertEquals(1, result.size());
        assertEquals("12345", result.get(0).getCrn());
        verify(courseRepository, never()).findFallbackCourses(anyString());
    }

    @Test
    void whenFindCoursesWithNoRatings_thenReturnsFallbackCourses() {
        when(courseRepository.findCoursesWithRatings("CSCI-101")).thenReturn(Collections.emptyList());
        List<Course> fallbackCourses = List.of(course2);
        when(courseRepository.findFallbackCourses("CSCI-101")).thenReturn(fallbackCourses);
        List<Course> result = courseService.findCourses("CSCI-101");
        assertEquals(1, result.size());
        assertEquals("67890", result.get(0).getCrn());
        verify(courseRepository).findCoursesWithRatings("CSCI-101");
        verify(courseRepository).findFallbackCourses("CSCI-101");
    }

    @Test
    void whenFindCourseByCrn_andCourseExists_thenReturnsOptionalOfCourse() {
        when(courseRepository.findCourseByCRN("12345")).thenReturn(Optional.of(course1));
        Optional<Course> result = courseService.findCourseByCrn("12345");
        assertTrue(result.isPresent());
        assertEquals("Intro to CS", result.get().getTitle());
    }

    @Test
    void whenFindCourseByCrn_andCourseDoesNotExist_thenReturnsEmptyOptional() {
        when(courseRepository.findCourseByCRN("00000")).thenReturn(Optional.empty());
        Optional<Course> result = courseService.findCourseByCrn("00000");
        assertTrue(result.isEmpty());
    }
}