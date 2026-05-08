import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { ChoosePathScreen } from './src/screens/ChoosePathScreen';
import { BrowseArtistsScreen } from './src/screens/BrowseArtistsScreen';
import { ArtistProfileScreen } from './src/screens/ArtistProfileScreen';
import { JoinAsArtistScreen } from './src/screens/JoinAsArtistScreen';
import { JoinAsDanceArtistScreen } from './src/screens/JoinAsDanceArtistScreen';
import { ArtistDashboardScreen } from './src/screens/ArtistDashboardScreen';
import { LearnCategoryScreen } from './src/screens/LearnCategoryScreen';
import { HireCategoryScreen } from './src/screens/HireCategoryScreen';
import { LearningHomeScreen } from './src/screens/LearningHomeScreen';
import { DanceHomeScreen } from './src/screens/DanceHomeScreen';
import { HireBandsScreen } from './src/screens/HireBandsScreen';
import { JoinCategoryScreen } from './src/screens/JoinCategoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { MyBookingsScreen } from './src/screens/MyBookingsScreen';
import { BookArtistScreen } from './src/screens/BookArtistScreen';
import { GlobalSearchScreen } from './src/screens/GlobalSearchScreen';
import { CoursesListScreen } from './src/screens/CoursesListScreen';
import { MyLearningScreen } from './src/screens/MyLearningScreen';
import { BandProfileScreen } from './src/screens/BandProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ChoosePath: undefined;
  LearnCategory: undefined;
  HireCategory: undefined;
  BrowseArtists: undefined;
  ArtistProfile: { id: string };
  JoinCategory: undefined;
  JoinAsArtist: undefined;
  JoinAsDanceArtist: undefined;
  ArtistDashboard: undefined;
  LearningHome: undefined;
  DanceHome: undefined;
  HireBands: undefined;
  Profile: undefined;
  Notifications: undefined;
  MyBookings: undefined;
  BookArtist: { artistId: string };
  BandProfile: { id: string };
  GlobalSearch: undefined;
  CoursesList: { instrument: string; isDance?: boolean };
  MyLearning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ChoosePath" component={ChoosePathScreen} />
        <Stack.Screen name="LearnCategory" component={LearnCategoryScreen} />
        <Stack.Screen name="HireCategory" component={HireCategoryScreen} />
        <Stack.Screen name="LearningHome" component={LearningHomeScreen} />
        <Stack.Screen name="DanceHome" component={DanceHomeScreen} />
        <Stack.Screen name="BrowseArtists" component={BrowseArtistsScreen} />
        <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
        <Stack.Screen name="JoinCategory" component={JoinCategoryScreen} />
        <Stack.Screen name="JoinAsArtist" component={JoinAsArtistScreen} />
        <Stack.Screen name="JoinAsDanceArtist" component={JoinAsDanceArtistScreen} />
        <Stack.Screen name="ArtistDashboard" component={ArtistDashboardScreen} />
        <Stack.Screen name="HireBands" component={HireBandsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="BookArtist" component={BookArtistScreen} />
        <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
        <Stack.Screen name="CoursesList" component={CoursesListScreen} />
        <Stack.Screen name="MyLearning" component={MyLearningScreen} />
        <Stack.Screen name="BandProfile" component={BandProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
