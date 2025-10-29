# Medication Reminder App 💊

A React Native application for nurses to manage and track patient medications in hospitals or care facilities. Built with Expo and FastAPI.

## Features

- 🔐 **Secure Login** - Authentication for nurses
- 👥 **Patient Management** - Grid/List view of all patients
- ⏰ **Medication Reminders** - Visual alerts (flashing) for overdue medications
- 📋 **Patient Details** - Comprehensive medication information and schedules
- ✅ **Action Buttons** - Mark as Done, Delay 30 minutes, or Cancel
- 💾 **Offline Support** - Local caching with automatic sync
- 📱 **Tablet Optimized** - Responsive design for iPad and Android tablets

## Project Structure

```
asg3/
├── app/                    # React Native screens (Expo Router)
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Entry point
│   ├── login.tsx          # Login screen
│   ├── patients.tsx       # Patient list/grid with flashing alerts
│   └── patient/[id].tsx   # Patient detail screen
├── services/              # API and data services
│   ├── api.ts            # API service with mock data
│   ├── storage.ts        # AsyncStorage for offline caching
│   └── sync.ts           # Background sync service
├── types/                # TypeScript interfaces
│   └── index.ts          # Patient, Medication, User types
├── backend/              # FastAPI backend
│   ├── main.py           # API server with in-memory storage
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Backend documentation
└── components/           # Reusable UI components
```

## Getting Started

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the app:**
   ```bash
   npx expo start
   ```

3. **Run on device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

### Backend Setup (Optional)

The app works with **mock data by default**. To use the real backend:

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Update frontend configuration:**
   - Find your computer's IP: `ifconfig | grep inet` (macOS/Linux) or `ipconfig` (Windows)
   - Edit `services/api.ts`:
     ```typescript
     const API_BASE_URL = 'http://YOUR_IP:8000';
     private useMockData = false;
     ```

4. **Test the API:**
   - Visit http://localhost:8000/docs for interactive documentation

## Default Credentials

**Username:** `nurse`  
**Password:** `nurse123`

## Mock Data

The app includes 6 mock patients:

**Patients with overdue medications (will flash):**
- John Doe - Room 101, Bed A
- Robert Johnson - Room 103, Bed A  
- Michael Davis - Room 105, Bed A

**Patients with upcoming medications:**
- Jane Smith - Room 102, Bed B
- Emily Brown - Room 104, Bed C
- Sarah Wilson - Room 106, Bed B

## Key Technologies

- **Frontend:** React Native, Expo Router, TypeScript, Reanimated
- **Backend:** FastAPI, Python, JWT Authentication
- **Storage:** AsyncStorage (offline), In-memory (backend)
- **State Management:** React Hooks
- **Navigation:** Expo Router (file-based routing)

## Testing on iPad/Tablet

1. Ensure your device and computer are on the same network
2. Start the Expo dev server
3. Scan QR code with Expo Go or Camera app
4. The app will automatically use grid layout on tablets (width > 600px)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
