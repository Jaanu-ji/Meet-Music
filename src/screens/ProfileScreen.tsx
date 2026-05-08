import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Image, ActivityIndicator, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Mail, Bell, Calendar, Shield, BookOpen, ChevronRight, LogOut, Camera } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  authApi, bookingsApi, enrollmentApi, uploadApi, clearAuthToken,
} from '../lib/api';
import { initialsFromName, resolveProfileImage, withImageCacheBust } from '../lib/profileImage';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type UserProfile = {
  id?: string; name?: string; email?: string; role?: string;
  isArtist?: boolean; profileImageUrl?: string;
};

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getProfile().then((res) => {
      const data = res?.data ?? res ?? null;
      setUser(data);
      const resolved = resolveProfileImage(data);
      if (resolved) setAvatarUrl(resolved);
    }).catch(() => {}).finally(() => setLoading(false));

    bookingsApi.myBookings().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setBookingCount(data.length);
    }).catch(() => {});

    enrollmentApi.myEnrollments().then((res) => {
      const data = res?.data ?? (Array.isArray(res) ? res : []);
      setCourseCount(data.length);
    }).catch(() => {});
  }, []);

  const pickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (!result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploadingPhoto(true);
    try {
      const res = await uploadApi.uploadImage(asset.uri!, asset.fileName || 'photo.jpg', asset.type || 'image/jpeg');
      const url = res?.data?.url || res?.url || '';
      if (url) {
        setAvatarUrl(url);
        await authApi.updateProfile({ profileImageUrl: url });
        setUser(prev => prev ? { ...prev, profileImageUrl: url } : prev);
      }
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await clearAuthToken();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const isArtist = user?.isArtist || user?.role === 'artist';

  const menuItems = [
    { icon: Bell, label: 'Notifications', screen: 'Notifications' as keyof RootStackParamList },
    { icon: Calendar, label: 'My Bookings', screen: 'MyBookings' as keyof RootStackParamList },
    { icon: BookOpen, label: 'My Learning', screen: 'MyLearning' as keyof RootStackParamList },
    ...(isArtist ? [{ icon: Shield, label: 'Artist Dashboard', screen: 'ArtistDashboard' as keyof RootStackParamList }] : []),
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color="#7c3aed" size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>Manage your account</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} activeOpacity={0.8}>
              {uploadingPhoto ? (
                <ActivityIndicator color="#fff" />
              ) : avatarUrl ? (
                <Image source={{ uri: withImageCacheBust(avatarUrl) }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitials}>{initialsFromName(user?.name)}</Text>
              )}
              <View style={styles.cameraOverlay}>
                <Camera color="#fff" size={14} />
              </View>
            </TouchableOpacity>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user?.name || '—'}</Text>
              <Text style={styles.heroRole}>{user?.role || 'User'}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bookingCount}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{courseCount}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
          </View>
        </Animated.View>

        {/* Personal info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><User color="#888" size={18} /></View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name || '—'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Mail color="#888" size={18} /></View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu items */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.menuList}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen as any)}
                activeOpacity={0.8}
              >
                <View style={styles.menuIcon}><Icon color="#888" size={20} /></View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight color="#555" size={18} />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut color="#ef4444" size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>Meet Music v1.0.0{'\n'}© 2026 All rights reserved</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },

  heroCard: {
    borderRadius: 24, padding: 20,
    backgroundColor: '#7c3aed',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 72, height: 72 },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 22 },
  cameraOverlay: {
    position: 'absolute', bottom: 4, right: 4,
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroRole: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, overflow: 'hidden',
  },
  statBox: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },

  card: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 20, overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  infoIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#666', marginBottom: 3 },
  infoValue: { fontSize: 15, color: '#fff', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 16 },

  menuList: { gap: 10 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 18, padding: 16,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#fff' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 18, padding: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
  footer: { textAlign: 'center', color: '#444', fontSize: 12, lineHeight: 20, marginTop: 8 },
});
