import express from 'express';
import Genre from './genresModel';
import AppError from '../../middleware/errorHandler/appError'

const router = express.Router();

router.get("/",async (req, res, next)=>{
  const genres=await Genre.find();

  if (!genres){
    next(new AppError("No genres found", 404))
  }

  res.status(200).json(genres)
})

export default router;