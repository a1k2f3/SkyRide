import mongoose from 'mongoose';

// const dburl=process.env.DATA_BASE_URL
const Connection=async()=>{
try {
    await mongoose.connect('mongodb+srv://akifbutt935:akif1234@cluster0.awqe4fp.mongodb.net/');
  console.log("databsae cnnection succesfull")
} catch (error) {
    console.log(error);
   }
}
export default Connection;