const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
//Routes Files

const bootcamps = require('./routes/bootcamp');
//Load env files
dotenv.config({ path: './config/config.env' });

const app = express();
//Dev login middleware.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount variables
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running is ${process.env.NODE_ENV} on port ${PORT} !`)
);
