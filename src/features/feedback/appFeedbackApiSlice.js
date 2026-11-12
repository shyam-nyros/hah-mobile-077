import {rootApiSlice} from '../../store/rootApiSlice';

const APP_FEEDBACK_ENDPOINT = '/api/app-feedback';

export const appFeedbackApiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    // Counts one app open; response says whether to show the feedback popup
    registerAppOpenAPI: builder.mutation({
      query: data => ({
        url: `${APP_FEEDBACK_ENDPOINT}/app-open`,
        method: 'POST',
        body: data,
      }),
    }),
    submitAppFeedbackAPI: builder.mutation({
      query: data => ({
        url: APP_FEEDBACK_ENDPOINT,
        method: 'POST',
        body: data,
      }),
    }),
    dismissAppFeedbackAPI: builder.mutation({
      query: () => ({
        url: `${APP_FEEDBACK_ENDPOINT}/dismiss`,
        method: 'POST',
      }),
    }),
    markAppFeedbackStoreRedirectedAPI: builder.mutation({
      query: feedbackId => ({
        url: `${APP_FEEDBACK_ENDPOINT}/${feedbackId}/store-redirected`,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useRegisterAppOpenAPIMutation,
  useSubmitAppFeedbackAPIMutation,
  useDismissAppFeedbackAPIMutation,
  useMarkAppFeedbackStoreRedirectedAPIMutation,
} = appFeedbackApiSlice;
