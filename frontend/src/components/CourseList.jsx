import React from 'react';

const CourseList = ({ selectedCourses, removeCourse, totalCredits }) => {
  return (
    <div className="course-selection">
      <h3 className="selection-title">Selected Courses</h3>
      {selectedCourses.length > 0 ? (
        <div className="course-list">
          {selectedCourses.map((course, index) => (
            <div key={index} className="course-item">
              <span className="course-item-code">{course.code}</span>
              <span className="course-item-credits">{course.credits.toFixed(2)} cr</span>
              <button 
                className="remove-btn"
                onClick={() => removeCourse(course.code)}
              >
                ×
              </button>
            </div>
          ))}
          <div className="credits-total">
            <span>Total Credits:</span>
            <span className={totalCredits < 12 || totalCredits > 18 ? "warning" : ""}>
              {totalCredits.toFixed(2)} / 18.00
            </span>
          </div>
        </div>
      ) : (
        <p>No courses selected yet.</p>
      )}
    </div>
  );
};

export default CourseList;