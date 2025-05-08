import mongoose from "mongoose";
const { Schema } = mongoose;
const SignupSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: Number },
  date_of_birth: { type: Date },
  password: { type: String, required: true },
  confirmpassword: { type: String,  },
  country: { type: String },
  image: { type: String },
  Userbio: { type: String },
  role: {type: String, enum: ["machanic", "user","fuel pump"], default: "user"},
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
});
export default mongoose.model("Accounts", SignupSchema);