import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  featured: [],
  happeningToday: [],
  eventsThisWeek: [],
  upcomingEvents: [],
  searchQuery: {
    groupBy: null,
    page: 1,
    search: '',
  },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFeatured: (state, action) => {
      state.featured = action.payload;
    },
    setHappeningToday: (state, action) => {
      state.happeningToday = action.payload;
    },
    setEventsThisWeek: (state, action) => {
      state.eventsThisWeek = action.payload;
    },
    setUpcomingEvents: (state, action) => {
      state.upcomingEvents = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery.groupBy = action.payload.groupBy;
      state.searchQuery.page = action.payload.page;
      state.searchQuery.search = action.payload.search;
    },
  },
});

export const {
  setFeatured,
  setHappeningToday,
  setEventsThisWeek,
  setUpcomingEvents,
  setSearchQuery
} = eventsSlice.actions;

export default eventsSlice.reducer;
