import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { initialsFromName, resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CoursesList'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'CoursesList'>;

type Artist = {
  _id: string; stageName?: string; bio?: string; location?: string;
  services?: string[]; availability?: string;
  user?: { name?: string; profileImageUrl?: string };
  profileImageUrl?: string;
};

const CLASS_TYPES = ['All', 'Online', 'Offline'];

export function CoursesListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { instrument, isDance } = route.params;

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classType, setClassType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const artistType = isDance ? 'dance' : 'music';
    artistsApi.list({ artistType }).then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setArtists(data);
    }).catch((e: any) => setError(e?.message || 'Unable to load'))
      .finally(() => setLoading(false));
  }, [instrument, isDance]);

  const filtered = useMemo(() => {
    return artists.filter(a => {
      const matchInstrument = (a.services ?? []).some(s => s.toLowerCase() === instrument.toLowerCase());
      if (!matchInstrument) return false;
      if (classType === 'Online') return (a.services ?? []).some(s => s.toLowerCase().includes('online'));
      if (classType === 'Offline') return !(a.services ?? []).some(s => s.toLowerCase().includes('online'));
      return true;
    }).filter(a => !selectedCity || (a.location || '').toLowerCase().includes(selectedCity.toLowerCase()));
  }, [artists, instrument, classType, selectedCity]);

  const cities = useMemo(() => {
    const cs = new Set(
      artists
        .filter(a => (a.services ?? []).some(s => s.toLowerCase() === instrument.toLowerCase()))
        .map(a => a.location)
        .filter(Boolean)
    );
    return Array.from(cs) as string[];
  }, [artists, instrument]);

  const accentColor = isDance ? '#ec4899' : '#7c3aed';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{instrument} Teachers</Text>
          <Text style={styles.headerSub}>{filtered.length} teacher{filtered.length !== 1 ? 's' : ''} available</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(50).duration(350)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {CLASS_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, classType === type && { backgroundColor: `${accentColor}25`, borderColor: accentColor }]}
                onPress={() => setClassType(type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, classType === type && { color: accentColor }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {cities.length > 1 && (
          <Animated.View entering={FadeInDown.delay(100).duration(350)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              <TouchableOpacity
                style={[styles.chip, !selectedCity && { backgroundColor: `${accentColor}25`, borderColor: accentColor }]}
                onPress={() => setSelectedCity('')}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, !selectedCity && { color: accentColor }]}>All Cities</Text>
              </TouchableOpacity>
              {cities.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.chip, selectedCity === city && { backgroundColor: `${accentColor}25`, borderColor: accentColor }]}
                  onPress={() => setSelectedCity(selectedCity === city ? '' : city)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedCity === city && { color: accentColor }]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {loading ? (
          <ActivityIndicator color={accentColor} size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        ) : filtered.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>{isDance ? '💃' : '🎵'}</Text>
            <Text style={styles.emptyTitle}>No teachers found</Text>
            <Text style={styles.emptyText}>No {instrument} teachers available yet{'\n'}Check back soon!</Text>
          </Animated.View>
        ) : (
          filtered.map((teacher, i) => {
            const imgUrl = resolveProfileImage(teacher);
            const name = teacher.stageName || teacher.user?.name || 'Teacher';
            return (
              <Animated.View key={teacher._id} entering={FadeInDown.delay(i * 60).duration(350)}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => navigation.navigate('ArtistProfile', { id: teacher._id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                    {imgUrl ? (
                      <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{initialsFromName(name)}</Text>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.tagRow}>
                      {(teacher.services ?? []).slice(0, 3).map(s => (
                        <View key={s} style={[styles.tag, { backgroundColor: `${accentColor}18` }]}>
                          <Text style={[styles.tagText, { color: accentColor }]}>{s}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin color="#888" size={12} />
                      <Text style={styles.locationText}>{teacher.location || 'Unknown'}</Text>
                    </View>
                    {teacher.bio ? <Text style={styles.bio} numberOfLines={2}>{teacher.bio}</Text> : null}
                  </View>
                  <View style={[styles.statusBadge, teacher.availability === 'busy' && styles.statusBusy]}>
                    <Text style={[styles.statusText, teacher.availability === 'busy' && styles.statusTextBusy]}>
                      {teacher.availability === 'busy' ? 'Busy' : 'Available'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  filterScroll: { marginBottom: 12 },
  filterContent: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a' },
  chipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 16, padding: 14 },
  errorText: { color: '#ef4444', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 14, marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: 56, height: 56 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  tag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { color: '#888', fontSize: 12 },
  bio: { color: '#666', fontSize: 12, lineHeight: 17 },
  statusBadge: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusBusy: { backgroundColor: 'rgba(239,68,68,0.15)' },
  statusText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  statusTextBusy: { color: '#ef4444' },
});
