const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const api = require('./routes/api/api');
const emailRouter = require('./routes/api/email');
const generateFile = require('./routes/api/generate_file');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Token, Authorization");
  next();
});

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve up static assets (usually on heroku)
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }

// function reactAppMiddleware(req, res, next) {
//   if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//     // if it is an ajax/xhr request, you can even right your custom logic, maybe look for some header
//     next();
//   } else {
//     // Return react app
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   }
// }

// app.use(reactAppMiddleware)

app.use('/api/filters', api);
app.use('/api/email', emailRouter);
app.use('/api/file', generateFile);

app.use(express.static(path.join(__dirname, './client', 'build')));

// If no API routes are hit, send the React app
app.use("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Start the API server
app.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});