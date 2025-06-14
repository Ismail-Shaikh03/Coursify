import React from 'react';

// Helper to get 30-minute slot difference
const getSlotCount = (start, end, slots) => {
  const startIdx = slots.findIndex(t => t.toLowerCase() === start.toLowerCase());
  const endIdx = slots.findIndex(t => t.toLowerCase() === end.toLowerCase());
  //console.log("start")

  //console.log(startIdx)
  //console.log(endIdx)
  //console.log(endIdx > startIdx);
  //console.log(endIdx - startIdx)
  //console.log("End")

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
              const cellKey = `${day}-${time}`;
              
              if (rendered[cellKey]) return null;

              const course = getCourseForCell(day, time);

              if (course) {
                console.log(course)
                const span = getSlotCount(course.time, course.endTime, timeSlots);
                //console.log(span)
                const startIdx = timeSlots.findIndex(t => t.toLowerCase() === course.time.toLowerCase());


                for (let i = 0; i < span; i++) {
                  const spannedKey = `${day}-${timeSlots[startIdx + i]}`;
                  rendered[spannedKey] = true;
                }

                return (
                  <td key={cellKey} rowSpan={span}>
                    <div className={`course-block ${course.color}`}>
                      <span className="course-code">{course.code}</span>
                      <span className="course-name">{course.name}</span>
                      <span className="course-name">{course.location}</span>

                    </div>
                  </td>
                );
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




