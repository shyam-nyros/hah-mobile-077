import {rootApiSlice} from '../../store/rootApiSlice';
const LEADERS_ENDPOINT = '/api/leaders';

export const leadersAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    searchGlobalLeadersAPI: builder.query({
      query: ({page, search}) => ({
        url: `${LEADERS_ENDPOINT}/?search=${search ? search : ''}&page=${page}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.leaders;
      },
      keepUnusedDataFor: 0,
    }),
    leaderProfileAPI: builder.query({
      query: leaderId => ({
        url: `${LEADERS_ENDPOINT}/${leaderId}`,
      }),
      serializeQueryArgs: ({endpointName}) => endpointName,
      transformResponse: (response, meta, arg) => {
        return response.leader;
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

// Export the hooks
export const {useSearchGlobalLeadersAPIQuery, useLeaderProfileAPIQuery} =
  leadersAPISlice;
