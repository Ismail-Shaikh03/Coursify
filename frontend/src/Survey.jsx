import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import ChatInterface from "./components/ChatInterface";
import CourseList from "./components/CourseList";

const Survey = () => {
  // State for chat messages
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi there! I'll help you build your schedule. Let's start with a few questions to find the right courses for you.",
      options: []
    },
    {
      type: 'bot',
      text: "Are you a full-time or part-time student?",
      options: ['Full-time', 'Part-time']
    }
  ]);
  
  // State for selected courses - starts empty
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // State for current semester
  const [semester] = useState('Fall 2025');
  
  // Reference for chat container to auto-scroll
  const chatMessagesRef = useRef(null);
  
  // Sample course data
  const courses = {
    'IT 490': { 
      code: 'IT 490-101', 
      name: 'Systems Integration', 
      credits: 3.00, 
      location: 'GITC 3600',
      days: ['Tuesday'],
      time: '6:00 pm',
      color: 'it'
    },
    'IT 342': { 
      code: 'IT 342-101', 
      name: 'Cloud Administration', 
      credits: 3.00, 
      location: 'FMH 313',
      days: ['Wednesday'],
      time: '6:00 pm',
      color: 'it'
    },
    'IT 332': { 
      code: 'IT 332-103', 
      name: 'Digital Crime', 
      credits: 3.00, 
      location: 'CKB 226',
      days: ['Friday'],
      time: '6:00 pm',
      color: 'it'
    },
    'COM 312': { 
      code: 'COM 312-007', 
      name: 'Oral Presentation', 
      credits: 3.00, 
      location: 'FMH 405',
      days: ['Monday', 'Wednesday'],
      time: '1:00 pm',
      color: 'com'
    },
    'HSS 404': { 
      code: 'HSS 404-003', 
      name: 'Senior Seminar', 
      credits: 3.00, 
      location: 'CKB 315',
      days: ['Monday', 'Wednesday'],
      time: '4:00 pm',
      color: 'hss'
    }
  };
  
  // Time slots for the calendar
  const timeSlots = [
    '8:00 am', '9:00 am', '10:00 am', '11:00 am', 
    '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', 
    '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm'
  ];
  
  // Days of the week - updated to include Saturday
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleOptionClick = (option) => {
    // Add user selection as a bubble
    addMessage('user', option);
    
    // Get the last bot question
    const lastBotMessage = [...messages].reverse().find(msg => msg.type === 'bot');
    
    // Add appropriate follow-up based on the last question
    if (lastBotMessage) {
      if (lastBotMessage.text.includes('full-time or part-time')) {
        setTimeout(() => {
          addMessage('bot', "What's your major?", [
            "Computer Science", "Information Technology", "Business", "Engineering", "Other"
          ]);
        }, 500);
      } else if (lastBotMessage.text.includes('major')) {
        setTimeout(() => {
          addMessage('bot', "What's your current academic standing?", [
            "Freshman", "Sophomore", "Junior", "Senior"
          ]);
        }, 500);
      } else if (lastBotMessage.text.includes('standing')) {
        // Only show the waiting message and don't proceed to recommendations
        setTimeout(() => {
          addMessage('bot', "Please wait while I retrieve the information for you...");
          // No further messages or actions after this
        }, 500);
      }
    }
    
    // Check if option is a course
    if (option.includes('(') && option.includes(')')) {
      const courseCode = option.split(' ')[0] + ' ' + option.split(' ')[1];
      addCourse(courseCode);
    }
  };
  
  // Add a message to the chat
  const addMessage = (type, text, options = []) => {
    setMessages(prev => [...prev, { type, text, options }]);
  };
  
  // Add a course to the schedule
  const addCourse = (courseCode) => {
    if (!courses[courseCode]) return;
    
    // Check if course is already selected
    if (selectedCourses.some(course => course.code.startsWith(courseCode))) {
      addMessage('bot', `You've already added ${courseCode} to your schedule.`);
      return;
    }
    
    // Add course to selected courses
    setSelectedCourses(prev => [...prev, courses[courseCode]]);
    
    // Confirmation message
    setTimeout(() => {
      addMessage('bot', `I've added ${courseCode} to your schedule.`);
    }, 500);
  };
  
  // Remove a course from the schedule
  const removeCourse = (courseCode) => {
    setSelectedCourses(prev => prev.filter(course => course.code !== courseCode));
    
    // Notification message
    addMessage('bot', `I've removed ${courseCode} from your schedule.`);
  };
  
  // Calculate total credits
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  
  // Check if a cell has a course
  const getCourseForCell = (day, time) => {
    return selectedCourses.find(course => 
      course.days.includes(day) && course.time === time
    );
  };
  
  return (
    <div className="schedule-builder-container">
      {/* Header */}
      <Header />
      
      {/* Schedule Grid */}
      <Calendar 
        semester={semester}
        timeSlots={timeSlots}
        daysOfWeek={daysOfWeek}
        selectedCourses={selectedCourses}
        getCourseForCell={getCourseForCell}
      />
      
      {/* Chat Interface */}
      <div className="right-panel">
        <ChatInterface 
          messages={messages}
          handleOptionClick={handleOptionClick}
          chatMessagesRef={chatMessagesRef}
        />
        
        {/* Selected Courses */}
        <CourseList 
          selectedCourses={selectedCourses}
          removeCourse={removeCourse}
          totalCredits={totalCredits}
        />
      </div>
    </div>
  );
};

export default Survey;