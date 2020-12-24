import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import './db';

const optimizelyExpress = require('@optimizely/express');

dotenv.config();

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


app.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled(
    'movie_app_ca2',       // Feature key connecting feature to UI
    'yzj',           // String ID used for random percentage-based rollout
    {
      customerId: 20091571,   // Attributes used for targeted audience-based rollout
      isVip: true,
    }
  );

  res.status(200).send('Optimizely Express Example: ' +  (isEnabled ? 'You got the hello world feature!' : 'Feature off.'))
});

app.use(errHandler);

app.listen(port, () => {
  console.info(`Server running at ${port}`);
});

export default app;