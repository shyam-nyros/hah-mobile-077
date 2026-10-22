import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  contentList: [],
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setContentList: (state, action) => {
      state.contentList = action.payload;
    },
  },
});

export const {setContentList} = contentSlice.actions;

export default contentSlice.reducer;
