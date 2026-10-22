import socket from '../../socket/socket';
import {rootApiSlice} from '../../store/rootApiSlice';
const HOME_ENDPOINT = '/api/home';

export const homeAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    yourChurchActivityAPI: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/church-activities`,
      }),
      providesTags: ['UpdateCurrentChurch'],
      keepUnusedDataFor: 2,
    }),
    newsAPI: builder.query({
      query: () => ({
        url: `${HOME_ENDPOINT}/news-list`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    newsItemViewedAPI: builder.mutation({
      query: newsId => ({
        url: `${HOME_ENDPOINT}/news/${newsId}`,
        method: 'POST',
      }),
      transformResponse: (response, meta, arg) => {
        return response;
      },
    }),
    newsDetailsAPI: builder.query({
      query: newsId => ({
        url: `${HOME_ENDPOINT}/news/${newsId}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    otherLiveChurchesNearYouAPI: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/live-churches`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.churches;
      },
      providesTags: ['UpdateCurrentChurch'],

      keepUnusedDataFor: 2,
    }),
    pickedForYouAPI: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/library`,
      }),
      keepUnusedDataFor: 2,
      providesTags: ['UpdateCurrentChurch'],
    }),
    eventsYouMayAttendAPI: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/events`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.events;
      },
      providesTags: ['UpdateCurrentChurch', 'Zipcode'],
      keepUnusedDataFor: 2,
    }),
    chatWithFriendsList: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/chat_with_friends`,
      }),
      invalidatesTags: ['ConnectionStatus'],
      transformResponse: (response, meta, arg) => {
        return response.users;
      },
      serializeQueryArgs: ({endpointName}) => endpointName,
      providesTags: ['FollowingUser', 'UpdateCurrentChurch'],
    }),

    connectWithLeaders: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/leaders`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.leaders;
      },
      serializeQueryArgs: ({endpointName}) => endpointName,
      providesTags: ['UpdateCurrentChurch'],
    }),

    // notifications suggestions
    suggestedForYouAPI: builder.query({
      query: data => ({
        url: `/api/user/notifications/suggestions`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.leaders;
      },
      serializeQueryArgs: ({endpointName}) => endpointName,
      keepUnusedDataFor: 3,
      providesTags: ['SuggestedForYouNotifications'],
    }),

    feedHome: builder.query({
      query: data => ({
        url: `${HOME_ENDPOINT}/feed`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: ['Post', 'UpdateCurrentChurch'],
    }),
    // New Search API endpoint
    searchAPI: builder.query({
      query: searchTerm => ({
        url: `${HOME_ENDPOINT}/search`,
        params: {query: searchTerm},
      }),
      providesTags: ['UpdateCurrentChurch'],

      keepUnusedDataFor: 2,
    }),
    // 🆕 RAG Query API
    // ragQueryAPI: builder.mutation({
    //   query: queryText => ({
    //     url: `api/user/ai/ministry/query`,
    //     method: 'POST',
    //     body: {question: queryText},
    //   }),
    //   transformResponse: (response, meta, arg) => {
    //     const transformedResponse = {
    //       answer: response?.data?.answer,
    //       sessionId: response?.data?.sessionId,
    //     };
    //     return transformedResponse;
    //   },
    // }),
    ragQueryAPI: builder.mutation({
      query: ({question, sessionId}) => ({
        url: `api/user/ai/ministry/query`,
        method: 'POST',
        body: {
          question: question,
          sessionId: sessionId,
        },
      }),
      transformResponse: (response, meta, arg) => {
        console.log('ACTUAL RESPONSE FROM RAG API: -----------------');

        console.log(JSON.stringify(response));
        const transformedResponse = {
          answer: response?.data?.answer,
          results: response?.data?.results,
          sessionId: response?.data?.sessionId,
          suggestions: response?.data?.suggestions || [],
        };
        return transformedResponse;
      },
    }),
    todayHeroCardAPI: builder.query({
      query: () => ({
        url: `${HOME_ENDPOINT}/hero-card`,
      }),
      transformResponse: (response, meta, arg) => {
        return response;
      },
      keepUnusedDataFor: 2,
    }),
    leaderCollectionsAPI: builder.query({
      query: () => ({
        url: `${HOME_ENDPOINT}/leader-collections`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.leaders;
      },
      keepUnusedDataFor: 2,
    }),
  }),
});

export const {
  useYourChurchActivityAPIQuery,
  useNewsAPIQuery,
  useNewsItemViewedAPIMutation,
  useNewsDetailsAPIQuery,
  useOtherLiveChurchesNearYouAPIQuery,
  usePickedForYouAPIQuery,
  useEventsYouMayAttendAPIQuery,
  useChatWithFriendsListQuery,
  useSearchAPIQuery,
  useConnectWithLeadersQuery,
  useSuggestedForYouAPIQuery,
  useFeedHomeQuery,
  useRagQueryAPIMutation,
  useTodayHeroCardAPIQuery,
  useLeaderCollectionsAPIQuery,
} = homeAPISlice;
