import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.scripture.api.bible',
  prepareHeaders: headers => {
    headers.set('api-key', 'f198c0cc432c0b23157bb0530311e5c5');
    return headers;
  },
});

export const bibleAPISlice = createApi({
  reducerPath: 'bible',
  baseQuery,
  endpoints: builder => ({
    bibleVersions: builder.query({
      query: () => ({
        url: `/v1/bibles`,
      }),
      transformResponse: (response, meta, arg) => {
        const data = response.data.filter(
          item =>
            item.abbreviation === 'engKJV' && item.description === 'Ecumenical',
        );
  
        return data;
      },
    }),
    bibleBooksAPI: builder.query({
      query: ({bibleId}) => ({
        url: `/v1/bibles/${bibleId}/books`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    bibleBookChapters: builder.query({
      query: ({bibleId, bookId}) => ({
        url: `/v1/bibles/${bibleId}/books/${bookId}/chapters`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    bibleBookChaptersDetails: builder.query({
      query: ({bibleId, chapterId}) => ({
        url: `/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=text`,
      }),
    }),
  }),
});

export const {
  useBibleVersionsQuery,
  useBibleBooksAPIQuery,
  useBibleBookChaptersQuery,
  useBibleBookChaptersDetailsQuery,
} = bibleAPISlice;
