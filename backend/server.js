require('dotenv').config({path:'../.env'});
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_RICHIE_KEY
})

// Data Base

const db= mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});
//**Testing */
app.post("/ReceiveResponse", (req,res) =>{
    const choices = req.body.current;
    choices.code = 0;
console.log(choices);
//const test = JSON.parse(req);
//console.log(test);
return res.json(choices);
}


);
/***
 * Gets up to 10 courses if they have a professor with a rating, and if it doesn't have them, defaults to 10 courses that work!
 */
const getAllCourses = (c) => {
    return new Promise((resolve, reject) => {
        const mainSql = `
            SELECT * FROM Courses C, Prof_Ratings P 
            WHERE P.Instructor = C.Instructor 
            AND C.Course = ? 
            AND NOT (Times = ?) AND P.Instructor IN (SELECT Instructor FROM Courses WHERE Course = ?) 
            ORDER BY P.rating DESC 
            LIMIT 17
        `;

        db.query(mainSql, [c,"TBA", c], (err, results) => {
            if (err) {
                console.error("DB error in main query:", err);
                return reject(err);
            }

            if (results && results.length > 0) {
                return resolve(results);
            }

            const fallbackSql = `
                SELECT * FROM Courses C Where C.Course = ? AND NOT (Times = ?)
                LIMIT 17
            `;

            db.query(fallbackSql,[c,"TBA"] ,(err, results) => {
                if (err) {
                    console.error("DB error in fallback query:", err);
                    return reject(err);
                }

                console.log(`No results for ${c}, using fallback.`);
                resolve(results);
            });
        });
    });
};

/**
 * 
 * MIGHT NOT BE NEEDED.
 * Needs to returns all the course results with different tags
 * MTRFS
 * courseResults are formatted as follows
 * [[{Days},{}],[{},{}],[{},{}],[{},{}],[{},{}],[{},{}],[{},{}]]
 * [{Days},{}],[{},{}],[{},{}],[{},{}],[{},{}],[{},{}],[{},{}]
 * {Days},{}
 * slow but better than not being cleaned, ideally would've been the best choice to have cleaned it when uploading/parsing initially, but that's okay.(For now)
 * @param {[]} cR 
 */
const cleanUpCourses = async (cR) =>{
    //console.log(cR)
    //console.log(cR.length)
    for (let i = 0; i < cR.length; i++) {
        let currentCourses = cR[i]
        for (let j = 0; j < currentCourses.length; j++) {
            let currentCourseObject = currentCourses[j]
            if(currentCourseObject.Times == 'TBA'){
                continue
            }
            let days = currentCourseObject.Days
            //console.log(currentCourseObject)
            //console.log(days)
            
            let allDays = ""
            for(let k = 0;k< days.length ;k++){
            let c = days[k];
                switch (c) {
                    case "M":  allDays += "Monday,";
                        break;
                    case "T":  allDays += "Tuesday,";
                        break;
                    case "W":  allDays += "Wednesday,";
                        break;
                    case "R":  allDays += "Thursday,";
                        break;
                    case "F":  allDays += "Friday,";
                        break;
                    case "S":  allDays += "Saturday,";
                        break;
                }
            }
            currentCourses[j].days = allDays.slice(0, -1);
            //console.log(currentCourses[j].days)
        
        }
    }

    

};

const getCourseByCRN = (crn) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Courses C, Prof_Ratings P WHERE P.Instructor = C.Instructor AND P.instructor in (SELECT instructor FROM Courses WHERE crn = ?) ";
        db.query(sql, [crn], (err, results) => {
            if (err) {
                console.error("DB error in getCourseByCRN:", err);
                return reject(err);
            }
            resolve(results[0] || null);
        });
    });
};



