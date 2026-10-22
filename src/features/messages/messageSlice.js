import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  personalConversationList: [],
  groupConversationList: [],
  personalItemClicked: false,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setPersonalConversationList: (state, action) => {
      state.personalConversationList = action.payload;
    },
    setGroupConversationList: (state, action) => {
      state.groupConversationList = action.payload;
    },
    setPersonalItemClicked: state => {
      state.personalItemClicked = true;
    },
    resetPersonalItemClicked: state => {
      state.personalItemClicked = false;
    },
    updateGroupProfileImage: (state, action) => {
      const {groupId, newGroupPicture} = action.payload;
      const group = state.groupConversationList.find(
        item => item._id === groupId,
      );
      if (group) {
        group.groupPicture = newGroupPicture;
      }
    },
  },
});

export const {
  setPersonalConversationList,
  setGroupConversationList,
  setPersonalItemClicked,
  resetPersonalItemClicked,
  updateGroupProfileImage,
} = messageSlice.actions;

export default messageSlice.reducer;
