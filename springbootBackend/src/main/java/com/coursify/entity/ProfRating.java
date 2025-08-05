package com.coursify.entity;

import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Prof_Ratings")
public class ProfRating {

    @Id
    private String instructor;

    private Double qualityNumber;
    private Integer rating;
    private Integer percent;
    private Double difficulty;
}