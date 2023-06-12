import connectDB from './config/db.js';
import generateFile from './routes/api/generate_file.js';
import api from './routes/api/api.js';
import mongo_controller from './controllers/controller_DB.js';
import express from 'express';
import dotenv from 'dotenv';
import emailRouter from './routes/api/email.js';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dotenv config
dotenv.config();

// Connect database
connectDB();

const app = express();
app.use(bodyParser.json({ limit: '500kb' }));

const PORT = process.env.PORT || 8080;

// Define headers used for API requisitions
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Token, Authorization');
  next();
});

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Define routes API here
app.use('/api/filters', api);
app.use('/api/email', emailRouter);
app.use('/api/file', generateFile);
app.use('/api/mongo', mongo_controller);
app.use(express.static(path.join(__dirname, './client', 'build')));

// If no API routes are hit, send the React app
app.use('/', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Start the API server, listen method to run project on http://localhost:8080
app.listen(PORT, console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
