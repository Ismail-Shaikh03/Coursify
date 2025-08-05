package com.coursify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Courses")
public class Course {

    @Id
    private String crn;

    private String term;
    private String course;
    private String title;
    private String section;
    private String days;
    private String times;
    private String location;
    private String courseStatus;
    private Integer max;
    private Integer now;
    private String instructor;
    private String deliveryMode;
    private BigDecimal credits;

    @Column(columnDefinition = "TEXT")
    private String info;

    @Column(columnDefinition = "TEXT")
    private String comments;
}