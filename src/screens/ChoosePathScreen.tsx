import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Image,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GraduationCap, Mic2, UserSearch, Bell, Search, ChevronRight } from 'lucide-react-native';
import { authApi } from '../lib/api';
import { initialsFromName, resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ChoosePath'>;

const PATHS = [
  {
    icon: GraduationCap,
    title: 'Learn Music & Dance',
    description: 'Music, Dance, lessons, and guided learning',
    color: '#7c3aed',
    screen: 'LearnCategory' as keyof RootStackParamList,
    delay: 100,
  },
  {
    icon: Mic2,
    title: 'Join as Artist',
    description: 'Create your profile and showcase your talent',
    color: '#0ea5e9',
    screen: 'JoinCategory' as keyof RootStackParamList,
    delay: 200,
  },
  {
    icon: UserSearch,
    title: 'Hire Artist',
    description: 'Find musicians for events and gigs',
    color: '#f59e0b',
    screen: 'HireCategory' as keyof RootStackParamList,
    delay: 300,
  },
];

export function ChoosePathScreen() {
  const navigation = useNavigation<Nav>();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarName, setAvatarName] = useState('');

  useEffect(() => {
    authApi.getProfile().then((res) => {
      const profile = res?.data ?? res;
      setAvatarName(profile?.name || '');
      const resolved = resolveProfileImage(profile);
      if (resolved) setAvatarUrl(resolved);
    }).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Animated.View entering={FadeInLeft.duration(500)}>
          <Text style={styles.brand}>Meet Music</Text>
          <Text style={styles.brandSub}>Welcome back</Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.duration(500)} style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('GlobalSearch' as any)}>
            <Search color="#888" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications' as any)}>
            <Bell color="#888" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile' as any)}>
            {avatarUrl ? (
              <Image
                source={{ uri: withImageCacheBust(avatarUrl) }}
                style={styles.avatarImg}
              />
            ) : (
              <Text style={styles.avatarText}>{initialsFromName(avatarName)}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.body}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heading}>
          <Text style={styles.headingTitle}>What would you like{'\n'}to do today?</Text>
          <Text style={styles.headingSubtitle}>Choose your path and start your journey</Text>
        </Animated.View>

        <View style={styles.pathList}>
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Animated.View
                key={path.title}
                entering={FadeInDown.delay(path.delay).duration(500)}
              >
                <TouchableOpacity
                  style={styles.pathCard}
                  onPress={() => navigation.navigate(path.screen as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pathIcon, { backgroundColor: path.color }]}>
                    <Icon color="#fff" size={28} />
                  </View>
                  <View style={styles.pathText}>
                    <Text style={styles.pathTitle}>{path.title}</Text>
                    <Text style={styles.pathDesc}>{path.description}</Text>
                  </View>
                  <View style={styles.pathArrow}>
                    <ChevronRight color="#888" size={20} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  brand: { fontSize: 22, fontWeight: '700', color: '#fff' },
  brandSub: { fontSize: 13, color: '#888', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 40, height: 40 },
  avatarText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  heading: { marginBottom: 32 },
  headingTitle: { fontSize: 32, fontWeight: '700', color: '#fff', lineHeight: 42, marginBottom: 10 },
  headingSubtitle: { fontSize: 16, color: '#888' },
  pathList: { gap: 16 },
  pathCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 24, padding: 20, gap: 16,
  },
  pathIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pathText: { flex: 1 },
  pathTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  pathDesc: { fontSize: 13, color: '#888', lineHeight: 18 },
  pathArrow: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center',
  },
});
