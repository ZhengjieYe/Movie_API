import express from 'express';
import Upcoming from './upcomingModel';
import AppError from '../../middleware/errorHandler/appError'

const router = express.Router();

router.get("/",async (req, res, next)=>{
  const upcoming=await Upcoming.find();

  if (!upcoming){
    next(new AppError("No upcoming movies found", 404))
  }

  res.status(200).json(upcoming)
})

export default router;