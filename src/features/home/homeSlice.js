import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  yourChurchActivityList: [],
  liveChurchesNearYou: [],
  conversationIdForFirstMessage: null,
  followedChurchesIdsToFilter: [],
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setYourChurchActivity: (state, action) => {
      state.yourChurchActivityList = action.payload;
    },
    setFollowedChurchesIdsToFilter: (state, action) => {
      state.followedChurchesIdsToFilter = action.payload;
    },
    setLiveChurchesNearYou: (state, action) => {
      state.liveChurchesNearYou = action.payload;
    },
    setConversationIdForFirstMessage: (state, action) => {
      state.conversationIdForFirstMessage = action.payload;
    },
    setConversationIdNull: state => {
      state.conversationIdForFirstMessage = null;
    },
  },
});

export const {
  setFollowedChurchesIdsToFilter,
  setConversationIdForFirstMessage,
  setConversationIdNull,
} = homeSlice.actions;

export default homeSlice.reducer;
