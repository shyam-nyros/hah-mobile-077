import {rootApiSlice} from '../../store/rootApiSlice';
const GIVE_ENDPOINT = '/api';

export const giveAPiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    giveCategoriesAPI: builder.query({
      query: data => ({
        url: `${GIVE_ENDPOINT}/give-categories`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.categories;
      },
    }),
    giveProjectDetailsAPI: builder.query({
      query: giveProjectId => ({
        url: `${GIVE_ENDPOINT}/give-projects/${giveProjectId}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.give_project;
      },
      keepUnusedDataFor: 1,
    }),
    giveProjectsByCategory: builder.query({
      query: ({category, page, search}) => ({
        url: `${GIVE_ENDPOINT}/give-projects?search=${
          search ? search : ''
        }&category=${category}&page=${page}`,
      }),
      serializeQueryArgs: ({endpointName}) => endpointName,

      forceRefetch: ({currentArg, previousArg}) =>
        currentArg?.search !== previousArg?.search ||
        currentArg?.category !== previousArg?.category ||
        currentArg?.page !== previousArg?.page,

      transformResponse: (response, meta, arg) => {
        // number of items per page
        const hasMore = response.give_projects.length === 20;
        return {
          hasMore,
          list: response.give_projects,
        };
      },
      merge: (currentCache, newItems, {arg: {filter, page, search}}) => {
        if (page === 1) return newItems;
        // remove any duplicates
        // const mergedData = {
        //   list: [...currentCache.list, ...newItems.list].filter(
        //     (item, index, self) =>
        //       index === self.findIndex(i => i._id === item._id),
        //   ),
        //   hasMore: newItems?.hasMore,
        // };
        
        // dont remove any duplicates - it will be removed from api 
        const mergedData = {
          list: [...currentCache.list, ...newItems.list],
          hasMore: newItems?.hasMore,
        };

        return mergedData;
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGiveCategoriesAPIQuery,
  useGiveProjectsByCategoryQuery,
  useGiveProjectDetailsAPIQuery,
} = giveAPiSlice;
