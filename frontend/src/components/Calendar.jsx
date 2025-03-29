import React from 'react';

const Calendar = ({ semester, timeSlots, daysOfWeek, getCourseForCell }) => {
  return (
    <div className="schedule-grid">
      {/* Top row with semester name and days of the week */}
      <div className="header-row">
        <div className="semester-label">{semester}</div>
        {daysOfWeek.map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}
      </div>
      
      <table className="calendar">
        <thead>
          <tr>
            <th></th> {/* Empty corner cell */}
            {daysOfWeek.map(day => (
              <th key={day}></th> /* Empty th cells, days shown above */
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="time-column">{time}</td>
              {daysOfWeek.map(day => {
                const course = getCourseForCell(day, time);
                return (
                  <td key={`${day}-${time}`}>
                    {course && (
                      <div className={`course-block ${course.color}`}>
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">{course.name}</span>
                        <span className="course-location">{course.location}</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;