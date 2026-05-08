# MusicEcosystemMobile

React Native Android app for the Music Ecosystem platform — connects music/dance learners, artists, and event organizers.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native CLI 0.85.3 |
| Language | TypeScript |
| Architecture | New Architecture (Fabric + JSI) |
| JS Engine | Hermes |
| Navigation | React Navigation 7 — NativeStack |
| Animations | react-native-reanimated v4.3.1 + react-native-worklets |
| Icons | lucide-react-native |
| Auth Storage | react-native-encrypted-storage |
| Image Picker | react-native-image-picker |
| Backend | Node.js + Express + MongoDB at `http://localhost:5001/api` |

---

## Environment Setup (Windows)

```powershell
# Java (required for Gradle)
$env:JAVA_HOME = "C:\Users\Lenovo\Downloads\openjdk-17.0.2_windows-x64_bin\jdk-17.0.2"

# Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
```

**Build path:** Use `C:\rn\android` (junction to actual project) to avoid Windows 250-char CMake path limit.

```powershell
# Create junction (run once)
New-Item -ItemType Junction -Path "C:\rn" -Target "C:\Users\Lenovo\Banao Banao\MusicEcosystemApp\apk wala\MusicEcosystemMobile"
```

---

## Running the App

### 1. Start backend
```bash
cd <backend-folder>
node server.js   # runs on port 5001
```

### 2. ADB reverse (physical device)
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5001 tcp:5001
```

### 3. Start Metro
```bash
cd "C:\Users\Lenovo\Banao Banao\MusicEcosystemApp\apk wala\MusicEcosystemMobile"
npx react-native start --reset-cache
```

### 4. Build & install (first time or after native changes)
```bash
# From C:\rn\android
cd C:\rn\android
.\gradlew assembleDebug
adb install app\build\outputs\apk\debug\app-debug.apk
```

### 5. Reload app
Shake device → Reload, or press `R` twice in Metro terminal.

### Fix blank screen after fresh install
```bash
adb push com.facebook.react.devsupport.xml \
  /data/data/com.musicecosystemmobile/shared_prefs/com.facebook.react.devsupport.xml
```

---

## All Screens (22 total)

### Auth
| Screen | File | Notes |
|---|---|---|
| Login | `LoginScreen.tsx` | Email + password, saves JWT to EncryptedStorage |
| Signup | `SignupScreen.tsx` | Name, email, password, role selection |

### Main
| Screen | File | Notes |
|---|---|---|
| Choose Path | `ChoosePathScreen.tsx` | Home screen — 5 paths, Search/Bell/Avatar buttons in header |

### Learn
| Screen | File | Notes |
|---|---|---|
| Learn Category | `LearnCategoryScreen.tsx` | Music or Dance selector |
| Learning Home | `LearningHomeScreen.tsx` | Popular instruments grid + featured teachers. Instrument cards → CoursesListScreen |
| Dance Home | `DanceHomeScreen.tsx` | Popular styles grid + featured teachers. Style cards → CoursesListScreen |
| Courses List | `CoursesListScreen.tsx` | Teachers filtered by instrument/style. City + class-type chips. Tap → ArtistProfile |
| My Learning | `MyLearningScreen.tsx` | Enrolled courses with progress bars (stats: active / done / total) |

### Hire
| Screen | File | Notes |
|---|---|---|
| Hire Category | `HireCategoryScreen.tsx` | Artists or Bands selector |
| Browse Artists | `BrowseArtistsScreen.tsx` | All artists list with search + filter |
| Artist Profile | `ArtistProfileScreen.tsx` | Avatar, services, rating + reviews, portfolio, Book button |
| Book Artist | `BookArtistScreen.tsx` | Event type, date, time, duration, location, details → hireApi.book() |
| Hire Bands | `HireBandsScreen.tsx` | Bands list with genre filter |
| Band Profile | `BandProfileScreen.tsx` | Band info, genres, bio, 5-star rating, Book This Band button |

### Join as Artist
| Screen | File | Notes |
|---|---|---|
| Join Category | `JoinCategoryScreen.tsx` | Music Artist or Dance Artist selector |
| Join as Artist | `JoinAsArtistScreen.tsx` | Stage name, bio, services, genres, location form |
| Join as Dance Artist | `JoinAsDanceArtistScreen.tsx` | Dance-specific registration form |

### My Account
| Screen | File | Notes |
|---|---|---|
| Profile | `ProfileScreen.tsx` | Avatar upload, stats, personal info, menu (Notifications/Bookings/Learning/Dashboard) |
| Notifications | `NotificationsScreen.tsx` | Type-based icons, unread dots, mark all read |
| My Bookings | `MyBookingsScreen.tsx` | 3 tabs: Upcoming / Completed / Cancelled with count badges |
| Artist Dashboard | `ArtistDashboardScreen.tsx` | Booking requests (accept/decline), upcoming gigs, availability toggle |

### Utility
| Screen | File | Notes |
|---|---|---|
| Global Search | `GlobalSearchScreen.tsx` | Search all artists by name/instrument/city/genre |

---

## Navigation Map

```
Login ──► Signup
       └─► ChoosePath
              ├── [Header] Search ──────────────────────► GlobalSearch
              ├── [Header] Bell ─────────────────────────► Notifications
              ├── [Header] Avatar ───────────────────────► Profile
              │                                               ├── Notifications
              │                                               ├── My Bookings
              │                                               ├── My Learning
              │                                               └── Artist Dashboard (artists only)
              ├── Learn Music ──► LearnCategory ──► LearningHome
              │                                         ├── [instrument card] ──► CoursesList ──► ArtistProfile ──► BookArtist
              │                                         └── [teacher card] ──────► ArtistProfile ──► BookArtist
              ├── Learn Dance ──► LearnCategory ──► DanceHome
              │                                         ├── [style card] ────────► CoursesList ──► ArtistProfile ──► BookArtist
              │                                         └── [teacher card] ──────► ArtistProfile ──► BookArtist
              ├── Hire Artist ──► HireCategory ──► BrowseArtists ──► ArtistProfile ──► BookArtist
              ├── Hire Bands ──────────────────────► HireBands ──────► BandProfile ──► BookArtist
              └── Join as Artist ──► JoinCategory ──► JoinAsArtist
                                                  └── JoinAsDanceArtist
