import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel'
import { use } from 'passport';
import AppError from '../../middleware/errorHandler/appError'

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

const router = express.Router(); // eslint-disable-line
let refreshTokens = [];

// Get all users
router.get('/', authenticateJWT, (req, res, next) => {
  const {role}=req.user;

  if(role !== 'admin'){
    next(new AppError("You do not have permission to access", 403))
  }
  User.find().then(users =>  res.status(200).json(users)).catch(next);
});

// Register OR authenticate a user
router.post('/login', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({
      success: false,
      msg: 'Please pass username and password.',
    });
  }
  const user = await User.findByUserName(req.body.username).catch(next);
    if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        const token = jwt.sign({username:user.username, role:user.role}, process.env.SECRET);

        const refreshToken = jwt.sign({ username: user.username, role: user.role }, process.env.REFRESH_SECRET);

        refreshTokens.push(refreshToken);
        // return the information including token as JSON
        res.status(200).json({
          success: true,
          token: 'BEARER ' + token,
          refreshToken
        });
      } else {
        res.status(401).json({
          code: 401,
          msg: 'Authentication failed. Wrong password.'
        });
      }
    });
});

router.post('/token',(req,res)=>{
  const {token}=req.body;
  if (!token) {
      return res.status(401).json({
        success:false,
        message:"No token found in body!"
      });
  } else if (!refreshTokens.includes(token)) {
      return res.status(403).json({
        success:false,
        message:"Token is invalid!"
      });
  } else{
    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
      if (err) {
          return res.sendStatus(403);
      }
      const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.SECRET, { expiresIn: '20m' });
      res.status(200).json({
        success: true,
        accessToken
      });
    });
  }
})

router.post('/logout',(req,res,next)=>{
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);

  res.status(200).json({
    success:true,
    message:"Logout successfully."
  });
})

router.post('/register', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({
      success: false,
      msg: 'Please pass username and password.',
    });
  }
  const passReg=/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
  if(!passReg.test(req.body.password)){
    res.status(401).json({
      code:401,
      msg:'Bad password format.'
    })
  }else{
    const newUser={...req.body, "role":"normal"};
    await User.create(newUser).catch(next);
    res.status(201).json({
      code: 201,
      msg: 'Successful created new user.',
    });
  }
});

// Update a user
router.put('/:id',  (req, res, next) => {
    if (req.body._id) delete req.body._id;
     User.update({
      _id: req.params.id,
    }, req.body, {
      upsert: false,
    })
    .then(user => res.json(200, user)).catch(next);
});

//Add a favourite. No Error Handling Yet. Can add duplicates too!
router.post('/:userName/favourites', async (req, res, next) => {
  try{
    const newFavourite = req.body.id;
    const userName = req.params.userName;
    const movie = await movieModel.findByMovieDBId(newFavourite);
    const user = await User.findByUserName(userName);
    if(user.favourites.indexOf(movie._id) !== -1){
      res.status(401).json({
        code:401,
        msg:"Already in favourites."
      })
    }else{
      await user.favourites.push(movie._id);
      await user.save(); 
      res.status(201).json(user); 
    }
  }catch(err){
    next(err)
  }
});

router.get('/:userName/favourites', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('favourites').then(
    user => res.status(201).json(user.favourites)
  ).catch(next);
});


export default router;