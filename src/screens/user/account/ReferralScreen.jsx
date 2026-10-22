import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Share,
  Clipboard,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import * as Icons from 'react-native-heroicons/solid';
import * as OutlineIcons from 'react-native-heroicons/outline';
import {useGetReferralStatsAPIQuery} from '../../../features/auth/authApiSlice';
import showToast from '../../../utils/toast/showToast';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/heaven-at-hand/id6739997898';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.hah';

const ReferralScreen = ({navigation}) => {
  const {data: statsData, isLoading, isError} = useGetReferralStatsAPIQuery();

  const referralCode = statsData?.data?.referral_code || '';
  const displayLink = referralCode ? `${referralCode}` : '—';

  const shareMessage =
    `🙏 Join me on Heaven at Hand!\n\n` +
    `Use my referral code when you sign up:\n` +
    `🔑 ${referralCode}\n\n` +
    `📱 Download the app:\n` +
    `App Store → ${APP_STORE_URL}\n` +
    `Google Play → ${PLAY_STORE_URL}`;

  const handleCopy = useCallback(() => {
    if (!referralCode) return;
    Clipboard.setString(referralCode);
    showToast('success', 'Referral code copied!');
  }, [referralCode]);

  const handleWhatsApp = useCallback(() => {
    if (!referralCode) return;
    const url = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() =>
      showToast('error', 'WhatsApp is not installed'),
    );
  }, [referralCode, shareMessage]);

  const handleMessages = useCallback(() => {
    if (!referralCode) return;
    const url = `sms:?body=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url).catch(() =>
      showToast('error', 'Unable to open Messages'),
    );
  }, [referralCode, shareMessage]);

  const handleShareLink = useCallback(async () => {
    if (!referralCode) return;
    try {
      await Share.share({message: shareMessage});
    } catch {
      // dismissed
    }
  }, [referralCode, shareMessage]);

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => navigation.goBack()}>
            <Icons.ChevronLeftIcon size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite a Friend</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── PAGE TITLE ── */}
        <Text style={styles.pageTitle}>Invite from the heart</Text>
        <Text style={styles.pageSubtitle}>
          Share HAH with your friends and help build{'\n'}a stronger community
          of faith together.
        </Text>

        {/* ── INVITE LINK CARD ── */}
        <View style={styles.linkCard}>
          <Text style={styles.linkCardLabel}>Your Invite Code</Text>
          <View style={styles.linkRow}>
            <OutlineIcons.LinkIcon
              size={18}
              color="#9A9EAE"
              style={styles.linkIcon}
            />
            {isLoading ? (
              <ActivityIndicator
                color="#0077B6"
                size="small"
                style={{flex: 1}}
              />
            ) : isError ? (
              <Text style={[styles.linkText, {color: '#F04438'}]}>
                Failed to load
              </Text>
            ) : (
              <Text style={styles.linkText} numberOfLines={1}>
                {displayLink}
              </Text>
            )}
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopy}
              disabled={!referralCode}>
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── OR SHARE VIA ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SHARE VIA</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── SHARE BUTTONS ── */}
        <View style={styles.shareRow}>
          <ShareButton
            label="WhatsApp"
            icon={<Icons.ChatBubbleLeftRightIcon size={26} color="#0077B6" />}
            onPress={handleWhatsApp}
          />
          <ShareButton
            label="Messages"
            icon={
              <Icons.ChatBubbleOvalLeftEllipsisIcon size={26} color="#0077B6" />
            }
            onPress={handleMessages}
          />
          <ShareButton
            label="Share Link"
            icon={
              <OutlineIcons.ArrowUpOnSquareIcon size={26} color="#0077B6" />
            }
            onPress={handleShareLink}
          />
          <ShareButton
            label="More"
            icon={<Icons.EllipsisHorizontalIcon size={26} color="#0077B6" />}
            onPress={handleShareLink}
          />
        </View>

        {/* ── WHY INVITE ── */}
        <View style={styles.whyCard}>
          <View style={styles.whyHeader}>
            <View style={styles.whyIconCircle}>
              <OutlineIcons.ShieldCheckIcon size={22} color="#0077B6" />
            </View>
            <Text style={styles.whyTitle}>Why invite?</Text>
          </View>
          <WhyItem
            title="Encourage and uplift"
            desc="Your invite might be the encouragement someone needs today."
          />
          <WhyItem
            title="Grow together in faith"
            desc="Help your friends discover teachings, podcasts, live church and more."
          />
          <WhyItem
            title="Build a stronger community"
            desc="Together, we can create a space where faith and hope thrive."
          />
        </View>

        {/* ── THANK YOU CARD ── */}
        <View style={styles.thankCard}>
          <OutlineIcons.HeartIcon size={22} color="#0077B6" />
          <View style={styles.thankTextWrap}>
            <Text style={styles.thankTitle}>
              Thank you for being a part of this journey.
            </Text>
            <Text style={styles.thankSubtitle}>
              Your simple invite can make a big difference.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ── Sub-components ── */

const ShareButton = ({label, icon, onPress}) => (
  <TouchableOpacity style={styles.shareBtn} onPress={onPress}>
    <View style={styles.shareBtnCircle}>{icon}</View>
    <Text style={styles.shareBtnLabel}>{label}</Text>
  </TouchableOpacity>
);

const WhyItem = ({title, desc}) => (
  <View style={styles.whyItem}>
    <View style={styles.whyCheckCircle}>
      <OutlineIcons.CheckCircleIcon size={22} color="#0077B6" />
    </View>
    <View style={styles.whyItemText}>
      <Text style={styles.whyItemTitle}>{title}</Text>
      <Text style={styles.whyItemDesc}>{desc}</Text>
    </View>
  </View>
);

export default ReferralScreen;

/* ── Styles ── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    backgroundColor: '#0077B6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBack: {
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },

  /* Scroll */
  scroll: {flex: 1},
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 48,
  },

  /* Page title */
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#040641',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 22,
    marginBottom: 28,
  },

  /* Invite link card */
  linkCard: {
    borderWidth: 1,
    borderColor: '#D0E8F5',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#F5FAFF',
    marginBottom: 28,
  },
  linkCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0077B6',
    marginBottom: 10,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  linkIcon: {
    flexShrink: 0,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#475467',
  },
  copyBtn: {
    backgroundColor: '#0077B6',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  copyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E7EC',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9EAE',
    letterSpacing: 0.8,
  },

  /* Share buttons */
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  shareBtn: {
    alignItems: 'center',
    gap: 8,
  },
  shareBtnCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnLabel: {
    fontSize: 12,
    color: '#040641',
    fontWeight: '500',
  },

  /* Why invite card */
  whyCard: {
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  whyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#040641',
  },
  whyItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  whyCheckCircle: {
    marginTop: 1,
    flexShrink: 0,
  },
  whyItemText: {
    flex: 1,
  },
  whyItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#040641',
    marginBottom: 3,
  },
  whyItemDesc: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 20,
  },

  /* Thank you card */
  thankCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fff',
  },
  thankTextWrap: {
    flex: 1,
  },
  thankTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0077B6',
    marginBottom: 4,
    lineHeight: 20,
  },
  thankSubtitle: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 20,
  },
});