```

---

## API Reference

Base URL: `http://localhost:5001/api`

| Module | Key Endpoints |
|---|---|
| `authApi` | `POST /auth/login`, `POST /auth/register`, `GET /auth/profile`, `PUT /auth/profile` |
| `artistsApi` | `GET /artists`, `GET /artists/:id`, `POST /artists/me`, `PUT /artists/me/availability`, `POST /artists/:id/rate` |
| `hireApi` | `POST /hire/book` |
| `bookingsApi` | `GET /bookings/me`, `GET /bookings/artist`, `PUT /bookings/:id/status` |
| `bandApi` | `GET /bands`, `GET /bands/:id`, `POST /bands/:id/join`, `POST /bands/:id/rate` |
| `learningApi` | `GET /learning`, `GET /learning/:id` |
| `enrollmentApi` | `POST /learning/:id/enroll`, `GET /learning/enrolled`, `POST /learning/:id/lessons/:id/complete` |
| `notificationsApi` | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| `uploadApi` | `POST /uploads/image`, `POST /uploads/video` |

---

## Key Files

```
App.tsx                          — Navigation root, RootStackParamList
src/
  lib/
    api.ts                       — All API calls (fetch + auth headers)
    profileImage.ts              — resolveProfileImage, initialsFromName, withImageCacheBust
  screens/
    [22 screen files]
android/
  app/src/main/
    java/.../MainActivity.kt
    AndroidManifest.xml
```

---

## What's Done vs Pending

### Done
- Full auth flow (login, signup, logout with token cleanup)
- All 5 home paths from ChoosePath fully navigable
- Artist discovery, profile, rating, portfolio, booking
- Band discovery, profile, rating, booking
- Teacher/course discovery by instrument and dance style
- Artist registration (music + dance)
- Artist dashboard (accept/decline bookings, availability)
- My Bookings with status tabs
- Notifications with mark-read
- Profile with avatar upload
- Global search
- My Learning with progress bars

### Pending (nice to have)
| Feature | Why |
|---|---|
| `CourseDetailScreen` | View course lessons, enroll button (`enrollmentApi.enroll()` exists but unused) |
| `LessonPlayerScreen` | Watch video lesson, mark complete (`enrollmentApi.completeLesson()` exists but unused) |

---

## .gitignore additions recommended

```
node_modules/
android/.gradle/
android/app/build/
android/local.properties
*.keystore
!debug.keystore
.env
```
