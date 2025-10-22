import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthToken } from '@/lib/cookies';

interface Post {
  _id: string;
  userId: string;
  title?: string;
  caption?: string;
  description?: string;
  body?: string;
  hashtags?: string[];
  platform?: string;
  imagePrompt?: string;
  imageUrl?: string | null;
  status?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('Post list', response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default postsSlice.reducer;