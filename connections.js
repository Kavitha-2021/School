const mongoose = require('mongoose')

stud_url = mongoose.createConnection("mongodb://localhost:27017/student");

teach_url = mongoose.createConnection("mongodb://localhost:27017/teacher");

module.exports = {stud_url, teach_url};