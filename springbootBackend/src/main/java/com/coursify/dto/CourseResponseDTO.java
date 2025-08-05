package com.coursify.dto;

import com.coursify.entity.Course;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CourseResponseDTO {

    private String crn;
    private String courseCode;
    private String title;
    private String instructor;
    private String days;
    private String times;
    private String location;
    private BigDecimal credits;
    private String deliveryMode;
    private String term;
    private Integer seatsAvailable;

    public static CourseResponseDTO fromEntity(Course course) {
        return CourseResponseDTO.builder()
                .crn(course.getCrn())
                .courseCode(course.getCourse())
                .title(course.getTitle())
                .instructor(course.getInstructor())
                .days(course.getDays())
                .times(course.getTimes())
                .location(course.getLocation())
                .credits(course.getCredits())
                .deliveryMode(course.getDeliveryMode())
                .term(course.getTerm())
                .seatsAvailable(course.getMax() - course.getNow())
                .build();
    }
}