import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const apiKey = '9Cn4e5WT4RxTe9ettNgQAoVtAQkiezM8';
const apiUser = '542347756';

const categories = [
  'profanity',
  'personal',
  'link',
  'medical',
  'weapon',
  'extremism',
  'drug',
  'self-harm',
  'violence',
  'content-trade',
  'money-transaction',
  'spam',
];

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.sightengine.com',
});

export const siteEngineApiSlice = createApi({
  reducerPath: 'siteengine',
  baseQuery,
  endpoints: builder => ({
    // check for the text violation
    analyzeTextAPI: builder.mutation({
      query: ({text}) => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('lang', 'en');
        formData.append(
          'categories',
          'profanity,personal,link,drug,weapon,spam,content-trade,money-transaction,extremism,violence,self-harm,medical',
        );
        formData.append('mode', 'rules');
        formData.append('api_user', apiUser);
        formData.append('api_secret', apiKey);

        return {
          url: `/1.0/text/check.json`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: response => {
        // Check if any category has matches
  
        const hasViolations = categories.some(
          category => response[category]?.matches?.length > 0,
        );

        return hasViolations;
      },
    }),

    // check for the image violation
    // analyzeImageAPI: builder.mutation({
    //   query: ({image}) => {
    //     const formData = new FormData();
    //     formData.append('media', image);
    //     formData.append(
    //       'models',
    //       'alcohol,gore,nudity,offensive,violence,weapon',
    //     );
    //     formData.append('api_user', apiUser);
    //     formData.append('api_secret', apiKey);
    //     return {
    //       url: `/1.0/check.json`,
    //       method: 'POST',
    //       body: formData,
    //     };
    //   },
    //   transformResponse: response => {


    //     return 'ok';
    //   },
    // }),
    analyzeImageAPI: builder.mutation({
      query: ({ image }) => {
        const formData = new FormData();
        formData.append('media', image);
        formData.append(
          'models',
          'alcohol,gore,nudity,offensive,violence,weapon'
        );
        formData.append('api_user', apiUser);
        formData.append('api_secret', apiKey);
        return {
          url: `/1.0/check.json`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response) => {
      
        
        // thresholds for various categories
        const thresholds = {
          alcohol: 0.01,
          gore: 0.01,
          nudity: 0.1, 
          offensive: 0.01,
          violence: 0.01,
          weapon: 0.01,
        };
    
        // Perform the validation checks
        if (response.alcohol?.prob > thresholds.alcohol) {
          return true; // Block upload
        }
        if (response.gore?.prob > thresholds.gore) {
          return true; 
        }
        if (response.nudity?.raw > thresholds.nudity) {
          return true; 
        }
        if (response.nudity?.partial > thresholds.nudity) {
          return true; 
        }
        if (response.offensive?.prob > thresholds.offensive) {
          return true; 
        }
        if (response.violence?.prob > thresholds.violence) {
          return true; 
        }
        if (response.weapon?.classes?.firearm > thresholds.weapon) {
          return true; 
        }
        if (response.weapon?.classes?.knife > thresholds.weapon) {
          return true; 
        }
    
        // If all checks pass, allow the upload
        return false;
      },
    }),
    
  }),
});

export const {useAnalyzeTextAPIMutation, useAnalyzeImageAPIMutation} =
  siteEngineApiSlice;