// Chat
app.post("/chat", async (req, res) => {
    const { current } = req.body;

    const query = `
The student is a ${current.year}  majoring in ${current.major} studying ${current.time} in the ${current.semester} semester. 
Please ensure that if asked for electives, that selected departments are actually electives and NOT classes on the schedule aligned with the major outline.
For example if a Cs lvl 300+ elective is asked, do not choose something like cs332 or cs435 since those are on the major outline schedule for cs. 
That doesn't only apply to cs, this applies to ALL statements that mention similar structure to the departments.
 IMPORTANT, Try to avoid independent studies. Ensure you follow the requested schedule outline for the respective major! 
 Remember, a technical course is CS/IT/IS and level 200, and a "Free Elective" is literally any course that isn't on the major outline.
 Once again make sure to follow the requested schedule for the related major.    `;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] Processing: "${query}"`);

        const thread = await openai.beta.threads.create();

        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: query,
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: process.env.DEP_RICHIE_ASSISTANT_API_KEY,
        });

        if (run.status === "completed") {

            const messages = await openai.beta.threads.messages.list(run.thread_id);

            const responses = messages.data
                .filter((message) => message.role === "assistant")
                .map((message) => message.content[0]?.text?.value || "");

            console.log("Finised: OK");
            
            //console.log(responses);
            /*
            {
                c1: 'CS100',
                c2: 'MATH111',
                c3: 'ENGL101',
                c4: 'PHYS111',
                c5: 'PHYS111A',
                c6: 'FYSSEM',
                c7: 'N/A'
            }
            */

            let cC = [];
            try {
            const entireResponse = JSON.parse(responses);

                for(const c in entireResponse){
                    cC.push(entireResponse[c]);
                }
                //console.log(entireResponse);
                //console.log("Deparment Values next:");//Need to account for N/A and FYS Sem should be combined
                //console.log(cC);
            } catch (err) {
                console.error("Failed to parse assistant response:", responses[0]);
                return res.status(500).json({ error: "Invalid assistant response format" });
            }
            const courseResults = await Promise.all(
                cC.map((c) =>
                    getAllCourses(c).catch((err) => {
                        console.error(`Error querying CRN ${c}:`, err);
                        return null;
                    })
                )
            );


    function timeToMinutes(timeStr) {
    if (typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
    const [time, meridian] = timeStr.trim().split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
    }

    function parseTimeRange(timeRange) {
    if (typeof timeRange !== 'string' || !timeRange.includes(' - ')) return { start: 0, end: 0 };
    const [start, end] = timeRange.split(' - ');
    return { start: timeToMinutes(start), end: timeToMinutes(end) };
    }

function parseDays(daysStr) {
  if (typeof daysStr !== 'string') return new Set();
  return new Set(daysStr.split('').map(d => d.trim()));
}

function hasConflict(newDays, newTime, usedSlots) {
  const { start, end } = parseTimeRange(newTime);
  return usedSlots.some(({ time, days }) => {
    const { start: s, end: e } = parseTimeRange(time);
    const shared = [...parseDays(days)].some(d => parseDays(newDays).has(d));
    return shared && start < e && s < end;
  });
}

function isHonors(title) {
  return /honors/i.test(title || '');
}

function blankEntry(dept = "N/A") {
  return {
    name: "N/A",
    professor: "N/A",
    code: dept,
    crn: "N/A",
    time: "N/A",
    days: [],
    difficulty_rating: "N/A",
    overall_rating: "N/A",
    credits:"N/A",
    endTime:"N/A",
    location:"N/A",
    tag:"N/A"

  };
}

function buildScheduleWithRetry(cC, courseResults, allowHonors = false) {
  const usedSlots = [];

  const tryBuild = (index, current) => {
    if (index === 7) return current;

    const key = `c${index + 1}`;
    const dept = cC[index];
    if (dept === "N/A") {
      current[key] = blankEntry();
      return tryBuild(index + 1, current);
    }

    const candidates = (courseResults[index] || []).slice(0, 10);
    for (const c of candidates) {
      const dayStr = c.Days || "N/A";
      const timeStr = c.Times || "N/A";
      if (timeStr === "TBA" || timeStr === "Online") continue;
      if (!allowHonors && isHonors(c.Title)) continue;
      if (hasConflict(dayStr, timeStr, usedSlots)) continue;

      usedSlots.push({ days: dayStr, time: timeStr });

      current[key] = {
        name: c.Title,
        professor: c.Instructor || "N/A",
        code: dept,
        crn: c.CRN,
        time: timeStr.toLowerCase(),
        days: dayStr,
        difficulty_rating: c.difficulty || "N/A",
        overall_rating: c.rating || "N/A",
        credits: c.Credits || 0,
        location: c.Location || "N/A",
        color:dept.replace(/[^a-zA-Z ]/g, '').toLowerCase()
      };

      const result = tryBuild(index + 1, current);
      if (result) return result;

      usedSlots.pop(); 
    }

    current[key] = blankEntry(dept);
    return tryBuild(index + 1, current);
  };

  return tryBuild(0, {});
}

function validateSchedule(schedule, allowHonors = false) {
  const keys = Object.keys(schedule);
  const errors = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = schedule[keys[i]];
      const b = schedule[keys[j]];
      if (hasConflict(a.days, a.time, [{ days: b.days, time: b.time }])) {
        errors.push(`Conflict between ${keys[i]} and ${keys[j]}`);
      }
    }
  }

  if (!allowHonors) {
    for (const key of keys) {
      const course = schedule[key];
      if (isHonors(course.name)) {
        errors.push(`Honors course used in ${key} (\"${course.name}\")`);
      }
    }
  }

  return errors.length === 0 ? schedule : null;
}



const finalSchedule = buildScheduleWithRetry(cC, courseResults, false);
const result = validateSchedule(finalSchedule);
//Have to split times for results

for(const obj in result){
    if(result[obj].code == "N/A"){
        delete result[obj];
        continue
    }
    if(result[obj].credits !== "N/A"){
    result[obj].credits = parseInt(result[obj].credits);
    }
    else{
        result[obj].credits = 0;
    }
    if(result[obj].time == "N/A"){
        continue
    }
    const builder =[]

    for(let a of result[obj].days){
        switch(a){
            case "M":
                builder.push("Monday");
                break;
            case "T":
                builder.push("Tuesday");
                break;
            case "W":
                builder.push("Wednesday");
                break;
            case "R":
                builder.push("Thursday");
                break;
            case "F":
                builder.push("Friday");
                break;
            case "S":
                builder.push("Saturday");   
                break;

            }
    }
    result[obj].days = builder;

    const [startRaw, endRaw] = result[obj].time.split("-");
    const time = startRaw.trim().toLowerCase();
    const endTime = endRaw.trim().toLowerCase();

    result[obj].time = time;
    result[obj].endTime = endTime;
    
}

console.log(result)
return res.json(result)

        
        
           


    }else{
        console.log("Run status error encountered. " + run.status);
    }} catch (error) {
        console.error("Error with OpenAI API:", error);
        return res.status(500).json({ error: "Failed to process the query" });
    }
    
});

app.get("/",(re,res)=> {
    return res.json("From backend side");
});

app.listen(40006,()=>{
    console.log("listening");
});
