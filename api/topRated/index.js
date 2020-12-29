import express from 'express';
import TopRated from './topRatedModel';
import AppError from '../../middleware/errorHandler/appError'

const router = express.Router();

router.get("/",async (req,res,next)=>{
  const page=req.query.page>0?req.query.page:1;
  const topRated=await TopRated.find();
  const start=20*(page-1);
  if (!topRated){
    next(new AppError("No topRated found", 404))
  } else if(start >=topRated.length ){
    next(new AppError("Page number is too long!", 404))
  }else{
    let end=start+20;
    end=(end>topRated.length)?topRated.length:end;
    const returnRated= topRated.slice(start,end);
    res.status(200).json(returnRated)
  }
})
export default router;