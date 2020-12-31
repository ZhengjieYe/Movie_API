import {getIsEnabled} from './getIsEnabled'
import AppError from '../errorHandler/appError'

export const optimizelyController = (name)=>{
  return function(req, res, next){
    const isEnabled = getIsEnabled(req, name,'yzj',20091571);
    if(isEnabled){
      next()
    }
    else {
      next(new AppError('Feature off by Optimizely.', 403))
    }
  }
}