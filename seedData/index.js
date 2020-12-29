import userModel from '../api/users/userModel';
import { getMovies, getGenres } from '../api/tmdb-api'
import movieModel from '../api/movies/movieModel';
import genresModel from '../api/genres/genresModel';

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
  