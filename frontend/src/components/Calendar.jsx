import React from 'react';

const getSlotCount = (start, end) => {
  const timeToNumber = (str) => {
    if (!str) return 0;
    const [hour, minPart] = str.split(':');
    const minute = parseInt(minPart) || 0;
    let hourNum = parseInt(hour) || 0;
    if (str.toLowerCase().includes('pm') && hourNum !== 12) hourNum += 12;
    if (str.toLowerCase().includes('am') && hourNum === 12) hourNum = 0; 
    return hourNum + minute / 60;
  };

  const durationInHours = timeToNumber(end) - timeToNumber(start);
  if (durationInHours <= 0) return 1;

  const span = Math.round(durationInHours / 0.5);
  
  return Math.max(1, span); 
};

const Calendar = ({ semester, timeSlots, daysOfWeek, getCourseForCell }) => {
  return (
    <div className="schedule-grid">
      <div className="header-row">
        <div className="semester-label">{semester}</div>
        {daysOfWeek.map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}
      </div>

      <table className="calendar">
        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td className="time-column">{time}</td>
              {daysOfWeek.map(day => {
                const course = getCourseForCell(day, time);
                const cellKey = `${day}-${time}`;

          


             
                if (course && course.time.toLowerCase() === time.toLowerCase()) {
                  const span = getSlotCount(course.time, course.endTime, timeSlots);
                  return (
                    <td key={cellKey} rowSpan={span}>
                      <div className={`course-block color-${course.code.substring(0,4).toLowerCase()}`}>
                        <span className="course-code">{course.code}</span>
                        <span className="course-name">{course.name}</span>
                        <span className="course-location">{course.location}</span>
                      </div>
                    </td>
                  );
                }

                if (course) {
                  return null;
                }
         
                return <td key={cellKey}></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;