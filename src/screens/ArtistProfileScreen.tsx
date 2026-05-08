import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, TextInput, ActivityIndicator, SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, MapPin, Star, Calendar } from 'lucide-react-native';
import { artistsApi, getAuthToken } from '../lib/api';
import { resolveProfileImage, withImageCacheBust, initialsFromName } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ArtistProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ArtistProfile'>;

type RatingEntry = {
  user?: { name?: string };
  value: number;
  review?: string;
  createdAt?: string;
};

type Artist = {
  _id: string;
  stageName?: string;
  bio?: string;
  location?: string;
  services?: string[];
  genres?: string[];
  category?: { name: string };
  photoUrl?: string;
  user?: { name?: string; profileImageUrl?: string };
  portfolio?: Array<{ url: string; type: 'image' | 'video' }>;
  averageRating: number;
  ratingCount: number;
  ratings?: RatingEntry[];
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={ss.row}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange(s)} activeOpacity={0.7}>
          <Star
            size={28}
            color={s <= value ? '#f59e0b' : '#444'}
            fill={s <= value ? '#f59e0b' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
const ss = StyleSheet.create({ row: { flexDirection: 'row', gap: 8, marginVertical: 8 } });

export function ArtistProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { id } = route.params;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await artistsApi.get(id);
      setArtist(response?.data ?? response ?? null);
    } catch (err: any) {
      setError(err?.message || 'Unable to load artist details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadArtist(); }, [loadArtist]);

  const handleRate = async () => {
    const token = await getAuthToken();
    if (!token) { navigation.navigate('Login'); return; }
    if (!selectedRating) return;
    setRatingLoading(true);
    setRatingMessage('');
    try {
      await artistsApi.rate(id, selectedRating, reviewText.trim() || undefined);
      setRatingMessage(reviewText.trim() ? 'Rating & review submitted!' : 'Rating submitted!');
      setSelectedRating(0);
      setReviewText('');
      await loadArtist();
    } catch (err: any) {
      setRatingMessage(err?.message || 'Failed to submit.');
    } finally {
      setRatingLoading(false);
    }
  };

  const name = artist?.stageName || artist?.user?.name || 'Artist';
  const services = artist?.services || [];
  const imgUrl = artist ? resolveProfileImage(artist) : '';
  const portfolioItems = artist?.portfolio || [];
  const ratings = artist?.ratings || [];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bannerHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {loading ? (
            <ActivityIndicator color="#7c3aed" size="large" style={{ padding: 32 }} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <Animated.View entering={FadeInDown.duration(500)}>
              <View style={styles.topInfo}>
                <View style={styles.avatar}>
                  {imgUrl ? (
                    <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{initialsFromName(name)}</Text>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.artistName}>{name}</Text>
                  <Text style={styles.artistCat}>{artist?.category?.name || 'Music Professional'}</Text>
                  <View style={styles.locationRow}>
                    <MapPin color="#888" size={14} />
                    <Text style={styles.locationText}>{artist?.location || 'Unknown'}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={13} color={s <= Math.round(artist?.averageRating || 0) ? '#f59e0b' : '#333'} fill={s <= Math.round(artist?.averageRating || 0) ? '#f59e0b' : 'transparent'} />
                    ))}
                    <Text style={styles.ratingLabel}>
                      {(artist?.ratingCount || 0) > 0 ? `${artist!.averageRating.toFixed(1)} (${artist!.ratingCount})` : 'No ratings'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{services.length}</Text>
                  <Text style={styles.statLabel}>Services</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: '#0ea5e9' }]}>{artist?.genres?.length || 0}</Text>
                  <Text style={styles.statLabel}>Genres</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{artist?.bio || 'No biography added yet.'}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <View style={styles.tags}>
                  {services.length > 0 ? services.map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  )) : (
                    <Text style={styles.bioText}>No services listed</Text>
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Rate & Review */}
        <View style={styles.rateCard}>
          <Text style={styles.sectionTitle}>Rate & Review</Text>
          <Text style={styles.rateSubtitle}>Stars required · review is optional</Text>
          <StarSelector value={selectedRating} onChange={setSelectedRating} />
          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Write a review (optional)..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitBtn, (selectedRating === 0 || ratingLoading) && styles.submitBtnDisabled]}
            onPress={handleRate}
            disabled={selectedRating === 0 || ratingLoading}
            activeOpacity={0.85}
          >
            {ratingLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>
                  {selectedRating > 0
                    ? (reviewText.trim() ? `Submit ${selectedRating}★ Rating & Review` : `Submit ${selectedRating}★ Rating`)
                    : 'Select stars to submit'}
                </Text>
            }
          </TouchableOpacity>
          {ratingMessage ? (
            <Text style={[styles.ratingMsg, ratingMessage.includes('submitted') ? styles.ratingMsgSuccess : styles.ratingMsgError]}>
              {ratingMessage}
            </Text>
          ) : null}
        </View>

        {/* Portfolio */}
        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle2}>Portfolio</Text>
          {portfolioItems.length > 0 ? (
            <View style={styles.portfolioGrid}>
              {portfolioItems.map((item, idx) => (
                <View key={`${item.url}-${idx}`} style={styles.portfolioItem}>
                  <Image source={{ uri: item.url }} style={styles.portfolioImg} resizeMode="cover" />
                  <View style={styles.portfolioBadge}>
                    <Text style={styles.portfolioBadgeText}>{item.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No portfolio items yet.</Text>
            </View>
          )}
        </View>

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle2}>Reviews ({ratings.length})</Text>
          {ratings.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {[...ratings].reverse().map((entry, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewerName}>{entry.user?.name || 'Anonymous'}</Text>
                      <View style={styles.reviewStars}>
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={14} color={s <= entry.value ? '#f59e0b' : '#333'} fill={s <= entry.value ? '#f59e0b' : 'transparent'} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{formatDate(entry.createdAt)}</Text>
                  </View>
                  {entry.review ? <Text style={styles.reviewText}>{entry.review}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85} onPress={() => navigation.navigate('BookArtist', { artistId: id })}>
          <Calendar color="#fff" size={20} />
          <Text style={styles.bookBtnText}>Book Artist</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  bannerHeader: {
    height: 180, backgroundColor: '#7c3aed',
    justifyContent: 'flex-end', paddingBottom: 16, paddingHorizontal: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  profileCard: {
    marginHorizontal: 24, marginTop: -48,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 24, padding: 20,
  },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14 },
  topInfo: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatar: {
    width: 88, height: 88, borderRadius: 20,
    backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: 88, height: 88 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 26 },
  info: { flex: 1, gap: 4 },
  artistName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  artistCat: { fontSize: 13, color: '#888' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#888', fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingLabel: { color: '#888', fontSize: 12, marginLeft: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: '#111', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  statNum: { fontSize: 24, fontWeight: '700', color: '#7c3aed', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#888' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#888', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#2a2a2a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  tagText: { color: '#ccc', fontSize: 13 },
  rateCard: {
    marginHorizontal: 24, marginTop: 16,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 24, padding: 20,
  },
  rateSubtitle: { fontSize: 13, color: '#888', marginBottom: 4 },
  reviewInput: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 16, padding: 14, color: '#fff', fontSize: 14,
    minHeight: 80, marginTop: 12,
  },
  submitBtn: {
    backgroundColor: '#7c3aed', borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ratingMsg: { marginTop: 8, fontSize: 13 },
  ratingMsgSuccess: { color: '#7c3aed' },
  ratingMsgError: { color: '#ef4444' },
  portfolioSection: { marginHorizontal: 24, marginTop: 24 },
  sectionTitle2: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 14 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portfolioItem: { width: '48%', aspectRatio: 16/9, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  portfolioImg: { width: '100%', height: '100%' },
  portfolioBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  portfolioBadgeText: { color: '#fff', fontSize: 10, textTransform: 'uppercase' },
  emptyBox: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  reviewsSection: { marginHorizontal: 24, marginTop: 24 },
  reviewList: { gap: 10 },
  reviewCard: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 16, padding: 16,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  reviewerName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  reviewStars: { flexDirection: 'row', gap: 3 },
  reviewDate: { fontSize: 12, color: '#888' },
  reviewText: { fontSize: 13, color: '#888', lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopWidth: 1, borderTopColor: '#1a1a1a',
  },
  bookBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
