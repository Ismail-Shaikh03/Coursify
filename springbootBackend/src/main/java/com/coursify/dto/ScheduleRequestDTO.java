package com.coursify.dto;

import lombok.Data;

// This DTO is now updated to match the 'userPreferences' object from Survey.jsx
@Data
public class ScheduleRequestDTO {
    private String studentType;
    private String major;
    private String academicYear;
    private String semester;
    private String threadId;
}