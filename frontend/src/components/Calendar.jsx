import React from 'react';

// Helper to get 30-minute slot difference
const getSlotCount = (start, end, slots) => {
  const startIdx = slots.indexOf(start);
  const endIdx = slots.indexOf(end);
  return endIdx > startIdx ? endIdx - startIdx : 1;
};

const Calendar = ({ semester, timeSlots, daysOfWeek, getCourseForCell }) => {
  const rendered = {}; // To track which course times have already been rendered

  return (
    <div className="schedule-grid">
      {/* Header Row */}
      <div className="header-row">
        <div className="semester-label">{semester}</div>
        {daysOfWeek.map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}
      </div>

      <table className="calendar">
        <thead>
          <tr>
            <th></th>
            {daysOfWeek.map(day => (
              <th key={day}></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, rowIndex) => (
            <tr key={time}>
              <td className="time-column">{time}</td>
              {daysOfWeek.map(day => {
                const key = `${day}-${time}`;

                // Skip if this time has already been rendered as part of a previous rowspan
                if (rendered[key]) return null;

                const course = getCourseForCell(day, time);

                if (course && !rendered[`${day}-${course.time}`]) {
                  const duration = course.duration || 1;
                  const span = getSlotCount(course.time, course.endTime, timeSlots);

                  // Mark subsequent time slots as rendered
                  const startIdx = timeSlots.indexOf(course.time);
                  for (let i = 1; i < span; i++) {
                    rendered[`${day}-${timeSlots[startIdx + i]}`] = true;
                  }

                  return (
                    <td key={`${day}-${time}`} rowSpan={span}>
                      <div className={`course-block ${course.color}`}>
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">{course.name}</span>
                        <span className="course-location">{course.location}</span>
                      </div>
                    </td>
                  );
                }

                // Empty cell
                return <td key={`${day}-${time}`}></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;




