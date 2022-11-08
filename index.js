const express = require('express')
const mongoose = require('mongoose')
const routeindex = require('./router/routeindex.js');
const app = express();

app.use(express.json())

app.use(routeindex);

app.listen(5000 ,()=> {
    console.log("Server is running on localhost 5000");
})