import AppError from '../errorHandler/appError'
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
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