const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
const colors = require('colors');
const errorHandler = require('./middleware/error');

//Load env files
dotenv.config({ path: './config/config.env' });
//Connect to database.
connectDB();

//Routes Files
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses');

const app = express();

//Body Parser
app.use(express.json());

//Dev loggin middleware.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//File upload.
app.use(fileupload());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount variables
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(
    `Server running is ${process.env.NODE_ENV} on port ${PORT} !`.green.inverse
  )
);

// Handle Unhandled Promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Promise: ${err.message}`);
  //Close server and exit process
  server.close(() => process.exit(1));
});
