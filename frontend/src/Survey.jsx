import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import ChatInterface from "./components/ChatInterface";
import CourseList from "./components/CourseList";
import { apiService, withLoading } from "./services/api";

const Survey = () => {
  const [messages, setMessages] = useState([]);

  const [userPreferences, setUserPreferences] = useState({
    studentType: "",
    major: "",
    academicYear: "",
    semester: ""
  });

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [semester, setSemester] = useState('Fall 2025');
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false); 

  const chatMessagesRef = useRef(null);

  const timeSlots = [
    '8:00 am', '8:30 am', 
    '9:00 am', '9:30 am', 
    '10:00 am', '10:30 am', 
    '11:00 am', '11:30 am',
    '12:00 pm', '12:30 pm', 
    '1:00 pm', '1:30 pm', 
    '2:00 pm', '2:30 pm', 
    '3:00 pm', '3:30 pm',
    '4:00 pm', '4:30 pm', 
    '5:00 pm', '5:30 pm', 
    '6:00 pm', '6:30 pm', 
    '7:00 pm', '7:30 pm',
    '8:00 pm', '8:30 pm', 
    '9:00 pm', '9:30 pm'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Effects
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let isMounted = true; 
    
    const checkBackendHealth = async () => {
      const result = await withLoading(
        () => apiService.healthCheck(),
        setIsLoading
      );
      
      if (isMounted) {
        if (result.success) {
          setIsConnected(true);
          setError(null);
          addMessage('bot', "Hi there! I'll help you build your schedule. Let's start with a few questions to find the right courses for you.");
          addMessage('bot', "Are you a full-time or part-time student?", ['Full-time', 'Part-time']);
        } else {
          setIsConnected(false);
          setError("Unable to connect to the backend service. Please check if the server is running.");
          addMessage('bot', "I'm having trouble connecting to the server. Please refresh the page or try again later.");
        }
      }
    };

    checkBackendHealth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this only runs once

  const addMessage = (type, text, options = []) => {
    setMessages(prev => {
      const messageExists = prev.some(msg => msg.text === text && msg.type === type);
      if (messageExists) {
        return prev;
      }
      return [...prev, { type, text, options }];
    });
  };

  const updateUserPreferences = (key, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const retryConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await withLoading(
      () => apiService.healthCheck(),
      setIsLoading
    );
    
    if (result.success) {
      setIsConnected(true);
      setMessages([]); // Clear error messages
      addMessage('bot', "Connection restored! Hi there! I'll help you build your schedule. Let's start with a few questions to find the right courses for you.");
      addMessage('bot', "Are you a full-time or part-time student?", ['Full-time', 'Part-time']);
    } else {
      setIsConnected(false);
      setError("Still unable to connect to the backend service. Please check if the server is running.");
    }
  };

  const normalizeCoursesFromBackend = (courseArray) => {
    if (!Array.isArray(courseArray)) {
      console.error("Invalid course data received from backend: expected an array.", courseArray);
      return [];
    }

    const dayMap = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', R: 'Thursday', F: 'Friday', S: 'Saturday' };

    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      let cleanedTime = timeStr.trim().toLowerCase();
      return cleanedTime.replace(/(\s*)?(am|pm)/, ' $2');
    };

    return courseArray.map(course => {
      const parsedDays = course.days ? course.days.split('').map(char => dayMap[char]).filter(Boolean) : [];
      
      let startTime = '';
      let endTime = '';
      if (course.times && course.times.includes('-')) {
        let [start, end] = course.times.split('-');
        startTime = formatTime(start);
        endTime = formatTime(end);
      }

      return {
        code: course.courseCode,
        name: course.title,
        credits: course.credits,
        location: course.location,
        days: parsedDays,
        time: startTime,
        endTime: endTime,
        color: `color-${Math.floor(Math.random() * 5) + 1}`
      };
    });
  };

  const handleScheduleGeneration = async () => {
    addMessage("bot", "Please wait while I retrieve the information for you");
    
    let dots = "";
    const interval = setInterval(() => {
      dots = dots.length < 3 ? dots + "." : "";
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.text.startsWith("Please wait")) {
          updated[updated.length - 1] = {
            ...last,
            text: "Please wait while I retrieve the information for you" + dots,
          };
        }
        return updated;
      });
    }, 500);

    const result = await withLoading(
      () => apiService.getSchedule(userPreferences),
      setIsLoading
    );

    clearInterval(interval);

    if (result.success) {
      try {
        console.log(result)
        const normalizedCourses = normalizeCoursesFromBackend(result.data);
        setSelectedCourses(normalizedCourses);
        addMessage("bot", "Here are your recommended courses for the semester. If a course isn't showing up on the grid, that is because it was unable to calculate a proper time for that specific course.");
        setError(null);
      } catch (normalizationError) {
        console.error("Course normalization failed:", normalizationError);
        addMessage("bot", "I received the course data, but there was an issue processing it. Please try again.");
        setError(normalizationError.message);
      }
    } else {
      addMessage("bot", `Something went wrong while retrieving your courses: ${result.error}`);
      setError(result.error);
    }
  };

  const handleOptionClick = (option) => {
    if (!isConnected) {
      return;
    }

    addMessage('user', option);

    setError(null);

    const lastBotMessage = [...messages].reverse().find(msg => msg.type === 'bot');

    if (lastBotMessage) {
      if (lastBotMessage.text.includes('full-time or part-time')) {
        updateUserPreferences('studentType', option);
        setTimeout(() => {
          addMessage('bot', "What's your major?", [
            "Computer Science", "Financial Tech", "Applied Math"
          ]);
        }, 500);
        
      } else if (lastBotMessage.text.includes('major')) {
        updateUserPreferences('major', option);
        setTimeout(() => {
          addMessage('bot', "What's your current academic standing?", [
            "Freshman", "Sophomore", "Junior", "Senior"
          ]);
        }, 500);
        
      } else if (lastBotMessage.text.includes('standing')) {
        updateUserPreferences('academicYear', option);
        setTimeout(() => {
          addMessage('bot', "Which semester are you planning for?", [
            "Fall", "Spring"
          ]);
        }, 500);
        
      } else if (lastBotMessage.text.includes('semester')) {
        updateUserPreferences('semester', option);
        setSemester(`${option} 2025`);
        
        setTimeout(() => {
          handleScheduleGeneration();
        }, 500);
      }
    }

    if (option.includes('(') && option.includes(')')) {
      const courseCode = option.split(' ')[0] + ' ' + option.split(' ')[1];
      addCourse(courseCode);
    }
  };

  const addCourse = (courseCode) => {
    console.log(`Manual course addition not implemented: ${courseCode}`);
  };

  const removeCourse = (courseCode) => {
    setSelectedCourses(prev => prev.filter(course => course.code !== courseCode));
    addMessage('bot', `I've removed ${courseCode} from your schedule.`);
  };

  const totalCredits = selectedCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

  const getCourseForCell = (day, time) => {
    const timeToNumber = (str) => {
      if (!str) return 0;
      const [hour, minPart] = str.split(':');
      const minute = parseInt(minPart) || 0;
      let hourNum = parseInt(hour) || 0;
      if (str.toLowerCase().includes('pm') && hourNum !== 12) hourNum += 12;
      if (str.toLowerCase().includes('am') && hourNum === 12) hourNum = 0;
      return hourNum + minute / 60;
    };
    
    return selectedCourses.find(course => {
      if (!course.days || !Array.isArray(course.days) || !course.days.includes(day)) return false;
      const courseStart = timeToNumber(course.time);
      const courseEnd = timeToNumber(course.endTime);
      const slotTime = timeToNumber(time);
      return slotTime >= courseStart && slotTime < courseEnd;
    });
  };

  return (
    <div className="schedule-builder-container">
      <Header />
      <div className="calendarGrid">
        <Calendar
          semester={semester}
          timeSlots={timeSlots}
          daysOfWeek={daysOfWeek}
          selectedCourses={selectedCourses}
          getCourseForCell={getCourseForCell}
        />
      </div>
      <div className="right-panel">
        <ChatInterface
          messages={messages}
          handleOptionClick={handleOptionClick}
          chatMessagesRef={chatMessagesRef}
          isLoading={isLoading}
          isConnected={isConnected}
          onRetry={retryConnection}
        />
        <CourseList
          selectedCourses={selectedCourses}
          removeCourse={removeCourse}
          totalCredits={totalCredits}
        />
        {error && (
          <div className="error-display">
            <p>⚠️ {error}</p>
            <button onClick={retryConnection} disabled={isLoading} className="retry-btn">
              {isLoading ? 'Checking...' : 'Retry Connection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Survey;