package com.coursify.repository;

import com.coursify.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT C.* FROM Courses C JOIN Prof_Ratings P ON P.Instructor = C.Instructor " +
            "WHERE C.Course = :course " +
            "AND C.Times <> 'TBA' " + // <> --> SQL 'not equal'
            "ORDER BY P.rating DESC " +
            "LIMIT 17", nativeQuery = true)
    List<Course> findCoursesWithRatings(@Param("course") String course);


    @Query(value = "SELECT * FROM Courses C WHERE C.Course = :course AND C.Times <> 'TBA' LIMIT 17", nativeQuery = true)
    List<Course> findFallbackCourses(@Param("course") String course);


    @Query(value = "SELECT C.* FROM Courses C JOIN Prof_Ratings P ON P.Instructor = C.Instructor " +
            "WHERE C.crn = :crn", nativeQuery = true)
    Optional<Course> findCourseByCRN(@Param("crn") String crn);
}