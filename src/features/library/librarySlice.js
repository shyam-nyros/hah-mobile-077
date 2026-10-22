import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  learningList: [],
  leadersList: [],
  popularList: [],
  tredingList: [],
  categoriesList: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLearning: (state, action) => {
      state.learningList = action.payload;
    },
    setLeaders: (state, action) => {
      state.leadersList = action.payload;
    },
    setPopular: (state, action) => {
      state.popularList = action.payload;
    },
    setTrending: (state, action) => {
      state.tredingList = action.payload;
    },
    setCategories: (state, action) => {
      state.categoriesList = action.payload;
    },
  },
});

export const {setLearning, setLeaders, setPopular, setTrending, setCategories} =
  librarySlice.actions;

export default librarySlice.reducer;
