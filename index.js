import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import './db';
import AppError from './middleware/errorHandler/appError'
import movieRouter from './api/movies'
import usersRouter from './api/users';
import genresRouter from './api/genres';
import upcomingRouter from './api/upcoming';
import topRatedRouter from './api/topRated';

const optimizelyExpress = require('@optimizely/express');
// import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import devOrProd from './middleware/errorHandler/devOrProdError'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import passport from './authenticate';
// import helmet from 'helmet'
import {getIsEnabled} from './middleware/optimizely/getIsEnabled'
import {optimizelyController} from './middleware/optimizely/optimizelyController'

import {loadUsers, loadMovies, loadGenres, loadUpcomingMovies, loadTopRatedMovies} from './seedData';
if (process.env.SEED_DB) {
  loadUsers();
  loadMovies();
  loadGenres();
  loadUpcomingMovies();
  loadTopRatedMovies();
}


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' })

dotenv.config();
process.on('uncaughtException', err => {
  console.log(chalk.red(err.name, err.message));
  console.log(chalk.yellow('UNCAUGHT EXCEPTION! 💥 Shutting down...'));

  process.exit(1);

});

const app = express();

const port = process.env.PORT;

const optimizely = optimizelyExpress.initialize({
  sdkKey: process.env.OPTIMIZELY,
  datafileOptions: {
    autoUpdate: true,      // Indicates feature flags will be auto-updated based on UI changes 
    updateInterval: 1*1000 // 1 second in milliseconds
  },
  logLevel: 'info',        // Controls console logging. Can be 'debug', 'info', 'warn', or 'error'
});

app.use(optimizely.middleware);

// app.use(helmet());

//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(morgan('combined', {
  interval: '7d',
  stream: accessLogStream
}));

app.get('/', function(req, res, next) {
  const isEnabled = getIsEnabled(req, 'movie_app_ca2','yzj',20091571);

  res.status(200).send('Optimizely Express Example: ' +  (isEnabled ? 'You got the hello world feature!' : 'Feature off.'))
});


// options deleted by YZJ 20091571
// const specs = swaggerJsdoc(options);

// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(specs, { explorer: true })
// );
const swaggerDocument = require('./public/api-docs.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));



app.use(passport.initialize());

app.use('/api/movies', optimizelyController('movie_api_movies'), passport.authenticate('jwt', {session: false}), movieRouter);
app.use('/api/users', optimizelyController('movie_api_users'), usersRouter);
app.use('/api/genres', optimizelyController('movie_api_genres'), genresRouter);
app.use('/api/upcoming', optimizelyController('movie_api_upcoming'), upcomingRouter);
app.use('/api/topRated', optimizelyController('movie_api_top'), topRatedRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(devOrProd)

process.on('unhandledRejection', err => {
  console.log(chalk.red(err.name, err.message));
  console.log(chalk.yellow('UNHANDLED REJECTION! 💥 Shutting down...'));
  process.exit(1);
});

const server=app.listen(port, () => {
  console.info(chalk.blue(`Server running at ${port}`));
});

module.exports=server;