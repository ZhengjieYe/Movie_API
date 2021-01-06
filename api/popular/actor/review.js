import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const review = new Schema({
  id:{type: Number, required: true},
  user_id: {type: String, required: true},
  content: {type: String, required: true},
  date: {type: String}
})

export default mongoose.model("Review",review);