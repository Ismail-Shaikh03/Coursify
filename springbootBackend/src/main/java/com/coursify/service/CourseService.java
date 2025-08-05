package com.coursify.service;

import com.coursify.entity.Course;
import java.util.List;
import java.util.Optional;


public interface CourseService {


    List<Course> findCourses(String courseName);


    Optional<Course> findCourseByCrn(String crn);


    List<Course> createScheduleFromAIResponse(String aiResponseJson);
}