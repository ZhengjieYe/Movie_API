import dotenv from 'dotenv';
import express from 'express';
import moviesRouter from './api/movies';
import bodyParser from 'body-parser';
import './db';
import {loadUsers, loadMovies} from './seedData';
import usersRouter from './api/users';
import genresRouter from './api/genres'
import session from 'express-session';
import passport from './authenticate';

const optimizelyExpress = require('@optimizely/express');

dotenv.config();

if (process.env.SEED_DB) {
  loadUsers();
  loadMovies();
}

const errHandler = (err, req, res, next) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */
  if(process.env.NODE_ENV === 'production') {
    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
};

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





//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//session middleware
app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));

// initialise passport​
app.use(passport.initialize());
// Add passport.authenticate(..)  to middleware stack for protected routes​
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/genres', genresRouter)

app.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled(
    'movie_app_ca2',       // Feature key connecting feature to UI
    'yzj',           // String ID used for random percentage-based rollout
    {
      customerId: 20091571,   // Attributes used for targeted audience-based rollout
      isVip: true,
    }
  );

  res.send('Optimizely Express Example: ' +  (isEnabled ? 'You got the hello world feature!' : 'Feature off.'))
});

app.use(errHandler);

app.listen(port, () => {
  console.info(`Server running at ${port}`);
});