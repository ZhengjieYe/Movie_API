import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chalk from 'chalk'

dotenv.config();

// Connect to database
mongoose.connect(process.env.mongoDB);
const db = mongoose.connection;

db.on('error', (err) => {
    console.log(chalk.red(`database connection error: ${err}`));
});
db.on('disconnected', () => {
    console.log(chalk.yellow('database disconnected'));
});
db.once('open', () => {
    console.log(chalk.blue(`database connected to ${db.name} on ${db.host}`));
})