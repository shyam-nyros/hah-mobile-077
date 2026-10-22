import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Icons from 'react-native-heroicons/solid';
import {useDispatch, useSelector} from 'react-redux';
import {setInterestedContent} from '../../../features/auth/authSlice';
import {useGetContentListQuery} from '../../../features/content/contentApiSlice';
import {useUpdateUserAPIMutation} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import showToast from '../../../utils/toast/showToast';
import {useNavigation} from '@react-navigation/native';

const EXACT_SELECTIONS = 3;

const GrowthGoalsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {interestedContent} = useSelector(state => state.auth);

  const {data: interestList, isLoading: interestListLoading} =
    useGetContentListQuery();

  const [updateUserAPI, {isLoading: userUpdateLoading}] =
    useUpdateUserAPIMutation();

  const [selected, setSelected] = useState(new Set());
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollContainerHeight = useRef(0);
  const scrollContentHeight = useRef(0);

  // Pre-select from existing interestedContent or default to the first 3
  useEffect(() => {
    if (!interestListLoading && interestList?.length) {
      if (interestedContent?.length > 0) {
        const ids = interestedContent
          .slice(0, EXACT_SELECTIONS)
          .map(i => (typeof i === 'string' ? i : i._id));
        setSelected(new Set(ids));
      } else {
        setSelected(
          new Set(interestList.slice(0, EXACT_SELECTIONS).map(i => i._id)),
        );
      }
    }
  }, [interestListLoading, interestList]);

  const toggleInterest = id => {
    if (selected.has(id)) {
      // Prevent deselecting when at exactly 3
      if (selected.size <= EXACT_SELECTIONS) {
        showToast(
          'error',
          'You must have exactly 3 interests. Tap a different one to swap.',
        );
        return;
      }
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.size >= EXACT_SELECTIONS) {
          // Auto-replace the oldest selected interest
          const [oldest] = next;
          next.delete(oldest);
        }
        next.add(id);
        return next;
      });
    }
  };

  const handleContinue = async () => {
    if (selected.size !== EXACT_SELECTIONS) {
      showToast(
        'error',
        `Please select exactly ${EXACT_SELECTIONS} interests.`,
      );
      return;
    }
    try {
      const selectedIds = [...selected];
      await updateUserAPI({
        interests: JSON.stringify(selectedIds),
      }).unwrap();
      dispatch(setInterestedContent(selectedIds));
      navigation.navigate('GrowthGoalsFinal');
    } catch (error) {
      showToast('error', error?.data?.msg || 'Failed to save interests.');
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const atBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setIsAtBottom(atBottom);
  };

  const handleScrollLayout = event => {
    scrollContainerHeight.current = event.nativeEvent.layout.height;
    setIsScrollable(
      scrollContentHeight.current > event.nativeEvent.layout.height,
    );
  };

  const handleContentSizeChange = (_, contentHeight) => {
    scrollContentHeight.current = contentHeight;
    setIsScrollable(contentHeight > scrollContainerHeight.current);
  };

  return (
    <View style={styles.screenWrapper}>
      {(interestListLoading || userUpdateLoading) && <LoadingSpinner />}

      {/* ── GRADIENT HEADER ── */}
      <LinearGradient
        colors={['#0E86B7', '#6EC1E4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroHeader}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icons.ChevronLeftIcon size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        <Text style={styles.heroTitle}>Choose your Journey</Text>
        <Text style={styles.heroSubtitle}>
          Select topics you'd like to explore. We'll{'\n'}personalize your
          experience based on{'\n'}your preferences.
        </Text>
      </LinearGradient>

      {/* ── CONTENT ── */}
      <View style={styles.cardContainer}>
        {/* Instruction */}
        <Text style={styles.instruction}>
          Select at least {EXACT_SELECTIONS} paths to begin{'\n'}your journey
        </Text>

        {/* Chips */}
        <View style={styles.scrollContainer} onLayout={handleScrollLayout}>
          <ScrollView
            contentContainerStyle={styles.chipsWrapper}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}>
            {interestListLoading ? (
              <ActivityIndicator
                size="large"
                color="#0077B6"
                style={{marginTop: 32}}
              />
            ) : (
              interestList?.map(interest => {
                const isSelected = selected.has(interest._id);
                return (
                  <TouchableOpacity
                    key={interest._id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleInterest(interest._id)}
                    activeOpacity={0.7}>
                    {isSelected && (
                      <Icons.CheckCircleIcon
                        size={20}
                        color="#0077B6"
                        style={styles.checkIcon}
                      />
                    )}
                    <Text style={styles.chipText}>{interest.name}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Scroll hint — hidden once user scrolls to bottom */}
          {isScrollable && !isAtBottom && (
            <>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                style={styles.scrollFade}
                pointerEvents="none"
              />
              <View style={styles.scrollHintBadge} pointerEvents="none">
                <Icons.ChevronDownIcon size={14} color="#0077B6" />
                <Text style={styles.scrollHintText}>scroll for more</Text>
              </View>
            </>
          )}
        </View>

        {/* Bottom actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (selected.size !== EXACT_SELECTIONS || userUpdateLoading) &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selected.size !== EXACT_SELECTIONS || userUpdateLoading}>
            {userUpdateLoading ? (
              <ActivityIndicator color="#0077B6" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default GrowthGoalsScreen;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── HEADER ── */
  heroHeader: {
    paddingHorizontal: 28,
    paddingBottom: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    minHeight: 250,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.92,
    textAlign: 'center',
    lineHeight: 24,
  },

  /* ── CARD ── */
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },

  /* ── INSTRUCTION ── */
  instruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },

  /* ── SCROLL CONTAINER + HINT ── */
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  scrollHintBadge: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  scrollHintText: {
    fontSize: 12,
    color: '#0077B6',
    fontWeight: '500',
  },

  /* ── CHIPS ── */
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0D3DC',
  },
  chipSelected: {
    borderColor: '#0077B6',
  },
  checkIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
  },

  /* ── BOTTOM ACTIONS ── */
  actionsContainer: {
    paddingTop: 20,
  },
  continueButton: {
    height: 54,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#0077B6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  continueButtonText: {
    color: '#0077B6',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.45,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});
