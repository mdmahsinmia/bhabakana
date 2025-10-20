import Post from '../models/Post.js';

export const createPost = async (req, res, next) => {
  try {
    const post = await Post.create({ ...req.body, userId: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const listPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user._id });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post removed' });
  } catch (err) {
    next(err);
  }
};
