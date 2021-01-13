import express from 'express';
const router = express.Router();
import {catchAsync} from '../../middleware/errorHandler/catchAsync'

import Rate from './rateModel'
import Movie from '../movies/movieModel'

router.get("/",catchAsync(async (req,res)=>{
  const {username,role}=req.user;
  let rate = await Rate.find({username:username});
  rate=await Promise.all(rate.map(async (m)=>{
    const movie=await Movie.findOne({id:m.movie_id}).lean(true);
    return {rating:m.rating,...movie}
  }));
  res.status(200).json({
    success:true,
    ratedMovies:rate
  })
}))

router.post("/",catchAsync(async (req,res,next)=>{
  const {username, role}=req.user;
  const {id, rating}=req.body;
  const movie = await Movie.findOne({id:id});
  if(!movie){
    res.status(404).json({
      success: false,
      message: "Movie not found!"
    })
  }else{
    let rate = await Rate.findOne({username:username, movie_id:movie.id});
    let incomingRate={
      username:username,
      movie_id:movie.id,
      rating
    };
    if(!rate){
      await Rate.collection.insertOne(incomingRate,(err,doc)=>{
        if (err) console.log(err);
      })
    }else{
      await Rate.updateOne({username:username, movie_id:movie.id},{rating},(err)=>{if (err) console.log(err)})
    }

    res.status(200).json({
      success:true,
      rate:incomingRate
    })
  }
}))

export default router;
