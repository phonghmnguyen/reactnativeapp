# Medication Reminder App - Quick Start Guide

## ✅ What's Been Built

### Frontend (React Native + Expo)
- ✅ Login screen with authentication
- ✅ Patient list/grid view with responsive layout (2-3 columns based on screen size)
- ✅ Flashing animation for patients with overdue medications
- ✅ Patient detail screen with medication info
- ✅ Action buttons: Done, Delay 30min, Cancel
- ✅ Offline caching with AsyncStorage
- ✅ Background sync service
- ✅ Automatic session restoration

### Backend (FastAPI + Python)
- ✅ JWT authentication
- ✅ RESTful API endpoints
- ✅ In-memory storage (6 mock patients)
- ✅ CORS enabled for mobile apps
- ✅ Medication status tracking
- ✅ History logging

## 🚀 How to Run

### Option 1: With Mock Data (Easiest)
The app works immediately with built-in mock data:

```bash
npm install
npx expo start
```

Login with: `nurse` / `nurse123`

### Option 2: With Backend
For full API integration:

**Terminal 1 - Backend:**
```bash
cd backend
./start.sh
```

**Terminal 2 - Frontend:**
```bash
npx expo start
```

Then update `services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:8000';
private useMockData = false;  // Line 147
```

## 📱 Testing on Tablets

1. Start the app: `npx expo start`
2. Scan QR code with Expo Go app
3. The app automatically uses grid layout on tablets (width > 600px)

## 🔑 Credentials

**Username:** nurse  
**Password:** nurse123

## 📊 Mock Patients

**Will flash (overdue medications):**
- John Doe (Room 101) - Aspirin overdue 5 min
- Robert Johnson (Room 103) - Warfarin overdue 2 min
- Michael Davis (Room 105) - Atorvastatin overdue 10 min

**Won't flash (upcoming medications):**
- Jane Smith (Room 102) - Due in 4 hours
- Emily Brown (Room 104) - Due in 1 hour
- Sarah Wilson (Room 106) - Due in 3 hours

## 🏗️ Architecture

### Frontend Structure
```
app/
├── _layout.tsx          # Navigation & auth routing
├── login.tsx            # Login screen
├── patients.tsx         # Patient grid with flashing
└── patient/[id].tsx     # Detail view with actions

services/
├── api.ts               # API calls (mock or real)
├── storage.ts           # AsyncStorage wrapper
└── sync.ts              # Background sync

types/
└── index.ts             # TypeScript interfaces
```

### Backend Structure
```
backend/
├── main.py              # FastAPI app
├── requirements.txt     # Dependencies
├── start.sh             # Quick start script
└── README.md            # Backend docs
```

## 🔧 Key Features Implemented

1. **Authentication**: JWT tokens with session persistence
2. **Flashing Alerts**: React Native Reanimated for smooth animations
3. **Responsive Grid**: 2-3 columns based on screen width
4. **Offline First**: AsyncStorage caching with background sync
5. **Time-based Logic**: Automatic detection of overdue medications
6. **Action Tracking**: All medication actions logged with timestamps

## 📝 API Endpoints

- `POST /auth/login` - Authentication
- `GET /patients` - Get all patients
- `GET /patients/{id}` - Get specific patient
- `POST /medications/status` - Update medication status
- `GET /medications/history` - View history
- `POST /reset` - Reset data

## 🔍 Testing Checklist

- [ ] Login with credentials
- [ ] See 3 flashing patients (John, Robert, Michael)
- [ ] Click on flashing patient
- [ ] See medication details
- [ ] Click "Done" button
- [ ] Patient stops flashing
- [ ] Test "Delay 30 min" button
- [ ] Test "Cancel" button
- [ ] Pull to refresh patient list
- [ ] Logout and login again

## 💡 Next Steps (Optional)

- Add real database (PostgreSQL/MongoDB)
- Implement push notifications
- Add medication scheduling
- Create admin dashboard
- Add patient photos from camera
- Export medication reports

## 🛠️ Technologies Used

**Frontend:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript
- Expo Router (file-based routing)
- React Native Reanimated
- AsyncStorage

**Backend:**
- FastAPI 0.104
- Python 3.x
- JWT (python-jose)
- Bcrypt (passlib)
- Uvicorn

## 📞 Support

For issues:
1. Check `backend/README.md` for backend help
2. Check main `README.md` for setup instructions
3. Review code comments in `services/api.ts` for configuration

## ✨ Credits

Built for ASG3 - Software Engineering Best Practices
