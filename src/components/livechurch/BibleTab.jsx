import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import tw from 'twrnc';
import Tts from 'react-native-tts';

import {
  useBibleVersionsQuery,
  useBibleBooksAPIQuery,
  useBibleBookChaptersQuery,
  useBibleBookChaptersDetailsQuery,
} from '../../store/bibleApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {
  setIsSpeaking,
  stopIsSpeaking,
} from '../../features/livechurches/liveChurchSlice';
import {useDispatch, useSelector} from 'react-redux';

const BibleTab = () => {
  const dispatch = useDispatch();
  const [selectedBible, setSelectedBible] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const {isSpeaking} = useSelector(state => state.livechurch);
  const {
    data: bibleData,
    isLoading: bibleIsLoading,
    error: bibleDataError,
  } = useBibleVersionsQuery();
  const {data: bibleBookData, isLoading: bibleBookIsLoading} =
    useBibleBooksAPIQuery({bibleId: selectedBible}, {skip: !selectedBible});
  const {data: bibleBookChapterData, isLoading: bibleBookChapterIsLoading} =
    useBibleBookChaptersQuery(
      {bibleId: selectedBible, bookId: selectedBook},
      {skip: !selectedBible || !selectedBook},
    );
  const {data: chapterDetailsData, isLoading: chapterDetailsIsLoading} =
    useBibleBookChaptersDetailsQuery(
      {bibleId: selectedBible, chapterId: selectedChapter},
      {skip: !selectedBible || !selectedChapter},
    );

  useEffect(() => {
    if (bibleData?.length > 0 && !selectedBible) {
      setSelectedBible(bibleData[0].id);
    }
  }, [bibleData]);

  useEffect(() => {
    if (bibleBookData?.length > 0 && !selectedBook) {
      setSelectedBook(bibleBookData[0].id);
    }
  }, [bibleBookData]);

  useEffect(() => {
    if (bibleBookChapterData?.length > 0 && !selectedChapter) {
      setSelectedChapter(bibleBookChapterData[0].id);
    }
  }, [bibleBookChapterData]);

  const removeHtmlTags = text => {
    const tagPattern = /<\/?[^>]+(>|$)/g;
    return text.replace(tagPattern, '').trim();
  };
  const handleStartListening = () => {
    if (!chapterDetailsData) return;
    dispatch(setIsSpeaking());

    const content = removeHtmlTags(chapterDetailsData?.data?.content || '');
    if (!content.trim()) return;

    const maxLength = Math.ceil(content.length / 2);
    const part1 = content.slice(0, maxLength);
    const part2 = content.slice(maxLength);


    const handleStop = () => {
      Tts.stop();
      dispatch(setIsSpeaking());
      Tts.removeAllListeners('tts-finish');
    };

    const speakChunk = (chunk, onDone) => {
      Tts.speak(chunk, {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.5,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });

      const finishListener = Tts.addEventListener('tts-finish', () => {
        onDone();
        finishListener.remove();
      });
    };

    if (isSpeaking) {
      handleStop();
    } else {
      dispatch(setIsSpeaking());

      Tts.getInitStatus()
        .then(() => {
          speakChunk(part1, () => {
            if (part2.trim()) {
              speakChunk(part2, () => {
                dispatch(stopIsSpeaking());
              });
            } else {
              dispatch(stopIsSpeaking());
            }
          });
        })
        .catch(error => {
          console.error('TTS Initialization Error:', error);
          dispatch(stopIsSpeaking());
        });
    }
  };

  const handleStopListening = () => {

    dispatch(stopIsSpeaking());
    Tts.removeAllListeners('tts-finish')
    Tts.stop();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {bibleIsLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingSpinner />
        </View>
      ) : bibleDataError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-[14px] text-red-500 text-center`}>
            Unable to load Bible languages. Please try again later.
            {JSON.stringify(bibleDataError)}
          </Text>
        </View>
      ) : (
        <>
          <View style={tw`mx-4 mt-3`}>
            <Text style={tw`text-[#040641] text-[16px] font-semibold`}>
              You Version
            </Text>
            <View style={tw`flex-row w-full flex-wrap gap-1`}>
              <Dropdown
                style={styles.dropdownversion}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={[styles.selectedTextStyle, {color: 'black'}]}
                data={bibleData}
                labelField="abbreviation"
                valueField="id"
                value={selectedBible}
                renderItem={item => (
                  <View style={tw`p-2`}>
                    <Text style={styles.name}>{item.abbreviation}</Text>
                  </View>
                )}
                onChange={item => {
                  handleStopListening();
                  setSelectedBible(item.id);
                  setSelectedBook(null);
                  setSelectedChapter(null);
                }}
              />
              <Dropdown
                style={styles.dropdownBooks}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={[styles.selectedTextStyle, {color: 'black'}]}
                data={bibleBookData || []}
                labelField="name"
                valueField="id"
                value={selectedBook}
                renderItem={item => (
                  <View style={tw`p-2`}>
                    <Text style={styles.name}>{item.name}</Text>
                  </View>
                )}
                onChange={item => {
                  handleStopListening();
                  setSelectedBook(item.id);
                  setSelectedChapter(null);
                }}
              />
              <Dropdown
                style={styles.dropdownverse}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={[styles.selectedTextStyle, {color: 'black'}]}
                data={bibleBookChapterData || []}
                labelField="number"
                valueField="id"
                value={selectedChapter}
                renderItem={item => (
                  <View style={tw`p-2`}>
                    <Text style={styles.name}>{item.number}</Text>
                  </View>
                )}
                onChange={item => {
                  handleStopListening();
                  setSelectedChapter(item.id);
                }}
              />
            </View>
          </View>
          <View style={tw`border-b border-gray-300 opacity-30 mb-1 mt-1`} />
          <View style={styles.scrollableContainer}>
            <ScrollView style={tw`flex-1 mb-18 mx-4`}>
              {!chapterDetailsIsLoading && chapterDetailsData && (
                <View>
                  <Text
                    style={tw`text-[#040641] text-center text-[18px] font-semibold mt-2`}>
                    {bibleBookData?.find(book => book.id === selectedBook)
                      ?.name || ''}
                  </Text>
                  <Text
                    style={tw`text-[#040641] text-[14px] opacity-90 mt-2 mb-4`}>
                    {removeHtmlTags(chapterDetailsData?.data?.content || '')}
                  </Text>
                </View>
              )}
            </ScrollView>
            <View style={[tw``, styles.fixedButtonContainer]}>
              <TouchableOpacity
                style={tw`bg-[#040641] flex-row gap-2 w-40 h-12 rounded-full justify-center items-center`}
                onPress={
                  isSpeaking ? handleStopListening : handleStartListening
                }>
                <Text style={tw`text-white text-[15px]`}>
                  {isSpeaking ? 'Stop listening' : 'Start listening'}
                </Text>
                <Image
                  source={
                    isSpeaking
                      ? require('../../assets/images/pauseiconwhite.png')
                      : require('../../assets/images/playcirclewhiteicon.png')
                  }
                  style={tw`w-5 h-5`}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default BibleTab;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownBooks: {
    width: '50%',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    color: 'black',
  },
  dropdownverse: {
    width: '21%',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    color: 'black',
  },
  dropdownversion: {
    width: '25%',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    color: 'black',
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  scrollableContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -90}],
  },
  name: {
    fontSize: 15,
    color: '#040641',
  },
});
