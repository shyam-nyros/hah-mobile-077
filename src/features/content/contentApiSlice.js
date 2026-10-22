import {rootApiSlice} from '../../store/rootApiSlice';
const CONTENT_ENDPOINT = '/api/content-categories';

export const contentAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    getContentList: builder.query({
      query: data => ({
        url: `${CONTENT_ENDPOINT}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.categories;
      },
    }),
    getSubContentList: builder.query({
      query: data => ({
        url: `/api/subcategories`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.subcategories;
      },
    }),
  }),
});

export const {useGetContentListQuery, useGetSubContentListQuery} =
  contentAPISlice;
