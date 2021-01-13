import express from 'express';
import Playing from './playingModel';
import {catchAsync} from '../../middleware/errorHandler/catchAsync';

const router = express.Router();

router.get("/",catchAsync(async (req,res,next)=>{
  const playingMovies = await Playing.find();
  
  res.status(200).json({
    success: true,
    playingMovies
  })
}))
export default router;