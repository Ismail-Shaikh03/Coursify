package com.coursify.dto;

import lombok.Data;

/**
 * DTO for the incoming request to fetch courses.
 */
@Data
public class ReceiveResponseRequestDTO {
    private String courseName;
}