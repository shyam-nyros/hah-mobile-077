import {rootApiSlice} from '../../store/rootApiSlice';
const CHURCHES_ENDPOINT = '/api/churches';
const ORGANIZATION_ENDPOINT = '/api/organizations';

export const churchAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    getChurchesAPI: builder.query({
      query: ({search}) => ({
        url: `${CHURCHES_ENDPOINT}?search=${search}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.churches;
      },
      forceRefetch: ({currentArg, previousArg}) => {
        return !previousArg || currentArg?.search !== previousArg?.search;
      },
    }),

    getOrganizationsAPI: builder.query({
      query: data => ({
        url: `${ORGANIZATION_ENDPOINT}`,
      }),
    }),
  }),
});

export const {useGetChurchesAPIQuery, useGetOrganizationsAPIQuery} =
  churchAPISlice;
