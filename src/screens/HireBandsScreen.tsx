import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Search, MapPin, Users, Music } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HireBands'>;

type Artist = {
  _id: string; stageName?: string; bio?: string; location?: string;
  services?: string[]; availability?: string; bandName?: string;
  user?: { name?: string; profileImageUrl?: string };
  profileImageUrl?: string;
};

const GENRES = ['Rock', 'Pop', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'Electronic', 'Sufi'];

export function HireBandsScreen() {
  const navigation = useNavigation<Nav>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    artistsApi.list({ artistType: 'band' }).then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setArtists(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load')).finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter(a => {
    const name = (a.bandName || a.stageName || a.user?.name || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || !search;
    const matchGenre = !selectedGenre || (a.services ?? []).some(s => s.toLowerCase() === selectedGenre.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Animated.View entering={FadeInLeft.duration(400)} style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Hire a Band</Text>
            <Text style={styles.headerSub}>Find the perfect band for your event</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.searchBox}>
          <Search color="#888" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bands..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll} contentContainerStyle={styles.genreContent}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreChip, selectedGenre === genre && styles.genreChipActive]}
                onPress={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                activeOpacity={0.8}
              >
                <Text style={[styles.genreText, selectedGenre === genre && styles.genreTextActive]}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>
              Available Bands {filtered.length > 0 ? `(${filtered.length})` : ''}
            </Text>
            {filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🎸</Text>
                <Text style={styles.emptyTitle}>No bands found</Text>
                <Text style={styles.emptyText}>
                  {search || selectedGenre ? 'Try adjusting your search or filter' : 'No bands available yet. Check back soon!'}
                </Text>
              </View>
            ) : filtered.map((band) => {
              const imgUrl = resolveProfileImage(band);
              const name = band.bandName || band.stageName || band.user?.name || 'Band';
              return (
                <TouchableOpacity
                  key={band._id}
                  style={styles.bandCard}
                  onPress={() => navigation.navigate('BandProfile', { id: band._id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.bandAvatar}>
                    {imgUrl ? (
                      <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.bandAvatarImg} />
                    ) : (
                      <Music color="#fff" size={28} />
                    )}
                  </View>
                  <View style={styles.bandInfo}>
                    <Text style={styles.bandName}>{name}</Text>
                    <View style={styles.tagRow}>
                      {band.services?.slice(0, 3).map(s => (
                        <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                      ))}
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin color="#888" size={12} />
                      <Text style={styles.locationText}>{band.location || 'Unknown'}</Text>
                    </View>
                    {band.bio ? (
                      <Text style={styles.bio} numberOfLines={2}>{band.bio}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.statusBadge, band.availability === 'busy' && styles.statusBusy]}>
                    <Text style={[styles.statusText, band.availability === 'busy' && styles.statusTextBusy]}>
                      {band.availability === 'busy' ? 'Busy' : 'Available'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, paddingHorizontal: 14, height: 50, marginBottom: 24 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 14, marginTop: 4 },
  genreScroll: { marginBottom: 24 },
  genreContent: { gap: 8, paddingBottom: 4 },
  genreChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a' },
  genreChipActive: { backgroundColor: 'rgba(14,165,233,0.2)', borderColor: '#0ea5e9' },
  genreText: { color: '#888', fontSize: 13, fontWeight: '600' },
  genreTextActive: { color: '#0ea5e9' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14, marginTop: 20 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 40, alignItems: 'center', marginBottom: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bandCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 16, marginBottom: 12, gap: 14 },
  bandAvatar: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  bandAvatarImg: { width: 60, height: 60 },
  bandInfo: { flex: 1 },
  bandName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tag: { backgroundColor: 'rgba(14,165,233,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: '#0ea5e9', fontSize: 11, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { color: '#888', fontSize: 12 },
  bio: { color: '#666', fontSize: 12, lineHeight: 17, marginTop: 2 },
  statusBadge: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusBusy: { backgroundColor: 'rgba(239,68,68,0.15)' },
  statusText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  statusTextBusy: { color: '#ef4444' },
});
