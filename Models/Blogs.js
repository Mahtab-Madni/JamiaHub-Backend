import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  date: {
    type: String,
    required : true
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  content:{
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  tags:[{
    type: String,
    required: true,
  }],
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },  // Enable virtuals in JSON
  toObject: { virtuals: true }
});

// Virtual field to calculate read time
blogSchema.virtual('readTime').get(function() {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
});

const Blog = mongoose.model("Blogs", blogSchema);

export default Blog;