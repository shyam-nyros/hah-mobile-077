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
  {id: 'g3', content: '🙏 Faith Tools'},
];

const modulesOptions = [
  {id: 'm1', content: '🙏 Faith'},
  {id: 'm2', content: '🎵 Music'},
  {id: 'm3', content: '📅 Events'},
  {id: 'm4', content: '📖 Devotionals'},
  {id: 'm5', content: '🌍 Explore More'},
];

// Different greeting messages based on option type
const getGreetingMessages = (optionType) => {
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
        baseGreeting,
        {
          id: 'greeting-2',
          type: 'ai',
          content: 'If you ever find yourself wondering about something in the Bible or faith in general—I\'m here for that too.',
        },
        {
          id: 'greeting-3',
          type: 'ai',
          content: 'Want to explore something now?',
        },
      ];
    case 'modules':
      return [
        baseGreeting,
        {
          id: 'greeting-2',
          type: 'ai',
          content: 'Hey! 👋 Just so you know you’re free to explore this space however you like.',
        },
        {  
          id: 'greeting-3',  
          type: 'ai',
          content: 'Want to dive into something uplifting or just see what’s going on today? ',
        },
      ];
    default:
      return [baseGreeting];    
  }
};

// Function to randomly select one of the option arrays
const getRandomOptionType = () => {
  const optionTypes = [moodOptions, generalOptions, modulesOptions];
  const randomIndex = Math.floor(Math.random() * optionTypes.length);
  return optionTypes[randomIndex];
};

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
      if (action.payload.type === 'user') {
        state.showInitialSuggestions = false;
      }
    },
    clearMessages: state => {
      state.queryMessageList = [];
      state.isInitialized = false;
      state.showInitialSuggestions = false;
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
        const greetingMessages = getGreetingMessages(state.currentSuggestionType);
        
        state.queryMessageList = [...greetingMessages];
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