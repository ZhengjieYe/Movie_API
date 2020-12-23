import express from 'express';
import { getGenres } from '../tmdb-api';

const router = express.Router()

router.get('/',(req, res, next)=>{
	getGenres()
		.then(genres => res.status(200).send(genres))
		.catch(next)
})

router.get('/:id',(req, res, next)=>{
	const id = parseInt(req.params.id);
	getGenres()
		.then(genres => {
			const returnGenre = genres.filter(( genre ) => genre.id === id)
			if(returnGenre.length === 0){
				return res.status(401).send("Unable to find genre")
			} else {
				res.status(200).send(returnGenre)
			}
		})
		.catch(next)
})

export default router;