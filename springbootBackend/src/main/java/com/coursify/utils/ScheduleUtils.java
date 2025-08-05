package com.coursify.utils;

import com.coursify.entity.Course;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;


public final class ScheduleUtils {

    private record TimeRange(int startMinutes, int endMinutes) {}

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mma", Locale.ENGLISH);




    public static int timeToMinutes(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) {
            return -1;
        }
        try {
            LocalTime time = LocalTime.parse(timeStr.toLowerCase(), TIME_FORMATTER);
            return time.getHour() * 60 + time.getMinute();
        } catch (DateTimeParseException e) {
            return -1; // Return -1 or throw an exception for invalid formats
        }
    }


    private static TimeRange parseTimeRange(String timeRangeStr) {
        if (timeRangeStr == null || timeRangeStr.equalsIgnoreCase("TBA")) {
            return null;
        }
        String[] parts = timeRangeStr.split("-");
        if (parts.length != 2) {
            return null;
        }
        int start = timeToMinutes(parts[0].trim());
        int end = timeToMinutes(parts[1].trim());

        if (start == -1 || end == -1) {
            return null;
        }
        return new TimeRange(start, end);
    }


    private static Set<DayOfWeek> parseDays(String daysString) {
        if (daysString == null || daysString.equalsIgnoreCase("TBA")) {
            return Collections.emptySet();
        }
        Set<DayOfWeek> days = new HashSet<>();
        for (char c : daysString.toCharArray()) {
            switch (c) {
                case 'M' -> days.add(DayOfWeek.MONDAY);
                case 'T' -> days.add(DayOfWeek.TUESDAY);
                case 'W' -> days.add(DayOfWeek.WEDNESDAY);
                case 'R' -> days.add(DayOfWeek.THURSDAY);
                case 'F' -> days.add(DayOfWeek.FRIDAY);
                case 'S' -> days.add(DayOfWeek.SATURDAY);
            }
        }
        return days;
    }


    public static boolean hasConflict(List<Course> schedule) {
        if (schedule == null || schedule.size() < 2) {
            return false;
        }

        List<Course> coursesWithTime = schedule.stream()
                .filter(course -> !isBlankEntry(course))
                .collect(Collectors.toList());

        for (int i = 0; i < coursesWithTime.size(); i++) {
            for (int j = i + 1; j < coursesWithTime.size(); j++) {
                Course c1 = coursesWithTime.get(i);
                Course c2 = coursesWithTime.get(j);

                Set<DayOfWeek> days1 = parseDays(c1.getDays());
                Set<DayOfWeek> days2 = parseDays(c2.getDays());

                if (!Collections.disjoint(days1, days2)) {
                    TimeRange range1 = parseTimeRange(c1.getTimes());
                    TimeRange range2 = parseTimeRange(c2.getTimes());

                    if (range1 == null || range2 == null) continue;

                    if (range1.startMinutes() < range2.endMinutes() && range2.startMinutes() < range1.endMinutes()) {
                        return true; // Conflicting time found
                    }
                }
            }
        }
        return false;
    }




    public static boolean isBlankEntry(Course course) {
        return course == null ||
                course.getTimes() == null || course.getTimes().equalsIgnoreCase("TBA") ||
                course.getDays() == null || course.getDays().equalsIgnoreCase("TBA");
    }



}