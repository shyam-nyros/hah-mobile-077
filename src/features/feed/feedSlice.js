import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  reloadFlagForBlockUser: false,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setReloadOnBlockingUser: (state, action) => {
      state.reloadFlagForBlockUser = !state.reloadFlagForBlockUser;
    },
  },
});

export const {setReloadOnBlockingUser} = feedSlice.actions;

export default feedSlice.reducer;
