import express from 'express';
import { getPeopleMovieCredits, getPeopleDetail } from '../tmdb-api';
import Movie from '../movies/movieModel'
import User from '../users/userModel'

const router = express.Router();

router.get('/movies',async (req,res,next)=>{
  const {username,role}=req.user;
  const user=await User.findByUserName(username).populate('favourites');
  const favourites = user.favourites;
  let castList=[];
  let genresList=[];
  favourites.forEach((f)=>{
    let {credits,genre_ids}=f;
    if(credits.length>3) credits=credits.slice(0,3);
    if(genre_ids.length>3) genre_ids=genre_ids.slice(0,3);
    castList=[...castList, ...credits];
    genresList=[...genresList,...genre_ids];
  })

  let recommendMovies=[];
  for (const c of castList){
    const peopleMovieCredits=await getPeopleMovieCredits(c);
    peopleMovieCredits.forEach((pc)=>{
      const isInGenresList = genresList.find(item=>pc.genre_ids.includes(item));
      if(isInGenresList) recommendMovies.push(pc);
    })
  }

  res.status(200).json({success:true,recommendMovies});
})

router.get("/actors",async (req,res,next)=>{
  const {username,role}=req.user;
  const user=await User.findByUserName(username).populate('favourites');
  const favourites = user.favourites;
  let castList=[];
  favourites.forEach((f)=>{
    let {credits}=f;
    if(credits.length>3) credits=credits.slice(0,3);
    castList=[...castList, ...credits];
  })
  let filterCastList=[];
  for (const cast of castList){
    if(filterCastList.indexOf(cast)===-1) filterCastList.push(cast)
  }
  let recommendActors=await Promise.all(castList.map(async (cast)=>await getPeopleDetail(cast)));
  recommendActors.sort((a,b)=>{
    if(a.popularity>b.popularity) return -1
    else if(b.popularity>a.popularity) return 1
    else return 0
  })
  res.status(200).json({success:true,recommendActors});
})
export default router;