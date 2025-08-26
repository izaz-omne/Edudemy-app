# Frontend Structure

## Overview
This React frontend application uses Vite for development and build tooling, with Tailwind CSS for styling.

## Directory Structure

```
src/
├── App.css              # Global app styles
├── App.jsx              # Main application router with role-based routing
├── index.css            # Global CSS including Tailwind imports
├── main.jsx             # React entry point with providers
├── assets/              # Static assets
│   └── react.svg
├── components/          # Reusable UI components
│   ├── ChartCard.jsx    # Chart display component
│   ├── Header.jsx       # Page header component
│   ├── Layout.jsx       # Main layout with sidebar, navbar, notifications
│   ├── Navbar.jsx       # Top navigation bar
│   ├── ProtectedRoute.jsx # Route protection based on user roles
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── StatCard.jsx     # Statistics display card
│   └── ui/
│       └── card.jsx     # Base card UI component
├── context/
│   └── AuthContext.jsx # Authentication context with role management
├── hooks/
│   └── useWebSocket.js  # WebSocket hook for real-time features
├── pages/               # Application pages
│   ├── Batches.jsx      # Batch management page
│   ├── DashboardAcademics.jsx   # Academic management dashboard
│   ├── DashboardAdmin.jsx       # Admin dashboard with system stats
│   ├── DashboardManagement.jsx  # Management dashboard with financial data
│   ├── DashboardStudent.jsx     # Student dashboard with grades/attendance
│   ├── DashboardTeacher.jsx     # Teacher dashboard with class management
│   ├── Login.jsx        # Authentication page
│   ├── MessagingPage.jsx # Real-time messaging interface
│   ├── MyClasses.jsx    # Teacher's class management
│   ├── NotFound.jsx     # 404 error page
│   ├── NotificationsPage.jsx # Notification management center
│   ├── Students.jsx     # Student management page
│   ├── Teachers.jsx     # Teacher management page
│   ├── UserManagement.jsx # User administration page
│   └── student/         # Student-specific pages
│       ├── AttendancePage.jsx # Student attendance tracking with calendar
│       └── GradesPage.jsx     # Student grade tracking with analytics
└── services/
    └── api.js           # Complete API service layer for backend integration
```

## Key Features

### Role-Based Access Control
- **Superadmin/Admin**: Full system access, user management, analytics
- **Management**: Institutional management, financial oversight, staff management  
- **Academics**: Academic calendar, curriculum, exam management
- **Teacher**: Class management, attendance, grading
- **Student**: Grade viewing, attendance tracking, messaging

### Real-Time Features
- **WebSocket Integration**: Live messaging and notifications
- **Real-Time Updates**: Instant message delivery and notification updates
- **Live Data**: Unread message counts, notification badges

### Modern UI/UX
- **Tailwind CSS**: Utility-first styling with consistent design system
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Interactive Components**: Charts, calendars, and data visualizations
- **Loading States**: Proper loading indicators and error handling

### API Integration
- **Comprehensive API Layer**: Complete backend integration for all features
- **Authentication**: JWT-based authentication with role management
- **Error Handling**: Proper error handling and user feedback
- **Data Management**: CRUD operations for all entities

## Technology Stack

- **React 18**: Latest React with hooks and functional components
- **React Router 6**: Client-side routing with protection
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Data visualization library
- **Vite**: Fast development and build tool

## Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

## Backend Integration

The frontend is designed to work with a FastAPI backend and expects:
- JWT authentication endpoints
- RESTful APIs for all resources
- WebSocket support for real-time features
- Role-based access control at the API level
