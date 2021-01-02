import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const ActorSchema = new Schema({
  adult: { type: Boolean },
  gender: {
    type: Number,
    validate: {
      validator: function(gender){
        return [1,2].indexOf(gender)!==-1
      },
      message: "The gender code is not allowd!"
    }
  },
  id: { type: Number, required: true, unique: true },
  known_for: [{type: mongoose.Schema.Types.ObjectId, ref: 'KnowForMovie'}],
  known_for_department: {type: String},
  name: {type:String, required:true},
  popularity: {type: Number},
  profile_path: {type: String},
  reviews:[{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
});

export default mongoose.model('popularActor', ActorSchema);


