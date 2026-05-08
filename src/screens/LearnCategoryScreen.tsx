import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LearnCategory'>;

const CATEGORIES = [
  {
    emoji: '🎵',
    title: 'Music',
    description: 'Guitar, Piano, Vocals, Tabla and more',
    gradient: ['#7c3aed', '#a855f7'],
    screen: 'LearningHome' as keyof RootStackParamList,
    delay: 100,
  },
  {
    emoji: '💃',
    title: 'Dance',
    description: 'Bharatnatyam, Kathak, Bollywood and more',
    gradient: ['#ec4899', '#f43f5e'],
    screen: 'DanceHome' as keyof RootStackParamList,
    delay: 200,
  },
];

export function LearnCategoryScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Animated.View entering={FadeInLeft.duration(400)} style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Learn Music & Dance</Text>
            <Text style={styles.headerSub}>Choose what you want to learn</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.body}>
        {CATEGORIES.map((cat) => (
          <Animated.View
            key={cat.title}
            entering={FadeInDown.delay(cat.delay).duration(500)}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate(cat.screen as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.emojiBox, { backgroundColor: cat.gradient[0] }]}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{cat.title}</Text>
                <Text style={styles.cardDesc}>{cat.description}</Text>
              </View>
              <View style={styles.arrowBox}>
                <ChevronRight color="#888" size={20} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 40, gap: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 24, padding: 24, gap: 20,
    marginBottom: 20,
  },
  emojiBox: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emoji: { fontSize: 36 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#888', lineHeight: 20 },
  arrowBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center',
  },
});
