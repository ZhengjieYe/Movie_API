import express from 'express';
import Upcoming from './upcomingModel';
import AppError from '../../middleware/errorHandler/appError'
import jwt from 'jsonwebtoken';
import User from '../users/userModel';
import upcomingModel from '../upcoming/upcomingModel';
import {catchAsync} from '../../middleware/errorHandler/catchAsync';
import {optimizelyController} from '../../middleware/optimizely/optimizelyController';

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

router.get("/",async (req, res, next)=>{
  const upcoming=await Upcoming.find();

  if (!upcoming){
    next(new AppError("No upcoming movies found", 404))
  }

  res.status(200).json(upcoming)
})

router.post("/watchlist", optimizelyController("movie_api_upcoming_watchlist"), authenticateJWT,catchAsync(
  async (req, res, next)=>{
    if(req.body.id===undefined) {
      res.status(403).json({
        success:false,
        message:"Please post movie id."
      })
    } else{
      const {username, role}=req.user;
      const newWatchlistMovie = req.body.id;
      const movie = await upcomingModel.findByMovieDBId(newWatchlistMovie);
      const user = await User.findByUserName(username);
      if(user.watchlist.indexOf(movie._id) !== -1){
        res.status(403).json({
          code:403,
          success: false,
          message:"Already in watchlist."
        })
      }else{
        await user.watchlist.push(movie._id);
        await user.save(); 
        res.status(201).json({
          success:true,
          watchlist: user.watchlist
        }); 
      }
    }
  }
));

router.get("/watchlist",optimizelyController("movie_api_upcoming_watchlist"), authenticateJWT, catchAsync(async (req,res,next)=>{
  const{username, role}=req.user;
  const user = await User.findByUserName(username).populate('watchlist');
  res.status(200).json({
    success:true,
    watchlist:user.watchlist?user.watchlist:[]
  })
}));

router.post("/watchlist/validate_with_login", optimizelyController("movie_api_upcoming_watchlist"), catchAsync(async (req,res,next)=>{
  const {username, password} = req.body;
  const user = await User.findByUserName(username).populate('watchlist');
  if(!user){
    next(new AppError("Invalid user!"),403)
  }else{
    user.comparePassword(password, (err, isMatch)=>{
      if (isMatch && !err) {
        res.status(200).json({
          success: true,
          watchlist:user.watchlist?user.watchlist:[]
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      }
    })
  }
}))

router.delete("/watchlist/:id", optimizelyController("movie_api_upcoming_watchlist"), authenticateJWT, catchAsync(async (req,res,next)=>{
  const id=req.params.id;
  const {username, role} = req.user;
  const movie = await upcomingModel.findByMovieDBId(id);
  const user = await User.findByUserName(username);
  if(user.watchlist.indexOf(movie._id) !== -1){
    const index = user.watchlist.indexOf(movie._id);
    await user.watchlist.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      delete: true,
      watchlist: user.watchlist
    })
  }else{
    res.status(403).json({
      success: false,
      message: "The movie not in the watchlist!"
    })
  }
}))
export default router;