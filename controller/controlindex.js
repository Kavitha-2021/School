const express = require('express');
const {student, teacher, teacherNew} = require('../models/model');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports.savename = async (req, res) => {
    if(req.body.isStudent) 
    {
       var stud = new student({
            name: req.body.name,
            num: req.body.num,
            mailid: req.body.mailid,
            password: req.body.password,
            isStudent: req.body.isStudent,
            classteacher: req.body.classteacher
        });
        await stud.save();
        res.status(200).json({
            message: "Student details Added Successfully!"
        })
    }
    else
    {
        var teach = new teacher({
            name: req.body.name,
            num: req.body.num,
            mailid: req.body.mailid,
            password: req.body.password,
            isStudent: req.body.isStudent
        });
        await teach.save();
        res.status(200).json({
            message: "Teacher details Added Successfully!"
        })
    }
}

module.exports.getname = async (req, res) => {
    if(req.body.isStudent == true)
    {
        const mail1 = await student.findOne({mailid: req.body.mailid});
        
        if(mail1 != null)
        {
            if((mail1.password) == (req.body.password))
            {
            const mail = {mailid: req.body.mailid}
            const accessToken = jwt.sign(mail, process.env.ACCESS_TOKEN_SECRET)
            res.json({accessToken: accessToken})
            }
            else
            {
            res.status(400).json({
                message: "Invalid Student Password"
            })
            }
        }
        else 
        {
            res.status(400).json({
                message: "Incorrect Student mailid"
            })
        }
    }
    else
    {
        const mail2 = await teacher.findOne({mailid: req.body.mailid});
        if(mail2 != null)
        {
            if((mail2.password) == (req.body.password))
            {
                const mail = {mailid: req.body.mailid}
                const accessToken = jwt.sign(mail, process.env.ACCESS_TOKEN_SECRET)
                res.json({accessToken: accessToken})
            }
            else
            {
                res.status(400).json({
                    message: "Invalid Teacher Password"
                })
            }
        }
        else
        {
            res.status(400).json({
                message: "Incorrect Teacher mailid"
            })
        }
    }
}

module.exports.authmail = ((req, res) => {
    console.log("Inside Authentication");
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) res.send(400).json({
        message: "Error"
    })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if(err) res.send("Error")
        else res.send("Successfully verified")
    })
})

module.exports.classallot = async (req, res) => {
    
    var classstud = req.body.arrofstud;
    var a = b = 0;
    for(var i = 0; i < classstud.length; i++)
    {
        var myObj = {id: classstud[i].id, classteacher: req.body.tid}
        var stud = await student.updateOne({_id: myObj.id},{$set: myObj})
        console.log(stud);
        if(stud != null) a++; 
        else b++;
    }
    if(a!=0) res.send(a+" Updated");
    if(b!=0) res.send(b+" Not Updated");
}

module.exports.getTeacher = async (req, res) => {
    var result;
    result = await teacherNew.aggregate([
        {
            $lookup:
            {
                from: "users",
                localField: "teacherid",
                foreignField: "classteacher",
                as: "Students"
            }
        }
    ])
    //res.send(result)
    let limit = parseInt(req.query.limit);
    let search = (req.query.search);
    let order = parseInt(req.query.order) || 1;
    if(search == undefined && limit != undefined)
    {
    const posts = await teacherNew.find().sort({name: order}).limit(limit);
    res.send(posts);
    }
    else if(search != undefined && limit == undefined)
    {
    const posts1 = await teacherNew.find({name: search}).sort({name: order});
    res.send(posts1);
    }
    else
    {
    var posts2 = await teacherNew.find({name: {$regex: search, $options: "i"}}).sort({name: order}).limit(limit);
    res.send(posts2);
    }
}

module.exports.getDetails = async (req, res) => {
    let search = req.query.search || "";
    var myObj = {$regex: search, $options: "i"};
    var temp, temp1;
    temp = await student.aggregate([
        {
            $lookup:
            {
                from: "users1",
                localField: "classteacher",
                foreignField: "teacherid",
                as: "teacherDetails"
            }
        },
        {
            $match: {name: myObj}
        },
        {
            $project: {_id: 0,
                       studentname: "$name",
                       teachername: "$teacherDetails.name"
                     }
        },
        {
            $unwind: "$teachername"
        }
    ])
    
    temp1 = await teacherNew.aggregate([
        {
            $lookup:
            {
                from: "users",
                localField: "teacherid",
                foreignField: "classteacher",
                as: "studentDetails"
            }
        }
    ])
    var output = temp1.filter((obj) => obj.name.includes(search));
    var arr = [];
    if(output.length >= 0 && output != undefined )
    {
        for(var i = 0; i < output.length; i++)
        {
            var myobj = {name: output[i].name}
            var duparr = [];
            var len = output[i].studentDetails.length;
            // console.log(len);
            for(var j = 0; j < len; j++)
            {
                duparr.push(output[i].studentDetails[j].name);
            }
            arr.push({
                ...myobj, 
                studentName: duparr
            })
        }
    }
    if(temp != "" && temp1 == "")
    {
        res.status(200).json({
            studentStatus: " Students Data Fetched",
            studentData: temp,
            teacherStatus: "No Teachers Found",
            teacherData: temp1
        })
    }
    else if(temp == "" && temp1 != "")
    {
        res.status(200).json({
            studentStatus: "No Students Found",
            studentData: temp,
            teacherStatus: "Teachers Data Fetched",
            teacherData: arr
        })
    }
    else if(temp == "" && temp1 == "")
    {
        res.status(200).json({
            studentStatus: "No Students Found",
            studentData: temp,
            teacherStatus: "No Teachers Found",
            teacherData: temp1
        })
    }
    else 
    {
        res.json({
            studentStatus: " Students Data Fetched",
            studentData: temp,
            teacherStatus: "Teachers Data Fetched",
            teacherData: arr
        })
    }
}