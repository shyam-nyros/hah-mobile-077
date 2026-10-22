import React, {useRef, useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import {useRagQueryAPIMutation} from '../../features/home/homeApiSlice';
import AIMessage from './AIMessage';
import UserMessage from './UserMessage';
import MessageInput from './MessageInput';
import {useDispatch, useSelector} from 'react-redux';
import {
  setHideMinistryIcon,
  setShowMinistryIcon,
} from '../../features/auth/authSlice';
import {
  addMessage,
  initializeGreetings,
} from '../../features/assistance/assistanceSlice';
import {useFocusEffect} from '@react-navigation/native';
import musicicon from '../../assets/images/musicoutlineicon.png';
import videoicon from '../../assets/images/blueplayicon.png';
import ebookicon from '../../assets/images/bluebookicon.png';
import Hyperlink from 'react-native-hyperlink';
import {Linking} from 'react-native';

const preprocessMarkdownLinks = text => {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 : $2');
};

// Give Project Card Component
const GiveProjectCard = ({item, onPress}) => (
  <TouchableOpacity
    onPress={() => onPress(item)}
    style={tw`bg-white rounded-lg p-3 w-50`}>
    <Image
      source={{uri: item.cover_image}}
      style={tw`w-full h-28 rounded-lg mb-2`}
      resizeMode="cover"
    />
    <Text
      style={tw`text-[#040641] font-semibold text-[15px] mb-1`}
      numberOfLines={1}>
      {item.title}
    </Text>
    <Text style={tw`text-gray-600 text-[13px] leading-4`} numberOfLines={2}>
      {item.description}
    </Text>
  </TouchableOpacity>
);

// Library Card Component
const LibraryCard = ({item, onPress}) => {
  // Function to get the appropriate icon based on type
  const getIconByType = type => {
    switch (type?.toLowerCase()) {
      case 'ebook':
        return 'https://www.heavenathand.org:3002/uploads/libraries/1753073796001-istockphoto-1278490310-612x612.jpg';
      case 'video':
        return 'https://www.heavenathand.org:3002/uploads/libraries/1753073796001-istockphoto-1278490310-612x612.jpg';
      case 'audio':
        return 'https://www.heavenathand.org:3002/uploads/libraries/1753073796001-istockphoto-1278490310-612x612.jpg';
      default:
        return 'https://www.heavenathand.org:3002/uploads/libraries/1753073796001-istockphoto-1278490310-612x612.jpg';
    }
  };

  // Function to get background color based on type
  const getBackgroundByType = type => {
    switch (type?.toLowerCase()) {
      case 'ebook':
        return '#E0F2FE'; // Light blue
      case 'video':
        return '#FEE2E2'; // Light red
      case 'audio':
        return '#F0FDF4'; // Light green
      default:
        return '#E0F2FE';
    }
  };

  const getLibraryItemIconType = type => {
    if (type === 'ebook') {
      return ebookicon;
    } else if (type === 'video') {
      return videoicon;
    } else {
      return musicicon;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={tw`bg-white rounded-lg p-3 w-50`}>
      <View
        style={[
          tw`w-full h-28 rounded-lg mb-2 overflow-hidden`, // add overflow-hidden for rounded corners
        ]}>
        <Image
          source={{uri: item.cover_image}}
          style={tw`w-full h-28 rounded-lg`}
          resizeMode="cover"
        />

        {/* Library Type Icon Overlay */}
        <View style={tw`absolute top-1 right-1 bg-white p-1 rounded-full`}>
          <Image
            source={getLibraryItemIconType(item.type)}
            style={tw`w-4 h-4`}
            resizeMode="contain"
          />
        </View>

        {/* Price Tag Overlay */}
        <View
          style={tw`absolute bottom-1 right-1 bg-[#0077B6] px-2 py-1 rounded-lg`}>
          <Text style={tw`text-white text-[10px] font-medium`}>
            {item.price === 'USD 0'
              ? 'Free'
              : item.price?.replace('USD ', '$') || 'Free'}
          </Text>
        </View>
      </View>

      <Text
        style={tw`text-[#0077B6] font-semibold text-[15px] mb-1`}
        numberOfLines={2}>
        {item.title}
      </Text>

      <Text
        style={tw`text-gray-600 text-[13px] leading-4 mb-1`}
        numberOfLines={1}>
        {item.author}
      </Text>
    </TouchableOpacity>
  );
};

// Events Card Component
const EventCard = ({item, onPress}) => {
  // Function to format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to format time from seconds
  const formatTime = timeInSeconds => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  // Function to get event type color
  const getEventTypeColor = eventType => {
    switch (eventType?.toLowerCase()) {
      case 'online':
        return '#10B981'; // Green
      case 'offline':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={tw`bg-white rounded-lg p-3 mb-3 w-50`}>
      {/* Event type indicator */}
      <View
        style={tw`w-full h-28 rounded-lg mb-2 bg-[#F3F4F6] justify-center items-center relative`}>
        <Image
          source={{uri: item.cover_image}}
          style={tw`w-full h-28 rounded-lg mb-2`}
          resizeMode="cover"
        />
      </View>

      <Text
        style={tw`text-[#040641] font-semibold text-[15px] mb-1`}
        numberOfLines={2}>
        {item.title}
      </Text>

      <Text
        style={tw`text-gray-600 text-[13px] leading-4 mb-1`}
        numberOfLines={2}>
        {item.description ? item.description : item.longDescription}
      </Text>

      <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-[#0077B6] text-[12px] font-medium`}>
          {item.price === 'Free' ? 'Free' : item.price}
        </Text>
        {item.eventType === 'offline' && (
          <Text style={tw`text-gray-500 text-[10px]`} numberOfLines={1}>
            📍 {item.address?.split(',')[0]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Live Churches Card Component
const LiveChurchCard = ({item, onPress}) => {
  // Function to format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to format time from seconds
  const formatTime = timeInSeconds => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  // Get the first event time for display
  const firstEvent =
    item.events && item.events.length > 0 ? item.events[0] : null;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={tw`bg-white rounded-lg p-3 mb-3 w-50`}>
      {/* Image placeholder */}
      <View
        style={tw`w-full h-28 rounded-lg mb-2 bg-[#F3F4F6] overflow-hidden`}>
        <Image
          source={{uri: item.cover_image}}
          style={tw`w-full h-full rounded-lg`}
          resizeMode="cover"
        />
      </View>

      <Text
        style={tw`text-[#040641] font-semibold text-[15px] mb-1`}
        numberOfLines={1}>
        {item.title}
      </Text>

      <Text
        style={tw`text-gray-600 text-[13px] leading-4 mb-1`}
        numberOfLines={1}>
        {item.church}
      </Text>

      <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-[#0077B6] text-[12px] font-medium`}>
          {item.organization}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Mood Options Component
const MoodOptions = ({moodOptions, onMoodPress}) => {
  if (!moodOptions || moodOptions.length === 0) return null;

  return (
    <View style={tw``}>
      {/* Mood Options - Direct without avatar or background */}
      <View style={tw`flex-row flex-wrap justify-start`}>
        {moodOptions.map(mood => (
          <TouchableOpacity
            key={mood.id}
            onPress={() => onMoodPress(mood.content)}
            style={tw`bg-[#E0F2FE] rounded-full px-3 py-2 m-1`}>
            <Text style={tw`text-[#0D0D0D] text-[14px]`}>{mood.content}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Enhanced AIMessage component that can display all card types
const AIMessageWithCards = ({
  content,
  results,
  suggestions,
  onCardPress,
  onSuggestionPress,
}) => {
  // const renderGiveProjectCards = () => {
  //   if (!results?.search_give_projects?.results) return null;

  //   const projects = results.search_give_projects.results;

  //   // If no projects, don't render anything
  //   if (projects.length === 0) return null;

  //   const displayedProjects = projects.slice(0, 2);
  //   const hasMore = projects.length > 2;

  //   return (
  //     <View style={tw`mt-1`}>
  //       <View style={tw`px-2 p-1 rounded-4 bg-white`}>
  //         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  //           <View style={tw`flex-row gap-2`}>
  //             {displayedProjects.map(item => (
  //               <GiveProjectCard
  //                 key={item.id}
  //                 item={item}
  //                 onPress={item => onCardPress('give_project', item)}
  //               />
  //             ))}
  //           </View>
  //         </ScrollView>

  //         {/* Right gradient (only if more than 2 items) */}
  //         {hasMore && (
  //           <LinearGradient
  //             colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
  //             start={{x: 0, y: 0}}
  //             end={{x: 1, y: 0}}
  //             style={[
  //               tw`absolute top-0 bottom-0 right-0 rounded-2`,
  //               {width: 70},
  //             ]}
  //             pointerEvents="none"
  //           />
  //         )}

  //         {/* Explore button (only if more than 2 items) */}
  //         {hasMore && (
  //           <TouchableOpacity onPress={() => onCardPress('explore_give', null)}>
  //             <View
  //               style={tw`bg-[#fff] rounded-full shadow-md px-4 py-3 absolute right-3 bottom-20`}>
  //               <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
  //                 Explore
  //               </Text>
  //             </View>
  //           </TouchableOpacity>
  //         )}
  //       </View>
  //     </View>
  //   );
  // };

  // const renderLibraryCards = () => {
  //   if (!results?.search_library?.results) return null;

  //   const library = results.search_library.results;

  //   // If no library items, don't render anything
  //   if (library.length === 0) return null;

  //   const displayedLibrary = library.slice(0, 2); // show only 2
  //   const hasMore = library.length > 2;

  //   return (
  //     <View style={tw`mt-1`}>
  //       {/* Cards Scroll */}
  //       <View style={tw`px-2 p-1 rounded-4 bg-white`}>
  //         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  //           <View style={tw`flex-row gap-2`}>
  //             {displayedLibrary.map(item => (
  //               <LibraryCard
  //                 key={item.id}
  //                 item={item}
  //                 onPress={item => onCardPress('library_item', item, item.type)}
  //               />
  //             ))}
  //           </View>
  //         </ScrollView>

  //         {/* Right gradient (only if more than 2 items) */}
  //         {hasMore && (
  //           <LinearGradient
  //             colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
  //             start={{x: 0, y: 0}}
  //             end={{x: 1, y: 0}}
  //             style={[
  //               tw`absolute top-0 bottom-0 right-0 rounded-2`,
  //               {width: 70},
  //             ]}
  //             pointerEvents="none"
  //           />
  //         )}

  //         {/* Explore button (only if more than 2 items) */}
  //         {hasMore && (
  //           <TouchableOpacity
  //             onPress={() => onCardPress('explore_library', null)}>
  //             <View
  //               style={tw`bg-[#fff] rounded-full shadow-md px-4 py-3 absolute right-3 bottom-20`}>
  //               <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
  //                 Explore
  //               </Text>
  //             </View>
  //           </TouchableOpacity>
  //         )}
  //       </View>
  //     </View>
  //   );
  // };

  // NEW: Render Bible Response for mood support

  const renderGiveProjectCards = () => {
    if (!results?.search_give_projects?.results) return null;

    const projects = results.search_give_projects.results;

    // If no projects, don't render anything
    if (projects.length === 0) return null;

    const displayedProjects = projects.slice(0, 2);
    const hasMore = projects.length > 2;

    return (
      <View style={tw`mt-1`}>
        <View style={tw`px-2 p-1 rounded-4 bg-white`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {displayedProjects.map(item => (
                <GiveProjectCard
                  key={item.id}
                  item={item}
                  onPress={item => onCardPress('give_project', item)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Right gradient (only if more than 2 items) */}
          {hasMore && (
            <LinearGradient
              colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                tw`absolute top-0 bottom-0 right-0 rounded-2`,
                {width: 70, zIndex: 1},
              ]}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Explore button (only if more than 2 items) */}
        {hasMore && (
          <TouchableOpacity
            onPress={() => onCardPress('explore_give', null)}
            style={tw`absolute right-3 bottom-20 z-50`}>
            <View style={tw`bg-white rounded-full shadow-md px-4 py-3`}>
              <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
                Explore
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLibraryCards = () => {
    if (!results?.search_library?.results) return null;

    const library = results.search_library.results;

    // If no library items, don't render anything
    if (library.length === 0) return null;

    const displayedLibrary = library.slice(0, 2); // show only 2
    const hasMore = library.length > 2;

    return (
      <View style={tw`mt-1`}>
        {/* Cards Scroll */}
        <View style={tw`px-2 p-1 rounded-4 bg-white`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {displayedLibrary.map(item => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onPress={item => onCardPress('library_item', item, item.type)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Right gradient (only if more than 2 items) */}
          {hasMore && (
            <LinearGradient
              colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                tw`absolute top-0 bottom-0 right-0 rounded-2`,
                {width: 70, zIndex: 1},
              ]}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Explore button (only if more than 2 items) */}
        {hasMore && (
          <TouchableOpacity
            onPress={() => onCardPress('explore_library', null)}
            style={tw`absolute right-3 bottom-20 z-50`}>
            <View style={tw`bg-white rounded-full shadow-md px-4 py-3`}>
              <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
                Explore
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEventCards = () => {
    if (!results?.search_events?.results) return null;

    const events = results.search_events.results;

    // If no events, don't render anything
    if (events.length === 0) return null;

    const displayedEvents = events.slice(0, 2); // show only 2
    const hasMore = events.length > 2;

    return (
      <View style={tw`mt-1`}>
        <View style={tw`px-2 p-1 rounded-4 bg-white`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {displayedEvents.map(item => (
                <EventCard
                  key={item.id}
                  item={item}
                  onPress={item =>
                    onCardPress('event_item', item, item.eventType)
                  }
                />
              ))}
            </View>
          </ScrollView>

          {/* Right gradient (only if more than 2 items) */}
          {hasMore && (
            <LinearGradient
              colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                tw`absolute top-0 bottom-0 right-0 rounded-2`,
                {width: 70, zIndex: 1},
              ]}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Explore button (only if more than 2 items) */}
        {hasMore && (
          <TouchableOpacity
            onPress={() => onCardPress('explore_events', null)}
            style={tw`absolute right-3 bottom-20 z-50`}>
            <View style={tw`bg-white rounded-full shadow-md px-4 py-3`}>
              <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
                Explore
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLiveChurchCards = () => {
    if (!results?.search_live_churches?.results) return null;

    const liveChurches = results.search_live_churches.results;

    // If no live churches, don't render anything
    if (liveChurches.length === 0) return null;

    const displayedChurches = liveChurches.slice(0, 2); // show only 2
    const hasMore = liveChurches.length > 2;

    return (
      <View style={tw`mt-1`}>
        <View style={tw`px-2 p-1 rounded-4 bg-white`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {displayedChurches.map(item => (
                <LiveChurchCard
                  key={item.id}
                  item={item}
                  onPress={item => onCardPress('live_church_item', item)}
                />
              ))}
            </View>
          </ScrollView>

          {hasMore && (
            <LinearGradient
              colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                tw`absolute top-0 bottom-0 right-0 rounded-2`,
                {width: 70, zIndex: 1},
              ]}
              pointerEvents="none"
            />
          )}
        </View>

        {hasMore && (
          <TouchableOpacity
            onPress={() => onCardPress('explore_live_churches', null)}
            style={tw`absolute right-3 bottom-20 z-50`}>
            <View style={tw`bg-white rounded-full shadow-md px-4 py-3`}>
              <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
                Explore
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // const renderBibleResponse = () => {
  //   if (!results?.search_mood_support?.bibleResponse) return null;

  //   const bibleResponse = results.search_mood_support.bibleResponse;
  //   if (!bibleResponse.sources || bibleResponse.sources.length === 0)
  //     return null;

  //   return (
  //     <View style={tw`mt-1`}>
  //       <View style={tw`bg-white rounded-lg p-3 mx-2 mt-1`}>
  //         <Text style={tw`text-[#040641] text-[14px] leading-5`}>
  //           {bibleResponse.answer}
  //         </Text>
  //       </View>
  //     </View>
  //   );
  // };
const renderBibleResponse = () => {
  // Check for both response formats
  let answerText = null;
  
  // New format: direct answer field (when Bible content is in main content)
  if (content && content.includes('"') && content.includes('(')) {
    answerText = content;
  }
  // Old format: nested bibleResponse
  else if (results?.search_mood_support?.bibleResponse) {
    const bibleResponse = results.search_mood_support.bibleResponse;
    if (!bibleResponse.sources || bibleResponse.sources.length === 0) return null;
    answerText = bibleResponse.answer;
  }
  
  if (!answerText) return null;

  // Parse the answer format (handles both separated and concatenated verses)
  const parseAnswer = (text) => {
    // First, extract ALL Bible verses from the entire text
    const versePattern = /"([^"]+)"\s*\(([^)]+)\)/g;
    const verses = [];
    let match;
    
    while ((match = versePattern.exec(text)) !== null) {
      verses.push({
        text: match[1].trim(),
        reference: match[2].trim()
      });
    }
    
    // Remove all Bible verses from the text to get the main message
    let mainMessage = text.replace(/"[^"]+"\s*\([^)]+\)/g, '').trim();
    
    // Clean up extra whitespace and newlines
    mainMessage = mainMessage.replace(/\s+/g, ' ').trim();
    
    // If there are multiple sentences, we can split them into paragraphs
    // But keep it simple for now
    
    return { mainMessage, verses };
  };

  const { mainMessage, verses } = parseAnswer(answerText);

  return (
    <View style={tw`mt-1`}>
      {/* Main Message */}
      <View style={tw`bg-[#E3F2FD] rounded-lg p-3 mx-2 mt-1`}>
        <Text style={tw`text-[#040641] text-[14px] leading-5`}>
          {mainMessage}
        </Text>
      </View>

      {/* Bible Verses */}
      {verses.map((verse, index) => (
        <View key={index} style={tw`bg-[#F5F5F5] rounded-lg p-3 mx-2 mt-2`}>
          {/* Bible Reference Header */}
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`bg-[#E0E0E0] rounded px-2 py-1`}>
              <Text style={tw`text-[#040641] text-[12px] font-medium`}>
                📖 {verse.reference}
              </Text>
            </View>
          </View>
          
          {/* Bible Verse Text */}
          <Text style={tw`text-[#040641] text-[14px] leading-5 italic`}>
            "{verse.text}"
          </Text>
        </View>
      ))}
    </View>
  );
};

  // NEW: Render Mood Support Cards (Library Resources)
  // const renderMoodSupportCards = () => {
  //   if (!results?.search_mood_support?.libraryResources) return null;

  //   const libraryResources =
  //     results.search_mood_support.libraryResources.resources;
  //   if (!libraryResources || libraryResources.length === 0) return null;

  //   const displayedLibrary = libraryResources.slice(0, 2); // show only 2

  //   return (
  //     <View style={tw`mt-3`}>

  //       {/* Cards Scroll */}
  //       <View style={tw`px-2 p-2 rounded-lg bg-white mt-1`}>
  //         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  //           <View style={tw`flex-row gap-2`}>
  //             {displayedLibrary.map(item => (
  //               <LibraryCard
  //                 key={item.id}
  //                 item={item}
  //                 onPress={item => onCardPress('library_item', item, item.type)}
  //               />
  //             ))}
  //           </View>
  //         </ScrollView>

  //         {/* Right gradient */}
  //         <LinearGradient
  //           colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
  //           start={{x: 0, y: 0}}
  //           end={{x: 1, y: 0}}
  //           style={[tw`absolute top-0 bottom-0 right-0 rounded-2`, {width: 70}]}
  //           pointerEvents="none"
  //         />

  //         <TouchableOpacity
  //           onPress={() => onCardPress('explore_library', null)}>
  //           <View
  //             style={tw`bg-[#fff] rounded-full shadow-md px-4 py-3 absolute right-3 bottom-20`}>
  //             <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
  //               Explore
  //             </Text>
  //           </View>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  const renderMoodSupportCards = () => {
    if (!results?.search_mood_support?.libraryResources) return null;

    const libraryResources =
      results.search_mood_support.libraryResources.resources;
    if (!libraryResources || libraryResources.length === 0) return null;

    const displayedLibrary = libraryResources.slice(0, 2); // show only 2
    const hasMore = libraryResources.length > 2;

    return (
      <View style={tw`mt-3`}>
        {/* Cards Scroll */}
        <View style={tw`px-2 p-2 rounded-lg bg-white mt-1`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {displayedLibrary.map(item => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onPress={item => onCardPress('library_item', item, item.type)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Right gradient (only if more than 2 items) */}
          {hasMore && (
            <LinearGradient
              colors={['transparent', 'rgba(129, 129, 129, 0.8)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                tw`absolute top-0 bottom-0 right-0 rounded-2`,
                {width: 70, zIndex: 1},
              ]}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Explore button (only if more than 2 items) */}
        {hasMore && (
          <TouchableOpacity
            onPress={() => onCardPress('explore_library', null)}
            style={tw`absolute right-3 bottom-20 z-50`}>
            <View style={tw`bg-white rounded-full shadow-md px-4 py-3`}>
              <Text style={tw`text-[#0077B6] text-[13px] font-semibold`}>
                Explore
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!suggestions || suggestions.length === 0) {
      // console.log('No suggestions to render');
      return null;
    }

    return (
      <View style={tw`flex-row flex-wrap mt-1`}>
        {suggestions.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              console.log('Suggestion clicked:', s);
              onSuggestionPress(s);
            }}
            style={tw`bg-[#E0F2FE] rounded-full px-3 py-2 m-1`}>
            <Text style={tw`text-[#0D0D0D] text-[14px]`}>
              {s.replace(/^\d+\.\s*/, '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={tw`flex-row justify-start items-start`}>
      {/* AI Avatar */}
      <View style={tw`mr-3 mt-1`}>
        <LinearGradient
          colors={['#f8f9f9ff', '#f6f7f7ff']}
          style={tw`w-8 h-8 rounded-full justify-center items-center`}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={tw`w-5 h-5`}
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

      {/* Message Content with Cards */}
      <View style={tw`max-w-[80%]`}>
        <View
          style={tw`bg-white rounded-tl-[5px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[20px] px-3 py-3`}>
          <Hyperlink
            linkDefault={true} // opens links automatically
            linkStyle={{color: '#0077B6', textDecorationLine: 'underline'}}
            onPress={url => Linking.openURL(url)} // optional
          >
            <Text style={tw`text-[#040641] text-[14px] leading-5`}>
              {preprocessMarkdownLinks(content)}
            </Text>
          </Hyperlink>
        </View>

        {/* Regular cards */}
        {renderGiveProjectCards()}
        {renderLibraryCards()}
        {renderEventCards()}
        {renderLiveChurchCards()}

        {/* NEW: Mood support cards */}
        {renderBibleResponse()}
        {renderMoodSupportCards()}

        {renderSuggestions()}
      </View>
    </View>
  );
};

const MinistryAssistantScreen = ({navigation}) => {
  const dispatch = useDispatch();

  // const {
  //   queryMessageList: messages,
  //   showInitialSuggestions,
  //   initialSuggestions,
  // } = useSelector(state => state.assistance);
  const {
    queryMessageList: messages,
    showInitialSuggestions,
    initialSuggestions,
    currentSuggestionType, // Add this line
  } = useSelector(state => state.assistance);
  const scrollViewRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  // RTK Query mutation hook with loading state
  const [ragQueryAPI, {isLoading: isApiLoading}] = useRagQueryAPIMutation();

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleCardPress = (type, item, subType = null) => {
    console.log('Card pressed:', type, item, 'Sub type:', subType);

    if (type === 'give_project') {
      navigation.navigate('GiveDetails', {
        giveProjectId: item?.id,
      });
    } else if (type === 'explore_give') {
      navigation.navigate('Give');
    } else if (type === 'library_item') {
      // Navigate based on library type
      switch (subType?.toLowerCase()) {
        case 'ebook':
          navigation.navigate('BookDetails', {
            libraryItemId: item?.id,
            libraryItem: item,
            type: subType,
          });
          break;
        case 'video':
          navigation.navigate('VideoDetails', {
            libraryItemId: item?.id,
            libraryItem: item,
            type: subType,
          });
          break;
        case 'audio':
          navigation.navigate('PodcastDetails', {
            libraryItemId: item?.id,
            libraryItem: item,
            type: subType,
          });
          break;
        default:
          // Fallback to general library details
          navigation.navigate('Library');
          break;
      }
    } else if (type === 'explore_library') {
      // Navigate to library screen - adjust navigation name as needed
      navigation.navigate('Library');
    } else if (type === 'event_item') {
      // Navigate to event details
      navigation.navigate('EventDetails', {
        eventId: item?.id,
        eventItem: item,
        eventType: subType,
      });
    } else if (type === 'explore_events') {
      // Navigate to events screen
      navigation.navigate('Events');
    } else if (type === 'live_church_item') {
      // Navigate to live church details or directly to streaming
      navigation.navigate('LiveChurchDetails', {
        liveChurchId: item?.id,
        churchId: item?.churchId,
      });
    } else if (type === 'explore_live_churches') {
      // Navigate to live churches screen
      navigation.navigate('Livechurch');
    }
  };

  const handleMoodPress = async moodText => {
    // Send the mood as a message
    await handleSendMessage(moodText);
  };

  const handleSendMessage = async messageText => {
    if (!messageText.trim() || isApiLoading) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText.trim(),
    };
    dispatch(addMessage(userMessage));

    try {
      // Call the API - RTK Query handles the loading state
      const response = await ragQueryAPI({
        question: messageText.trim(),
        sessionId: sessionId,
      }).unwrap();

      // Update sessionId for future requests
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Add AI response with results data
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        results: response.results, // Include results for card display
        suggestions: response.suggestions || [],
      };
      dispatch(addMessage(aiMessage));
    } catch (error) {
      console.error('Failed to fetch AI response:', error);

      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
      };
      dispatch(addMessage(errorMessage));
    }
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(setHideMinistryIcon());
      // Initialize greeting messages when screen is focused
      dispatch(initializeGreetings());

      // Scroll to bottom when screen comes into focus
      if (messages.length > 0) {
        scrollToBottom();
      }

      return () => dispatch(setShowMinistryIcon());
    }, [dispatch, messages.length, scrollToBottom]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#fff]`}>
        <View style={tw`mx-2 flex-row items-center justify-between py-2`}>
          <View style={tw`flex-row gap-2 items-center`}>
            <TouchableOpacity onPress={navigateToPreviousScreen}>
              <View style={tw`py-2 px-2`}>
                <Image
                  source={require('../../assets/images/backnavicon.png')}
                  style={tw`w-[26px] h-[46px]`}
                />
              </View>
            </TouchableOpacity>
            <View>
              <LinearGradient
                colors={['#0077B6', '#90E0EF']}
                style={tw`w-12 h-12 rounded-full justify-center items-center`}>
                <Image
                  source={require('../../assets/images/logo_white.png')}
                  style={tw`w-8 h-8`}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={tw`text-[18px] text-[#040641] font-medium`}>
              Ministry assistant
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Chat Body */}
      <View style={tw`flex-1`}>
        <LinearGradient
          colors={['#0077B6', '#46a6b9ff']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={tw`flex-1`}>
          <ScrollView
            ref={scrollViewRef}
            style={tw`flex-1 px-4 pt-4`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6 gap-2`}>
            {/* {initialSuggestions.length > 0 && (
              <MoodOptions
                moodOptions={initialSuggestions}
                onMoodPress={handleMoodPress}
                optionType={currentSuggestionType} // Add this prop
              />
            )} */}
            {/* Chat Messages */}
            {/* {messages.map(message =>
              message.type === 'user' ? (
                <UserMessage key={message.id} content={message.content} />
              ) : (
                <AIMessageWithCards
                  key={message.id}
                  content={message.content}
                  results={message.results}
                  onCardPress={handleCardPress}
                  suggestions={message.suggestions}
                  onSuggestionPress={s => {
                    handleSendMessage(s);
                  }}
                />
              ),
            )} */}
            {messages.map(message =>
              message.type === 'user' ? (
                <UserMessage key={message.id} content={message.content} />
              ) : message.type === 'options' ? (
                <MoodOptions
                  key={message.id}
                  moodOptions={message.options}
                  onMoodPress={handleMoodPress}
                />
              ) : (
                <AIMessageWithCards
                  key={message.id}
                  content={message.content}
                  results={message.results}
                  onCardPress={handleCardPress}
                  suggestions={message.suggestions}
                  onSuggestionPress={s => handleSendMessage(s)}
                />
              ),
            )}

            {/* Show mood options after greeting messages */}
            {/* {initialSuggestions.length > 0 && (
              <MoodOptions
                moodOptions={initialSuggestions}
                onMoodPress={handleMoodPress}
                optionType={currentSuggestionType} // Add this prop
              />
            )} */}

            {/* Show loading message when API is processing */}
            {isApiLoading && (
              <AIMessage key="loading-message" content="" isLoading={true} />
            )}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Footer Input */}
      <View style={styles.createMessage}>
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isApiLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  createMessage: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
});

export default MinistryAssistantScreen;
