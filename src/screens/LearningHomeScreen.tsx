import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Search, Guitar, Music, Mic2, Play, MapPin } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { initialsFromName, resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LearningHome'>;

type Artist = {
  _id: string; stageName?: string; bio?: string; location?: string;
  services?: string[]; availability?: string;
  user?: { name?: string; profileImageUrl?: string };
  profileImageUrl?: string;
};

const POPULAR = ['Guitar', 'Piano', 'Singing', 'Drums', 'Violin', 'Tabla'];
const ALL_INSTRUMENTS = [
  'Guitar', 'Piano', 'Violin', 'Drums', 'Singing', 'Tabla',
  'Flute', 'DJ', 'Music Production', 'Rap', 'Harmonium', 'Bass Guitar',
  'Ukulele', 'Saxophone', 'Keyboard', 'Beatboxing',
];

const iconForInstrument = (i: string) => {
  if (['Guitar', 'Bass Guitar', 'Ukulele'].includes(i)) return Guitar;
  if (['Piano', 'Keyboard', 'Harmonium'].includes(i)) return Music;
  return Mic2;
};

export function LearningHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    artistsApi.list({ artistType: 'music' }).then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setArtists(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load')).finally(() => setLoading(false));
  }, []);

  const teachersFor = (instrument: string) =>
    artists.filter(a => (a.services ?? []).some(s => s.toLowerCase() === instrument.toLowerCase()));

  const featured = artists.filter(a => (a.services?.length ?? 0) > 0).slice(0, 4);

  const filteredInstruments = ALL_INSTRUMENTS.filter(i =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Animated.View entering={FadeInLeft.duration(400)} style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Learn Music</Text>
            <Text style={styles.headerSub}>Discover teachers and courses</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.searchBox}>
          <Search color="#888" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search instruments..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#7c3aed" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Text style={styles.sectionTitle}>Popular Instruments</Text>
              <View style={styles.grid2}>
                {POPULAR.map((instrument, idx) => {
                  const Icon = iconForInstrument(instrument);
                  const count = teachersFor(instrument).length;
                  return (
                    <TouchableOpacity key={instrument} style={styles.instrCard} activeOpacity={0.8} onPress={() => navigation.navigate('CoursesList', { instrument, isDance: false })}>
                      <View style={styles.instrIconBox}>
                        <Icon color="#fff" size={22} />
                      </View>
                      <Text style={styles.instrName}>{instrument}</Text>
                      <Text style={styles.instrCount}>{count} teachers</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text style={styles.sectionTitle}>Featured Teachers</Text>
              {featured.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🎵</Text>
                  <Text style={styles.emptyText}>No teachers found yet</Text>
                </View>
              ) : featured.map((teacher) => {
                const imgUrl = resolveProfileImage(teacher);
                const name = teacher.stageName || teacher.user?.name || 'Artist';
                return (
                  <TouchableOpacity
                    key={teacher._id}
                    style={styles.teacherCard}
                    onPress={() => navigation.navigate('ArtistProfile', { id: teacher._id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.teacherAvatar}>
                      {imgUrl ? (
                        <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.teacherAvatarImg} />
                      ) : (
                        <Text style={styles.teacherAvatarText}>{initialsFromName(name)}</Text>
                      )}
                    </View>
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>{name}</Text>
                      <View style={styles.tagRow}>
                        {teacher.services?.slice(0, 2).map(s => (
                          <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                        ))}
                      </View>
                      <View style={styles.locationRow}>
                        <MapPin color="#888" size={12} />
                        <Text style={styles.locationText}>{teacher.location || 'Unknown'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, teacher.availability === 'busy' && styles.statusBusy]}>
                      <Text style={[styles.statusText, teacher.availability === 'busy' && styles.statusTextBusy]}>
                        {teacher.availability === 'busy' ? 'Busy' : 'Available'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text style={styles.sectionTitle}>All Instruments</Text>
              <View style={styles.grid3}>
                {filteredInstruments.map((instrument) => {
                  const Icon = iconForInstrument(instrument);
                  const count = teachersFor(instrument).length;
                  return (
                    <TouchableOpacity key={instrument} style={styles.smallCard} activeOpacity={0.8} onPress={() => navigation.navigate('CoursesList', { instrument, isDance: false })}>
                      <View style={styles.smallIconBox}>
                        <Icon color="#7c3aed" size={18} />
                      </View>
                      <Text style={styles.smallName} numberOfLines={1}>{instrument}</Text>
                      <Text style={styles.smallCount}>{count}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </>
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
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  instrCard: { width: '47%', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 16 },
  instrIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  instrName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  instrCount: { fontSize: 12, color: '#888' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14, marginTop: 20 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#888', fontSize: 14 },
  teacherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 14, marginBottom: 12, gap: 14 },
  teacherAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  teacherAvatarImg: { width: 56, height: 56 },
  teacherAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  tag: { backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: '#7c3aed', fontSize: 11, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#888', fontSize: 12 },
  statusBadge: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusBusy: { backgroundColor: 'rgba(239,68,68,0.15)' },
  statusText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  statusTextBusy: { color: '#ef4444' },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  smallCard: { width: '30%', aspectRatio: 1, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 10 },
  smallIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  smallName: { fontSize: 11, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 2 },
  smallCount: { fontSize: 10, color: '#888' },
});
