require('dotenv').config({path:'../.env'});
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
//const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// Data Base

const db= mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

app.get('/checkUserExist',(req,res)=> {
    const sql = "Select * FROM User";
    db.query(sql,(err,data)=>{
        if(err) return res.json(err);
        return res.json(data);
    });
});

app.get("/",(re,res)=> {
    return res.json("From backend side");
});

app.listen(40006,()=>{
    console.log("listening");
});
