import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Search, MapPin, X } from 'lucide-react-native';
import { artistsApi } from '../lib/api';
import { initialsFromName, resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GlobalSearch'>;

type Artist = {
  _id: string; stageName?: string; bio?: string; location?: string;
  services?: string[]; genres?: string[];
  user?: { name?: string; profileImageUrl?: string };
  profileImageUrl?: string;
};

export function GlobalSearchScreen() {
  const navigation = useNavigation<Nav>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    artistsApi.list().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setArtists(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return artists.filter(a => {
      const name = (a.stageName || a.user?.name || '').toLowerCase();
      return (
        name.includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.services || []).some(s => s.toLowerCase().includes(q)) ||
        (a.genres || []).some(g => g.toLowerCase().includes(q))
      );
    });
  }, [artists, query]);

  const searching = query.length > 0;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Search color="#888" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search artists, instruments, cities..."
            placeholderTextColor="#555"
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X color="#888" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? (
          <ActivityIndicator color="#7c3aed" size="large" style={{ marginTop: 40 }} />
        ) : !searching ? (
          <View style={styles.idleBox}>
            <View style={styles.idleIconBox}>
              <Search color="#7c3aed" size={36} />
            </View>
            <Text style={styles.idleTitle}>Search Music Artists</Text>
            <Text style={styles.idleText}>Find teachers, performers, and musicians{'\n'}by name, instrument, city, or genre</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.idleBox}>
            <View style={[styles.idleIconBox, { backgroundColor: '#1a1a1a' }]}>
              <Search color="#555" size={36} />
            </View>
            <Text style={styles.idleTitle}>No results found</Text>
            <Text style={styles.idleText}>Try searching with different keywords{'\n'}like artist names, instruments, or cities</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Search Results</Text>
              <Text style={styles.resultsCount}>{results.length} found</Text>
            </View>
            {results.map(artist => {
              const imgUrl = resolveProfileImage(artist);
              const name = artist.stageName || artist.user?.name || 'Artist';
              return (
                <TouchableOpacity
                  key={artist._id}
                  style={styles.card}
                  onPress={() => navigation.navigate('ArtistProfile', { id: artist._id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatar}>
                    {imgUrl ? (
                      <Image source={{ uri: withImageCacheBust(imgUrl) }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{initialsFromName(name)}</Text>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.artistName}>{name}</Text>
                    <View style={styles.tagRow}>
                      {(artist.services || []).slice(0, 3).map(s => (
                        <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                      ))}
                      {(artist.services || []).length > 3 && (
                        <View style={styles.tagMore}><Text style={styles.tagMoreText}>+{(artist.services || []).length - 3}</Text></View>
                      )}
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin color="#888" size={12} />
                      <Text style={styles.locationText}>{artist.location || 'Unknown'}</Text>
                    </View>
                    {artist.bio ? (
                      <Text style={styles.bio} numberOfLines={2}>{artist.bio}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 14, paddingHorizontal: 12, height: 46 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  clearBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  idleBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
  idleIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  idleTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  idleText: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  resultsCount: { fontSize: 13, color: '#888' },
  card: { flexDirection: 'row', gap: 14, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 14, marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: 56, height: 56 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cardInfo: { flex: 1 },
  artistName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  tag: { backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: '#7c3aed', fontSize: 11, fontWeight: '600' },
  tagMore: { backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagMoreText: { color: '#888', fontSize: 11 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { color: '#888', fontSize: 12 },
  bio: { color: '#666', fontSize: 12, lineHeight: 17 },
});
