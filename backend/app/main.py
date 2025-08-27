from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import auth, users, students, permissions, messaging, notifications, feedback, academics, admin
from .config import settings    

app = FastAPI(title='Edudemy API')

#adjust for frontend dev URL and preview URL
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://checkmate-24.preview.emergentagent.com",
    "https://*.preview.emergentagent.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event('startup')
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(students.router)
app.include_router(permissions.router)
app.include_router(messaging.router)
app.include_router(notifications.router)
app.include_router(feedback.router)
app.include_router(academics.router)
app.include_router(admin.router)

@app.get('/')
def root():
    return {'message': 'Edudemy API up!'}