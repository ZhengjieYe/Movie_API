import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import './db';
import AppError from './middleware/errorHandler/appError'
import testRouter from './api/test'

const optimizelyExpress = require('@optimizely/express');
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import devOrProd from './middleware/errorHandler/devOrProdError'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import helmet from 'helmet'

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

app.use(helmet());

//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(morgan('combined', {
  interval: '7d',
  stream: accessLogStream
}));

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


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "YZJ's Movie APP Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a Movie API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "ZhengjieYe",
        email: "20091571@mail.wit.ie",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/",
      },
    ],
  },
  apis: ["./api/**/index.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);


app.use("/test/",testRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(devOrProd)

process.on('unhandledRejection', err => {
  console.log(chalk.red(err.name, err.message));
  console.log(chalk.yellow('UNHANDLED REJECTION! 💥 Shutting down...'));
  process.exit(1);
});

app.listen(port, () => {
  console.info(chalk.blue(`Server running at ${port}`));
});

export default app;