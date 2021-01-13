import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const rateMovie = new Schema({
  movie_id:{type: Number, required: true},
  username:{type: String, required: true},
  rating:{type:Number,required: true}
})

export default mongoose.model("Rate", rateMovie);