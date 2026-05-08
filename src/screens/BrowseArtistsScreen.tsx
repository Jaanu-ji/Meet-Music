import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, SafeAreaView, Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, MapPin, Star, Music2, X } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { resolveProfileImage, withImageCacheBust, initialsFromName } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BrowseArtists'>;

type ArtistProfile = {
  _id: string;
  stageName?: string;
  bio?: string;
  location?: string;
  services?: string[];
  genres?: string[];
  photoUrl?: string;
  user?: { name?: string; profileImageUrl?: string };
  averageRating: number;
  ratingCount: number;
};

const RATING_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '3★+', value: 3 },
  { label: '4★+', value: 4 },
  { label: '5★', value: 5 },
];

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          color={s <= Math.round(rating) ? '#f59e0b' : '#333'}
          fill={s <= Math.round(rating) ? '#f59e0b' : 'transparent'}
        />
      ))}
      <Text style={starStyles.label}>
        {count > 0 ? `${rating.toFixed(1)} (${count})` : 'No ratings'}
      </Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  label: { color: '#888', fontSize: 12, marginLeft: 4 },
});

export function BrowseArtistsScreen() {
  const navigation = useNavigation<Nav>();
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await artistsApi.list({ artistType: 'music', artistCategory: 'individual' });
        const data = response?.data ?? (Array.isArray(response) ? response : []);
        setArtists(data);
      } catch (err: any) {
        setError(err?.message || 'Unable to load artists.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const matchesCity = !cityFilter || (a.location || '').toLowerCase().includes(cityFilter.toLowerCase());
      const matchesInstrument = !instrumentFilter || (a.services || []).some(s => s.toLowerCase().includes(instrumentFilter.toLowerCase()));
      const matchesRating = ratingFilter === 0 || a.averageRating >= ratingFilter;
      return matchesCity && matchesInstrument && matchesRating;
    });
  }, [artists, cityFilter, instrumentFilter, ratingFilter]);

  const hasFilters = cityFilter || instrumentFilter || ratingFilter > 0;

  const renderArtist = ({ item, index }: { item: ArtistProfile; index: number }) => {
    const name = item.stageName || item.user?.name || 'Artist';
    const services = item.services || [];
    const imgUrl = resolveProfileImage(item);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ArtistProfile', { id: item._id })}
          activeOpacity={0.8}
        >
          <View style={styles.cardInner}>
            <View style={styles.avatar}>
              {imgUrl ? (
                <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{initialsFromName(name)}</Text>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.artistName}>{name}</Text>
              <View style={styles.tags}>
                {services.slice(0, 3).map((s) => (
                  <View key={s} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
                {services.length > 3 && (
                  <View style={styles.tagMore}>
                    <Text style={styles.tagMoreText}>+{services.length - 3}</Text>
                  </View>
                )}
              </View>
              <View style={styles.location}>
                <MapPin color="#888" size={13} />
                <Text style={styles.locationText}>{item.location || 'Unknown'}</Text>
              </View>
              <StarDisplay rating={item.averageRating} count={item.ratingCount} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Browse Artists</Text>
          <Text style={styles.headerSub}>{filtered.length} artists available</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <TextInput
          style={styles.filterInput}
          value={cityFilter}
          onChangeText={setCityFilter}
          placeholder="Filter by city..."
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.filterInput}
          value={instrumentFilter}
          onChangeText={setInstrumentFilter}
          placeholder="Filter by instrument..."
          placeholderTextColor="#888"
        />
        <View style={styles.ratingRow}>
          {RATING_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setRatingFilter(opt.value)}
              style={[styles.ratingBtn, ratingFilter === opt.value && styles.ratingBtnActive]}
            >
              <Text style={[styles.ratingBtnText, ratingFilter === opt.value && styles.ratingBtnTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {hasFilters && (
          <TouchableOpacity
            onPress={() => { setCityFilter(''); setInstrumentFilter(''); setRatingFilter(0); }}
            style={styles.clearBtn}
          >
            <X color="#7c3aed" size={14} />
            <Text style={styles.clearBtnText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && filtered.length === 0 && (
        <View style={styles.center}>
          <Music2 color="#888" size={48} />
          <Text style={styles.emptyTitle}>No artists found</Text>
          <Text style={styles.emptySubtitle}>Try changing your filters</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderArtist}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  filters: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  filterInput: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 16, paddingHorizontal: 16, height: 48, color: '#fff', fontSize: 14,
  },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1, height: 40, borderRadius: 10, borderWidth: 1,
    borderColor: '#2a2a2a', backgroundColor: '#1a1a1a',
    alignItems: 'center', justifyContent: 'center',
  },
  ratingBtnActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.15)' },
  ratingBtnText: { color: '#888', fontSize: 13 },
  ratingBtnTextActive: { color: '#7c3aed', fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearBtnText: { color: '#7c3aed', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptySubtitle: { fontSize: 14, color: '#888' },
  errorBox: { margin: 24, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14 },
  list: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 20, padding: 16,
  },
  cardInner: { flexDirection: 'row', gap: 14 },
  avatar: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: 72, height: 72 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 22 },
  cardInfo: { flex: 1, gap: 6 },
  artistName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { color: '#7c3aed', fontSize: 12, fontWeight: '500' },
  tagMore: { backgroundColor: '#2a2a2a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagMoreText: { color: '#888', fontSize: 12 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#888', fontSize: 13 },
});
