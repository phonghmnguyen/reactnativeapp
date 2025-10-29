import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

app = FastAPI(title="Medication Reminder API")

# CORS middleware - allows React Native app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production-12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()

# Pydantic models


class LoginRequest(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: str
    username: str
    firstName: str
    lastName: str
    role: str


class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[User] = None
    message: Optional[str] = None


class Medication(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    scheduledTime: str
    nextDueTime: str
    instructions: Optional[str] = None


class Patient(BaseModel):
    id: str
    firstName: str
    lastName: str
    photoUrl: Optional[str] = None
    roomNumber: str
    bedNumber: str
    medications: List[Medication]
    hasPendingMedication: bool


class MedicationStatusUpdate(BaseModel):
    patientId: str
    medicationId: str
    status: str  # 'done', 'delayed', 'cancelled'
    timestamp: str
    delayedUntil: Optional[str] = None
    notes: Optional[str] = None


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None


# In-memory storage
users_db = {
    "nurse": {
        "id": "user1",
        "username": "nurse",
        "password": "nurse123",  # Plain text for development only
        "firstName": "Mary",
        "lastName": "Johnson",
        "role": "nurse"
    }
}

# Initialize patients with realistic medication times


def create_initial_patients() -> Dict[str, Patient]:
    now = datetime.now()

    return {
        "1": Patient(
            id="1",
            firstName="John",
            lastName="Doe",
            photoUrl="https://i.pravatar.cc/150?img=12",
            roomNumber="101",
            bedNumber="A",
            hasPendingMedication=True,
            medications=[
                Medication(
                    id="m1",
                    name="Aspirin",
                    dosage="100mg",
                    frequency="Twice daily",
                    scheduledTime=(now - timedelta(minutes=5)).isoformat(),
                    nextDueTime=(now - timedelta(minutes=5)).isoformat(),
                    instructions="Take with food"
                ),
                Medication(
                    id="m2",
                    name="Metformin",
                    dosage="500mg",
                    frequency="Three times daily",
                    scheduledTime=(now + timedelta(hours=2)).isoformat(),
                    nextDueTime=(now + timedelta(hours=2)).isoformat(),
                    instructions="Take before meals"
                )
            ]
        ),
        "2": Patient(
            id="2",
            firstName="Jane",
            lastName="Smith",
            photoUrl="https://i.pravatar.cc/150?img=5",
            roomNumber="102",
            bedNumber="B",
            hasPendingMedication=False,
            medications=[
                Medication(
                    id="m3",
                    name="Lisinopril",
                    dosage="10mg",
                    frequency="Once daily",
                    scheduledTime=(now + timedelta(hours=4)).isoformat(),
                    nextDueTime=(now + timedelta(hours=4)).isoformat(),
                    instructions="Take in the morning"
                )
            ]
        ),
        "3": Patient(
            id="3",
            firstName="Robert",
            lastName="Johnson",
            photoUrl="https://i.pravatar.cc/150?img=33",
            roomNumber="103",
            bedNumber="A",
            hasPendingMedication=True,
            medications=[
                Medication(
                    id="m4",
                    name="Warfarin",
                    dosage="5mg",
                    frequency="Once daily",
                    scheduledTime=(now - timedelta(minutes=2)).isoformat(),
                    nextDueTime=(now - timedelta(minutes=2)).isoformat(),
                    instructions="Take at the same time each day"
                )
            ]
        ),
        "4": Patient(
            id="4",
            firstName="Emily",
            lastName="Brown",
            photoUrl="https://i.pravatar.cc/150?img=9",
            roomNumber="104",
            bedNumber="C",
            hasPendingMedication=False,
            medications=[
                Medication(
                    id="m5",
                    name="Levothyroxine",
                    dosage="50mcg",
                    frequency="Once daily",
                    scheduledTime=(now + timedelta(hours=1)).isoformat(),
                    nextDueTime=(now + timedelta(hours=1)).isoformat(),
                    instructions="Take on empty stomach"
                )
            ]
        ),
        "5": Patient(
            id="5",
            firstName="Michael",
            lastName="Davis",
            photoUrl="https://i.pravatar.cc/150?img=15",
            roomNumber="105",
            bedNumber="A",
            hasPendingMedication=True,
            medications=[
                Medication(
                    id="m6",
                    name="Atorvastatin",
                    dosage="20mg",
                    frequency="Once daily",
                    scheduledTime=(now - timedelta(minutes=10)).isoformat(),
                    nextDueTime=(now - timedelta(minutes=10)).isoformat(),
                    instructions="Take in the evening"
                )
            ]
        ),
        "6": Patient(
            id="6",
            firstName="Sarah",
            lastName="Wilson",
            photoUrl="https://i.pravatar.cc/150?img=20",
            roomNumber="106",
            bedNumber="B",
            hasPendingMedication=False,
            medications=[
                Medication(
                    id="m7",
                    name="Omeprazole",
                    dosage="20mg",
                    frequency="Once daily",
                    scheduledTime=(now + timedelta(hours=3)).isoformat(),
                    nextDueTime=(now + timedelta(hours=3)).isoformat(),
                    instructions="Take before breakfast"
                )
            ]
        )
    }


# Initialize in-memory database
patients_db = create_initial_patients()
medication_history = []

# Helper functions


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, stored_password):
    """Simple password verification for development"""
    return plain_password == stored_password


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users_db.get(username)
    if user is None:
        raise credentials_exception
    return user


def update_patient_pending_status(patient_id: str):
    """Update hasPendingMedication based on current time"""
    patient = patients_db.get(patient_id)
    if patient:
        now = datetime.now()
        has_pending = any(
            datetime.fromisoformat(med.nextDueTime.replace(
                'Z', '+00:00')).replace(tzinfo=None) <= now
            for med in patient.medications
        )
        patient.hasPendingMedication = has_pending

# API Endpoints


@app.get("/")
async def root():
    return {
        "message": "Medication Reminder API",
        "version": "1.0.0",
        "endpoints": {
            "POST /auth/login": "Login endpoint",
            "GET /patients": "Get all patients",
            "GET /patients/{id}": "Get specific patient",
            "POST /medications/status": "Update medication status"
        }
    }


@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login endpoint"""
    user = users_db.get(credentials.username)

    if not user or not verify_password(credentials.password, user["password"]):
        return LoginResponse(
            success=False,
            message="Invalid username or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )

    return LoginResponse(
        success=True,
        token=access_token,
        user=User(
            id=user["id"],
            username=user["username"],
            firstName=user["firstName"],
            lastName=user["lastName"],
            role=user["role"]
        ),
        message="Login successful"
    )


@app.get("/patients")
async def get_patients(current_user: dict = Depends(get_current_user)):
    """Get all patients"""
    # Update pending status for all patients
    now = datetime.now()
    patients_list = []

    for patient in patients_db.values():
        # Check if any medication is due
        has_pending = any(
            datetime.fromisoformat(med.nextDueTime.replace(
                'Z', '+00:00')).replace(tzinfo=None) <= now
            for med in patient.medications
        )
        patient.hasPendingMedication = has_pending
        patients_list.append(patient)

    return {
        "success": True,
        "data": patients_list
    }


@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific patient by ID"""
    patient = patients_db.get(patient_id)

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update pending status
    update_patient_pending_status(patient_id)

    return {
        "success": True,
        "data": patient
    }


@app.post("/medications/status")
async def update_medication_status(
    update: MedicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update medication status (done, delayed, cancelled)"""
    patient = patients_db.get(update.patientId)

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Find the medication
    medication = None
    for med in patient.medications:
        if med.id == update.medicationId:
            medication = med
            break

    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")

    # Update medication based on status
    now = datetime.now()

    if update.status == "done":
        # Calculate next dose time based on frequency
        if "Three" in medication.frequency or "3" in medication.frequency:
            next_time = now + timedelta(hours=8)
        elif "Twice" in medication.frequency or "2" in medication.frequency:
            next_time = now + timedelta(hours=12)
        else:  # Once daily or default
            next_time = now + timedelta(hours=24)

        medication.nextDueTime = next_time.isoformat()
        medication.scheduledTime = next_time.isoformat()

    elif update.status == "delayed":
        if update.delayedUntil:
            delayed_time = datetime.fromisoformat(update.delayedUntil)
        else:
            delayed_time = now + timedelta(minutes=30)
        medication.nextDueTime = delayed_time.isoformat()

    elif update.status == "cancelled":
        # For cancelled, set next time far in the future
        medication.nextDueTime = (now + timedelta(days=1)).isoformat()

    # Log the status update
    medication_history.append({
        "patientId": update.patientId,
        "medicationId": update.medicationId,
        "status": update.status,
        "timestamp": update.timestamp,
        "delayedUntil": update.delayedUntil,
        "notes": update.notes,
        "processedBy": current_user["username"]
    })

    # Update pending status
    update_patient_pending_status(update.patientId)

    return {
        "success": True,
        "message": f"Medication status updated to {update.status}"
    }


@app.get("/medications/history")
async def get_medication_history(current_user: dict = Depends(get_current_user)):
    """Get medication history (for admin/reporting purposes)"""
    return {
        "success": True,
        "data": medication_history
    }


@app.post("/reset")
async def reset_data(current_user: dict = Depends(get_current_user)):
    """Reset all patient data to initial state (for testing)"""
    global patients_db, medication_history
    patients_db = create_initial_patients()
    medication_history = []

    return {
        "success": True,
        "message": "Data reset successfully"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
