import userModel from '../api/users/userModel';
import { getMovies, getGenres, getUpcomingMovies, getTopRated, getPopularActor } from '../api/tmdb-api'
import movieModel from '../api/movies/movieModel';
import genresModel from '../api/genres/genresModel';
import upcomingModel from '../api/upcoming/upcomingModel';
import topRatedModel from '../api/topRated/topRatedModel';
import knowForModel from '../api/popular/actor/knownForMovie';
import popularActorModel from '../api/popular/actor/popularActor';
import reviewModel from '../api/popular/actor/review';

const users = [
  {
    'username': 'user1',
    'password': 'test1',
    'role': 'admin'
  },
  {
    'username': 'user2',
    'password': 'test2',
    'role': 'normal'
  },
];

export async function loadUsers() {
  console.log('load user Data');
    try {
      await userModel.deleteMany();
      await users.forEach(user => userModel.create(user).catch(err=>console.error(err)));
      console.info(`${users.length} users were successfully stored.`);
    } catch (err) {
      console.error(`failed to Load user Data: ${err}`);
    }
  }

  export async function loadMovies() {
    console.log('load movies Data');
    getMovies().then(async res=>{
      try {
        await movieModel.deleteMany();
        await movieModel.collection.insertMany(res);
        console.info(`${res.length} Movies were successfully stored.`);
      } catch (err) {
        console.error(`failed to Load movie Data: ${err}`);
      }
    })
  }
  
  export async function loadGenres() {
    console.log('load genres Data');
    getGenres().then(async res=>{
      try {
        await genresModel.deleteMany();
        await genresModel.collection.insertMany(res);
        console.info(`${res.length} genres were successfully stored.`);
      } catch (err) {
        console.error(`failed to Load movie Data: ${err}`);
      }
    })
  }
  

  export async function loadUpcomingMovies() {
    console.log('load upcoming data');
    getUpcomingMovies().then(async res=>{
      try {
        await upcomingModel.deleteMany();
        await upcomingModel.collection.insertMany(res);
        console.info(`${res.length} upcoming movies were successfully stored.`);
      } catch (err) {
        console.error(`failed to Load movie Data: ${err}`);
      }
    })
  }

  export async function loadTopRatedMovies() {
    console.log('load Top rated movies data');
    
    try {
      const top1=await getTopRated(1);
      const top2=await getTopRated(2);
      const top3=await getTopRated(3);
      const top4=await getTopRated(4);
      await topRatedModel.deleteMany();
      await topRatedModel.collection.insertMany(top1);
      await topRatedModel.collection.insertMany(top2);
      await topRatedModel.collection.insertMany(top3);
      await topRatedModel.collection.insertMany(top4);
      console.info(`${top1.length+top2.length+top3.length+top4.length} top rated movies were successfully stored.`);
    } catch (err) {
      console.error(`failed to Load movie Data: ${err}`);
    }
  }
  

  export async function loadPopularActor(){
    console.log("load popular actors");

    try{
      let actors = await getPopularActor();
      await knowForModel.deleteMany();
      await popularActorModel.deleteMany();
      await reviewModel.deleteMany();
      const newActors = await Promise.all(actors.map(async (actor)=>{
        let known_for = actor.known_for;
        const known_for_id=await Promise.all(known_for.map(async (k)=>{
          await knowForModel.collection.insertOne(k,(err)=>{});
          const know_forMovie=await knowForModel.findById(k.id);
          return know_forMovie._id;
        }));
        return {
          ...actor,
          known_for: known_for_id
        }
      }));
      await popularActorModel.collection.insertMany(newActors);
      console.log(`${newActors.length} popular actors were successfully stored.`);
    }catch(err){
      console.log(`failed to Load popular actors Data: ${err}`);
    }
  }