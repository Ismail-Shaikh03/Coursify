package com.coursify.dto;

import lombok.Data;
import java.util.List;

@Data
public class PreferencesDTO {
    private String userId;
    private List<String> schedulingPreferences;
    private List<String> courseInterests;
}