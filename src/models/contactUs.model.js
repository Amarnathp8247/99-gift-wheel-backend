// src/models/user.js
import mongoose from 'mongoose';

const contactUs = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  phoneNo: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  subject: { type: String, required: true,},
  message: { type: String, required: true,},
 
}, { timestamps: true });



export default mongoose.model('contact', contactUs);
