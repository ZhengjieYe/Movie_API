import express from 'express';
import Actor from './popularActor';
import {catchAsync} from '../../../middleware/errorHandler/catchAsync'
import jwt from 'jsonwebtoken';
import User from '../../users/userModel';
import Review from './review';
import AppError from '../../../middleware/errorHandler/appError';

const router = express.Router();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.SECRET, (err, user) => {
          if (err) {
              next(new AppError("Invalid Token", 403));
          }
          req.user = user;
          next();
      });
  } else {
      next(new AppError("Lack of Token", 401));
  }
};

router.get("/",async (req,res,next)=>{
  let actors = await Actor.find();
  const filter = req.query.filter;
  const sort = req.query.sort;
  if(sort === 'name'){
    actors=actors.sort((a,b)=>{
      if(a.name>b.name) return 1;
      if(a.name<b.name) return -1;
      if(a.name===b.name) return 0;
      return 0
    })
  }
  if(sort === 'popularity'){
    actors=actors.sort((a,b)=>{
      if(a.popularity>b.popularity) return -1;
      if(a.popularity<b.popularity) return 1;
      if(a.popularity===b.popularity) return 0;
      return 0
    })
  }
  if(filter === "male"){
    actors=actors.filter(a=>a.gender===2);
  }
  if(filter === "female"){
    actors=actors.filter(a=>a.gender===1);
  }
  if(!actors){
    res.status(404).json({
      success: false,
      message: "Actor not found!"
    })
  }else{
    res.status(200).json({
      success: true,
      actors: actors
    })
  }
})

router.get("/:id/known_for_movies",catchAsync(async (req,res,next)=>{
  const id=req.params.id;
  const actor =await Actor.findOne({id:id}).populate("known_for");
  if(!actor){
    res.status(404).json({
      success: false,
      message: "Can not find the actor!"
    })
  }else{
    res.json({
      success: true,
      known_for: actor.known_for
    });
  }
}));

router.get("/:id/reviews", catchAsync(async (req, res, next)=>{
  const id = req.params.id;
  const actor = await Actor.findOne({id:id}).populate("reviews");
  if(actor){
    res.status(200).json({
      success: true,
      reviews: actor.reviews
    })
  }else{
    res.status(404).json({
      success: false,
      message: "Actor not found."
    })
  }
}))

router.post("/:id/review", authenticateJWT, catchAsync(async (req, res, next)=>{
  const id = req.params.id;
  const {username, role}=req.user;
  const content = req.body.content;
  const date=new Date();
  const user = await User.findByUserName(username);
  const actor = await Actor.findOne({id:id});
  if(actor){
    const newReview ={
      id,
      user_id:user.id,
      content,
      date:date.toString()
    }
    await Review.collection.insertOne(newReview,async (err,result)=>{
      if(err){
        res.status(403).json({
          success: true,
          message:err
        })
      }
      await actor.reviews.push(result.insertedId);
      await actor.save();
      res.send(actor);
    })
  }else{
    res.status(404).json({
      success: false,
      message: "Can not find the actor!"
    })
  }
}))

router.put('/:id/review', authenticateJWT, catchAsync(async (req,res,next)=>{
  const id = req.params.id;
  const {username, role} = req.user;
  const newContent = req.body.content;
  const reviewId = req.body.id;
  const review = await Review.findById(reviewId);

  if(review){
    review.content=newContent;
    const newDate = new Date();
    review.date=newDate.toString();
    await review.save();
    res.status(200).json({
      success: true,
      message: "Change review suceessfully.",
      newReview:review
    })
  }else{
    res.status(404).json({
      success: false,
      message: "Can not find the review!"
    })
  }

}))

router.delete('/:id/review/:review_id',authenticateJWT,catchAsync(async (req,res,next)=>{
  const {username, role}=req.user;
  const id = req.params.id;
  const reviewId = req.params.review_id;
  const actor = await Actor.findOne({id:id});
  if(actor){
    const index = actor.reviews.indexOf(reviewId);
    if(index===-1){
      res.status(404).json({
        success: false,
        message: "Review not found."
      })
    }else{
      const review = await Review.findById(reviewId);
      const user = await User.findByUserName(username);
      if(role==="admin" || review.user_id === user.id){
        actor.reviews.splice(index,1);
        await actor.save();
        await Review.findByIdAndDelete(reviewId,(err,doc)=>{
          if(err) console.log(`Something is wrong:${err}`);
        })
        res.status(200).json({
          success: true,
          message: `Delete successfully by ${role} - ${username}!`
        });
      }else{
        res.status(403).json({
          success: false,
          message: `Delete failed by ${role} - ${username}.`
        })
      }
    }
  }else{
    res.status(404).json({
      success: false,
      message: "Can not find the actor!"
    })
  }
  
  
}))
export default router;
