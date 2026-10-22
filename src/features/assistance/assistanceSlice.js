import {createSlice} from '@reduxjs/toolkit';

const moodOptions = [
  {id: 'm-1', content: '🤩 Excited'},
  {id: 'm-2', content: '😫 Stressed'},
  {id: 'm-3', content: '😌 Relaxed'},
  {id: 'm-4', content: '💡 Inspired'},
  {id: 'm-5', content: '😊 Happy'},
  {id: 'm-6', content: '😔 Lonely'},
];

const generalOptions = [
  {id: 'g1', content: '❓ Ask a Question'},
  {id: 'g2', content: '📚 Browse Topics'},
  {id: 'g3', content: '🙏 Faith'},
];  

const modulesOptions = [
  {id: 'm1', content: '📚 Ebook'},
  {id: 'm2', content: '🎵 Podcast'},
  {id: 'm3', content: '📖 Devotionals'},
  {id: 'm4', content: '📅 Events'},
  {id: 'm5', content: '⛪ Live Church stream'},
];

// Different greeting messages based on option type
const getGreetingMessages = optionType => {
  const baseGreeting = {
    id: 'greeting-1',
    type: 'ai',
    content: 'Hi! I am your Ministry Assistant',
  };

  switch (optionType) {
    case 'mood':
      return [
        baseGreeting,
        {
          id: 'greeting-2',
          type: 'ai',
          content: 'How are you feeling today?',
        },
      ];
    case 'general':
      return [ 
        // baseGreeting,
        {
          id: 'greeting-2', 
          type: 'ai',
          content:
            "If you ever find yourself wondering about something in the Bible or faith in general—I'm here for that too.",
        },
        {
          id: 'greeting-3',
          type: 'ai',
          content: 'Want to explore something now?',
        },
      ];
    case 'modules':
      return [
        // baseGreeting,
        {
          id: 'greeting-2',
          type: 'ai',
          content:
            'Hey! 👋 Just so you know you’re free to explore this space however you like.',
        },
        {
          id: 'greeting-3',
          type: 'ai',
          content:
            'Want to dive into something uplifting or just see what’s going on today? ',
        },
      ];
    default:
      return [baseGreeting];
  }
};

// Function to randomly select one of the option arrays
const getRandomOptionType = () => {
  // const optionTypes = [moodOptions]; //for testing only mood options
  const optionTypes = [moodOptions, generalOptions, modulesOptions];
  const randomIndex = Math.floor(Math.random() * optionTypes.length);
  return optionTypes[randomIndex];
};

const getMoodOptionsMessage = options => ({
  id: 'initial-options',
  type: 'options',
  options,
});

const initialState = {
  queryMessageList: [],
  isInitialized: false,
  showInitialSuggestions: false,
  initialSuggestions: [],
  currentSuggestionType: 'mood', // Track which type of options are currently shown
};

const assistanceSlice = createSlice({
  name: 'assistance',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.queryMessageList.push(action.payload);
      // Hide options when user sends a message
    },
    clearMessages: state => {
      state.queryMessageList = [];
      state.isInitialized = false;
      state.showInitialSuggestions = true;
      state.initialSuggestions = [];
      state.currentSuggestionType = 'mood';
    },

    initializeGreetings: state => { 
      if (!state.isInitialized) {
        // Randomly select one of the option types
        const selectedOptions = getRandomOptionType(); 
 
        // Set the current option type for reference
        if (selectedOptions === moodOptions) {
          state.currentSuggestionType = 'mood';
        } else if (selectedOptions === generalOptions) {
          state.currentSuggestionType = 'general';
        } else {
          state.currentSuggestionType = 'modules';
        }

        // Get appropriate greeting messages based on option type
        // const greetingMessages = getGreetingMessages( 
        //   state.currentSuggestionType, 
        // );
        // Get greetings first
        const greetingMessages = getGreetingMessages( 
          state.currentSuggestionType, 
        ); 

        // Add greetings 
        state.queryMessageList = [...greetingMessages];

        // THEN add options (after greetings)
        state.queryMessageList.push(getMoodOptionsMessage(selectedOptions));

        state.isInitialized = true;
        state.showInitialSuggestions = true;
        state.initialSuggestions = [...selectedOptions];
      }
    },  
    hideInitialSuggestions: state => {
      state.showInitialSuggestions = false;  
    },
    // New action to force re-initialization (useful for testing or manual reset)
    resetInitialization: state => {
      state.isInitialized = false;
    },
  },
});

export const {
  addMessage,
  clearMessages,
  initializeGreetings,
  hideInitialSuggestions,
  resetInitialization,
} = assistanceSlice.actions;

export default assistanceSlice.reducer;
