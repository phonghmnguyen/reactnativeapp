# Medication Reminder API Backend

FastAPI backend for the Medication Reminder app with in-memory storage.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

Or with a virtual environment (recommended):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Server

### Development Mode
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Local:** http://localhost:8000
- **Network (for mobile testing):** http://YOUR_IP:8000

### Find your IP address:
- **macOS/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

## API Endpoints

### Authentication
- **POST /auth/login** - Login with credentials
  ```json
  {
    "username": "nurse",
    "password": "nurse123"
  }
  ```

### Patients
- **GET /patients** - Get all patients (requires auth)
- **GET /patients/{id}** - Get specific patient (requires auth)

### Medications
- **POST /medications/status** - Update medication status (requires auth)
  ```json
  {
    "patientId": "1",
    "medicationId": "m1",
    "status": "done",
    "timestamp": "2025-10-28T10:00:00"
  }
  ```

### Admin
- **GET /medications/history** - View medication history
- **POST /reset** - Reset all data to initial state

## Default Credentials

**Username:** `nurse`  
**Password:** `nurse123`

## Testing the API

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## Mock Data

The backend includes 6 mock patients:
- **3 with overdue medications** (will flash in the app):
  - John Doe (Room 101)
  - Robert Johnson (Room 103)
  - Michael Davis (Room 105)

- **3 with upcoming medications**:
  - Jane Smith (Room 102)
  - Emily Brown (Room 104)
  - Sarah Wilson (Room 106)

## Connecting from React Native App

1. Start the backend server
2. Find your computer's IP address
3. Update the frontend's `services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP:8000';
   private useMockData = false;
   ```

## Notes

- Data is stored in memory and will reset when the server restarts
- For production, replace with a real database (PostgreSQL, MongoDB, etc.)
- Update SECRET_KEY in production
- Configure CORS properly for production deployment
