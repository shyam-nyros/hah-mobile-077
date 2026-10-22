import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  liveActivityDetails: {},
  liveActivitiesStarted: false,
};

const liveActivitySlice = createSlice({
  name: 'liveactivity',
  initialState,
  reducers: {
    setLiveActivitiesDetails: (state, action) => {
      state.liveActivityDetails = action.payload;
    },
    setLiveActivitiesStarted: (state, action) => {
      state.liveActivitiesStarted = true;
    },
    setLiveActivitiesNotStarted: (state, action) => {
      state.liveActivitiesStarted = false;
    },
  },
});

export const {
  setLiveActivitiesDetails,
  setLiveActivitiesStarted,
  setLiveActivitiesNotStarted,
} = liveActivitySlice.actions;

export default liveActivitySlice.reducer;
