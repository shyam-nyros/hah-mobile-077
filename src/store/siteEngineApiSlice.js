import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
// const apiKey = 'JjgPJtGzbNb4kf3UC2RBTXon2xw6dvwp';
// const apiUser = '412927843';
const apiKey = '9Cn4e5WT4RxTe9ettNgQAoVtAQkiezM8';
const apiUser = '542347756';


// Must match exactly what is sent in the API call categories field
const categories = [
  'profanity',
  'personal',
  'link',
  'drug',
  'weapon',
  'spam',
  'content-trade',
  'money-transaction',
  'extremism',
  'violence',
  'self-harm',
  'medical',
];

// Custom blocklist for words Sightengine won't catch in isolation
const customBlockedWords = [
  'blood',
  'kill',
  'murder',
  'rape',
  'suicide',
  'bomb',
  'terrorist',
];

const containsBlockedWord = text => {
  const lower = text.toLowerCase();
  return customBlockedWords.some(word =>
    new RegExp(`\\b${word}\\b`).test(lower),
  );
};

// old categories
// const categories = [
//   'profanity',
//   'personal',
//   'medical',
//   'weapon',
//   'extremism',
//   'drug',
//   'self-harm',
//   'violence',
//   'content-trade',
// ];

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
      transformResponse: (response, meta, arg) => {
        // Check custom blocklist first (words Sightengine won't catch in isolation)
        if (arg?.text && containsBlockedWord(arg.text)) {
          return true;
        }

        // Check if any category has matches from Sightengine
        const hasViolations = categories.some(
          category => response[category]?.matches?.length > 0,
        );

        return hasViolations;
      },
    }),

    // check for the image violation
    analyzeImageAPI: builder.mutation({
      query: ({image}) => {
        const formData = new FormData();
        formData.append('media', image);
        formData.append(
          'models',
          'alcohol,gore,nudity,offensive,violence,weapon',
        );
        formData.append('api_user', apiUser);
        formData.append('api_secret', apiKey);
        return {
          url: `/1.0/check.json`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: response => {
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

    analyzeVideoAPI: builder.mutation({
      query: ({video}) => {
        const formData = new FormData();
        formData.append('media', video);
        formData.append(
          'models',
          'alcohol,gore,nudity,offensive,violence,weapon',
        );
        formData.append('api_user', apiUser);
        formData.append('api_secret', apiKey);

        return {
          url: `/1.0/video/check-sync.json`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response) => {

        // Ensure response structure is valid
        const frames = response?.data?.data?.frames;
        if (!frames || !Array.isArray(frames)) {
          return false; // If frames data is missing, assume it's safe
        }

        // Thresholds for various categories
        const thresholds = {
          alcohol: 0.01,
          gore: 0.01,
          nudity: 0.1,
          offensive: 0.01,
          violence: 0.01,
          weapon: 0.01,
        };

        // Check if any frame violates the thresholds
        const shouldBlock = frames.some((frame) =>
          (frame.alcohol?.prob ) > thresholds.alcohol ||
          (frame.gore?.prob) > thresholds.gore ||
          (frame.nudity?.raw) > thresholds.nudity ||
          (frame.offensive?.prob) > thresholds.offensive ||
          (frame.violence?.prob) > thresholds.violence ||
          (frame.weapon?.classes?.firearm) > thresholds.weapon
        );

        return shouldBlock;
      },
      // transformResponse: response => {
      //   // Step 1: Validate response structure
      //   if (
      //     !response?.data?.data?.frames ||
      //     !Array.isArray(response?.data?.data?.frames) ||
      //     response.data.data.frames.length === 0
      //   ) {
      //     console.warn('Sight Engine response invalid or missing frames - blocking by default',);
      //     return true; // Block if response is invalid or empty
      //   }

      //   const frames = response.data.data.frames;

      //   // Step 2: Set strict thresholds (lower values = more sensitive)
      //   const thresholds = {
      //     alcohol: 0.15, // Alcohol presence
      //     gore: 0.1, // Blood, injury content
      //     nudity: {
      //       raw: 0.15, // Explicit nudity
      //       partial: 0.25, // Partial nudity
      //       safe: 0.8, // Minimum safety score required
      //     },
      //     offensive: 0.15, // Offensive gestures/symbols
      //     drugs: 0.15, // Drug-related content
      //     violence: 0.15, // Violent content
      //     weapon: 0.15, // Weapons present
      //   };

      //   // Step 3: Check every frame thoroughly
      //   for (const frame of frames) {
      //     // Alcohol check
      //     if (frame.alcohol && frame.alcohol.prob > thresholds.alcohol) {
      
      //       return true;
      //     }

      //     // Gore check
      //     if (frame.gore && frame.gore.prob > thresholds.gore) {
      
      //       return true;
      //     }

      //     // Comprehensive nudity check
      //     if (frame.nudity) {
      //       // Check raw nudity score
      //       if (frame.nudity.raw > thresholds.nudity.raw) {
      
      //         return true;
      //       }

      //       // Check partial nudity
      //       if (frame.nudity.partial > thresholds.nudity.partial) {
      
      //         return true;
      //       }

      //       // Check swimwear/underwear
      //       if (frame.nudity.underwear_swimwear > 0.5) {
      
      //         return true;
      //       }

      //       // Check if safe score is too low
      //       if (frame.nudity.safe < thresholds.nudity.safe) {
      
      //         return true;
      //       }
      //     }

      //     // Offensive content check
      //     if (frame.offensive && frame.offensive.prob > thresholds.offensive) {
      
      //       return true;
      //     }

      //     // Drug content check
      //     if (frame.drugs && frame.drugs.prob > thresholds.drugs) {
      
      //       return true;
      //     }

      //     // Violence check
      //     if (frame.violence && frame.violence.prob > thresholds.violence) {
      
      //       return true;
      //     }

      //     // Weapons check - comprehensive
      //     if (frame.weapon) {
      //       // Check overall weapon probability
      //       if (frame.weapon.prob > thresholds.weapon) {
      
      //         return true;
      //       }

      //       // Check specific weapon classes
      //       if (frame.weapon.classes) {
      //         if ((frame.weapon.classes.firearm || 0) > thresholds.weapon) {
      
      //           return true;
      //         }
      //         if ((frame.weapon.classes.knife || 0) > thresholds.weapon) {
      
      //           return true;
      //         }
      //         if ((frame.weapon.classes.explosive || 0) > thresholds.weapon) {
      
      //           return true;
      //         }
      //         if ((frame.weapon.classes.threat || 0) > thresholds.weapon) {
      
      //           return true;
      //         }
      //       }
      //     }

      //     // Additional checks for other potentially problematic content
      //     // if (
      //     //   frame.text &&
      //     //   frame.text.profanity &&
      //     //   frame.text.profanity.prob > 0.5
      //     // ) {
      
      //     //   return true;
      //     // }
      //   }

      //   // Step 4: Check overall video summary data if available
      //   const summary = response?.data?.data?.summary;
      //   if (summary) {
      //     if (
      //       summary.nudity &&
      //       summary.nudity.raw > thresholds.nudity.raw / 2
      //     ) {
      
      //       return true;
      //     }

      //     if (
      //       summary.offensive &&
      //       summary.offensive.prob > thresholds.offensive / 2
      //     ) {
      
      //       return true;
      //     }
      //   }

      //   // If we get here, no violations were found
      
      //   return false;
      // },
    }),
  }),
});

export const {
  useAnalyzeTextAPIMutation,
  useAnalyzeImageAPIMutation,
  useAnalyzeVideoAPIMutation,
} = siteEngineApiSlice;
