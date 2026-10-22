import {configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import authReducer from '../features/auth/authSlice';
import churchReducer from '../features/churches/churchSlice';
import liveChurchReducer from '../features/livechurches/liveChurchSlice';
import liveActivityReducer from '../features/liveactivity/liveActivitySlice';
import contentReducer from '../features/content/contentSlice';
import assistanceReducer from '../features/assistance/assistanceSlice';
import homeReducer from '../features/home/homeSlice';
import eventsReducer from '../features/events/eventsSlice';
import feedReducer from '../features/feed/feedSlice';
import messageReducer from '../features/messages/messageSlice';
import {rootApiSlice} from './rootApiSlice';
import {bibleAPISlice} from './bibleApiSlice';
import {siteEngineApiSlice} from './siteEngineApiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  church: churchReducer,
  livechurch: liveChurchReducer,
  liveactivity: liveActivityReducer,
  content: contentReducer,
  events: eventsReducer,
  message: messageReducer,
  feed: feedReducer,
  assistance: assistanceReducer,

  [rootApiSlice.reducerPath]: rootApiSlice.reducer,
  [bibleAPISlice.reducerPath]: bibleAPISlice.reducer,
  [siteEngineApiSlice.reducerPath]: siteEngineApiSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist the auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // serializableCheck: false,
    }).concat(
      rootApiSlice.middleware,
      bibleAPISlice.middleware,
      siteEngineApiSlice.middleware,
    ),
});

export const persistor = persistStore(store);

export default store;
