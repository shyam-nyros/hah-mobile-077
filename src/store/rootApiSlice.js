import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {logout} from '../features/auth/authSlice';
import showToast from '../utils/toast/showToast';

const baseQuery = fetchBaseQuery({
  // baseUrl: 'http://000.000.00.0:3002',
  baseUrl: 'https://www.heavenathand.org:3002',

  prepareHeaders: (headers, {getState}) => {
    const state = getState();
    const token = state.auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Create baseQueryWithReauth
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // handle no network error
  // if (result?.error?.error === 'TypeError: Network request failed') {
  //   return {
  //     error: {status: 'NETWORK_ERROR', message: 'Network request failed'},
  //   };
  // }
  // If the response is 401, handle token expiration
  if (result?.error?.status === 401) {
    api.dispatch(logout()); // Dispatch logout action
    // Optionally, navigate to the login screen
  }
  return result;
};

export const rootApiSlice = createApi({
  reducerPath: 'hah',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Events',
    'Live-Church',
    'Church',
    'Post',
    'Comment',
    'NotificationCount',
    'Like',
    'FollowingUser',
    'PersonalList',
    'participants',
    'PickedForYou',
    'Activity',
    'Bookmarks',
    'FollowingLeaders',
    'LeaderProfile',
    'GroupDetails',
    'SuggestedGroups',
    'SuggestedForYouNotifications',
    'UpdateCurrentChurch',
    'Inbox',
    'Zipcode',
    'ConnectionStatus',
    'Referral',
  ],
  endpoints: builder => ({}),
});
