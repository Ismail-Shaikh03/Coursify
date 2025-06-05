import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import ChatInterface from "./components/ChatInterface";
import CourseList from "./components/CourseList";

const Survey = () => {
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

  const allData = useRef({
    major: "",
    year: "",
    time: "",
    semester: ""
  });
  

  const handleSubmit = async (data, address) => {
    const serializedBody = JSON.stringify(data);
    const result = await fetch(address, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedBody,
    })
      .then(response => response.ok && response.json())
      .then(json => {return json});

      return result;
  };

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [semester, setSemester] = useState('Fall 2025');
  const chatMessagesRef = useRef(null);

  const courses = {
    'IT 490': {
      code: 'IT 490-101',
      name: 'Systems Integration',
      credits: 3.00,
      location: 'GITC 3600',
      days: ['Tuesday'],
      time: '6:00 pm',
      endTime: '9:00 pm',
      color: 'it'
    },
    'IT 342': {
      code: 'IT 342-101',
      name: 'Cloud Administration',
      credits: 3.00,
      location: 'FMH 313',
      days: ['Wednesday'],
      time: '6:00 pm',
      endTime: '9:00 pm',
      color: 'it'
    },
    'IT 332': {
      code: 'IT 332-103',
      name: 'Digital Crime',
      credits: 3.00,
      location: 'CKB 226',
      days: ['Friday'],
      time: '6:00 pm',
      endTime: '9:00 pm',
      color: 'it'
    },
    'COM 312': {
      code: 'COM 312-007',
      name: 'Oral Presentation',
      credits: 3.00,
      location: 'FMH 405',
      days: ['Monday', 'Wednesday'],
      time: '1:00 pm',
      endTime: '2:30 pm',
      color: 'com'
    },
    'HSS 404': {
      code: 'HSS 404-003',
      name: 'Senior Seminar',
      credits: 3.00,
      location: 'CKB 315',
      days: ['Monday', 'Wednesday'],
      time: '4:00 pm',
      endTime: '5:30 pm',
      color: 'hss'
    }
  };

  const timeSlots = [
    '8:30 am', '9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am',
    '12:00 pm', '12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm',
    '4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm', '6:30 pm', '7:00 pm', '7:30 pm',
    '8:00 pm', '8:30 pm', '9:00 pm'
  ];
 

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionClick = (option) => {
    addMessage('user', option);

    const lastBotMessage = [...messages].reverse().find(msg => msg.type === 'bot');

    if (lastBotMessage) {
      if (lastBotMessage.text.includes('full-time or part-time')) {
        allData.current.time = option;
        setTimeout(() => {
          addMessage('bot', "What's your major?", [
            "Computer Science", "Financial Tech","Applied Math", "Other"
          ]);
        }, 500);
      } else if (lastBotMessage.text.includes('major')) {
        allData.current.major = option;
        setTimeout(() => {
          addMessage('bot', "What's your current academic standing?", [
            "Freshman", "Sophomore", "Junior", "Senior"
          ]);
        }, 500);
      } else if (lastBotMessage.text.includes('standing')) {
        allData.current.year = option;
        setTimeout(() => {
          addMessage('bot', "Which semester are you planning for?", [
            "Fall", "Spring"
          ]);
        }, 500);
      } else if (lastBotMessage.text.includes('semester')) {
        allData.current.semester = option;
        addMessage("bot", "Please wait while I retrieve the information for you");
        (() => {
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

          (async () => {
            try {
              const json = await handleSubmit(allData, import.meta.env.VITE_CHAT);
              clearInterval(interval);

              const courseObjects = json;
              if (!courseObjects) throw new Error("Invalid course data");

              const recommendedCourses = Object.values(courseObjects);
              setSelectedCourses(recommendedCourses);
              addMessage("bot", "Here are your recommended courses for the semester. If a course isn't showing up on the grid, that is because it was unable to calculate a proper time for that specific course.");
            } catch (err) {
              clearInterval(interval);
              console.error("Submission failed:", err);
              addMessage("bot", "Something went wrong while retrieving your courses.");
            }
          })();
        })();


        
      }
    }

    if (option.includes('(') && option.includes(')')) {
      const courseCode = option.split(' ')[0] + ' ' + option.split(' ')[1];
      addCourse(courseCode);
    }
  };

  const addMessage = (type, text, options = []) => {
    setMessages(prev => [...prev, { type, text, options }]);
  };

  const addCourse = (courseCode) => {
    if (!courses[courseCode]) return;

    if (selectedCourses.some(course => course.code.startsWith(courseCode))) {
      addMessage('bot', `You've already added ${courseCode} to your schedule.`);
      return;
    }

    setSelectedCourses(prev => [...prev, courses[courseCode]]);

    setTimeout(() => {
      addMessage('bot', `I've added ${courseCode} to your schedule.`);
    }, 500);
  };

  const removeCourse = (courseCode) => {
    setSelectedCourses(prev => prev.filter(course => course.code !== courseCode));
    addMessage('bot', `I've removed ${courseCode} from your schedule.`);
  };

  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  const getCourseForCell = (day, time) => {
    const timeToNumber = (str) => {
      const [hour, minPart] = str.split(':');
      const minute = parseInt(minPart);
      let hourNum = parseInt(hour);
      if (str.toLowerCase().includes('pm') && hourNum !== 12) hourNum += 12;
      if (str.toLowerCase().includes('am') && hourNum === 12) hourNum = 0;
      return hourNum + minute / 60;
    };
    
    //console.log(selectedCourses);
    return selectedCourses.find(course => {
      if (!course.days.includes(day)) return false;
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
        />
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







