const mongoose = require('mongoose');
const {stud_url, teach_url} = require('../connections')

const studentSchema = new mongoose.Schema({
    name: String,
    num: Number,
    mailid: String,
    password: String,
    isStudent: Boolean,
    classteacher: String

})

const student = stud_url.model('users', studentSchema);

const teacherSchema = new mongoose.Schema({
    name: String,
    num: Number,
    mailid: String,
    password: String,
    isStudent: Boolean
})

const teacher = teach_url.model('users', teacherSchema);

const teacherNew = stud_url.model('users1', teacherSchema);

module.exports = {student, teacher, teacherNew}