import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String },
  description:{ type: String },
  body:      { type: String, required: true },
  hashtags:  [String],
  platforms: [String], // e.g. ["facebook","twitter"]
  status:    { type: String, enum: ['draft','scheduled','published'], default: 'draft' },
  scheduledAt:{ type: Date },
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
