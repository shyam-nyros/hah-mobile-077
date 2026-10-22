import {rootApiSlice} from '../../store/rootApiSlice';
const LIVE_ACTIVITIES_ENDPOINT = '/api/live-activities';

export const liveActivityAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    liveActivitiesDetailsAPI: builder.query({
      query: ({liveActivityId}) => ({
        url: `${LIVE_ACTIVITIES_ENDPOINT}/${liveActivityId}`,
      }),
    }),

    liveActivitiesFeedAPI: builder.mutation({
      query: ({christianId, liveActivityId, message}) => ({
        url: `${LIVE_ACTIVITIES_ENDPOINT}/by-christianOrg/${christianId}/${liveActivityId}/feed`,
        method: 'POST',
        body: {message},
      }),
    }),
  }),
});

export const {
  useLiveActivitiesDetailsAPIQuery,
  useLiveActivitiesFeedAPIMutation,
} = liveActivityAPISlice;
