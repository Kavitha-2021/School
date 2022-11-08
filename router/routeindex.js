const express = require('express');
const Route = express.Router();
const controlindex = require('../controller/controlindex');


Route.post('/login', controlindex.savename);

Route.post('/signup', controlindex.getname);

Route.get('/auth', controlindex.authmail);

Route.post('/classallocation', controlindex.classallot);

Route.get('/details', controlindex.getTeacher);

Route.get('/info', controlindex.getDetails);

module.exports = Route;
