import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  liveChurchList: [],
  liveChurchDetails: {},
  isSpeaking: false,
  addMoreChurchesModal: false,
  liveChurchStarted: false
};

const liveChurchSlice = createSlice({
  name: 'livechurch',
  initialState,
  reducers: {
    setLiveChurchList: (state, action) => {
      state.liveChurchList = action.payload;
    },
    setLiveChurchDetails: (state, action) => {
      state.liveChurchDetails = action.payload;
    },
    setIsSpeaking: (state, action) => {
      state.isSpeaking = true;
    },
    stopIsSpeaking: (state, action) => {
      state.isSpeaking = false;
    },
    showAddMoreChurchesModal: (state, action) => {
      state.addMoreChurchesModal = true;
    },
    hideAddMoreChurchesModal: (state, action) => {
      state.addMoreChurchesModal = false;
    },
    setLiveChurchStarted: (state, action) => {
      state.liveChurchStarted = true;
    },
    setLiveChurchNotStarted: (state, action) => {
      state.liveChurchStarted = false;
    },
  },
});

export const {
  setLiveChurchList,
  setLiveChurchDetails,
  setIsSpeaking,
  stopIsSpeaking,
  showAddMoreChurchesModal,
  hideAddMoreChurchesModal,
  setLiveChurchStarted,
  setLiveChurchNotStarted
} = liveChurchSlice.actions;

export default liveChurchSlice.reducer;
