import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  churchList: [],
  organizationsList: [],
};

const churchSlice = createSlice({
  name: 'church',
  initialState,
  reducers: {
    setChurchList: (state, action) => {
      state.churchList = action.payload;
    },
    setOrganizationsList: (state, action) => {
      state.organizationsList = action.payload;
    },
  },
});

export const {setChurchList, setOrganizationsList} = churchSlice.actions;

export default churchSlice.reducer;
