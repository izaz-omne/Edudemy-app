# Edudemy - Comprehensive Education Management Platform

**Stack**: FastAPI, PostgreSQL, SQLModel, OAuth2 (JWT), WebSockets, React, Tailwind CSS

A complete education management system with role-based access control, real-time messaging, notifications, and comprehensive academic management features.

## 🚀 Features

### 🔐 **Role-Based Access Control**
- **Super Admin**: Complete system control and user management
- **Admin**: Full academic and administrative management
- **Management**: Reporting, task management, and oversight
- **Teachers**: Class management, grading, attendance, and student records
- **Students**: View grades, attendance, submit feedback, messaging
- **Academics**: Academic planning, class scheduling, report generation

### 💬 **Communication System**
- **1-to-1 Messaging**: WhatsApp-like personal messaging
- **Group Chats**: Create and manage group conversations
- **Real-time WebSocket**: Instant message delivery
- **File Sharing**: Support for images and documents

### 📢 **Smart Notification System**
- **Role-specific Notifications**: Customized for each user type
- **Automated Reminders**: Class and exam notifications
- **Task Assignments**: Workflow management notifications
- **Student Issues**: Feedback escalation alerts

### 📚 **Academic Management**
- **Batch Management**: Create and organize student batches
- **Class Scheduling**: Weekly class assignments and instant changes
- **Exam Management**: Create, schedule, and grade exams
- **Attendance Tracking**: Digital attendance with analytics
- **Behavior Records**: Track strengths, weaknesses, and behavior patterns
- **Auto Report Cards**: Generated from exam and behavior data

### 📝 **Student Services**
- **Feedback System**: Anonymous and named feedback submission
- **Payment Tracking**: Fee collection and payment history
- **Performance Analytics**: Grade trends and attendance summaries
- **Parent Portal**: Access to student progress and communications

### 📊 **Analytics & Reports**
- **Performance Analytics**: Grade distributions and trends
- **Attendance Reports**: Class and student-wise attendance
- **Financial Reports**: Payment tracking and overdue analysis
- **System Analytics**: User activity and system usage

## 🛠 Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Robust relational database
- **SQLModel**: Type-safe ORM with Pydantic integration
- **WebSockets**: Real-time bidirectional communication
- **JWT Authentication**: Secure token-based auth
- **Alembic**: Database migrations
- **Docker**: Containerization and deployment

### Frontend
- **React**: Modern JavaScript UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization
- **Lucide React**: Beautiful icons

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.9+ (for local development)
- Node.js 16+ (for frontend development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd edudemy-app
```

### 2. Environment Configuration
Create `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://postgres:password@db:5432/edudemy
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Start with Docker
```bash
docker-compose up --build
```

### 4. Initialize Database
```bash
# Run the seed script to create initial data
docker-compose exec backend python run_seed.py
```

### 5. Access the Application
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173
- **Database**: PostgreSQL on localhost:5432

## 🔑 Default Login Credentials

After running the seed script, you can login with:

- **Super Admin**: `superadmin` / `superadmin123`
- **Admin**: `admin` / `admin123`  
- **Manager**: `manager` / `manager123`

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Create new user (admin only)
- `GET /auth/me` - Get current user info
- `POST /auth/create-superadmin` - Initialize super admin

### User Management
- `GET /admin/users/` - List all users
- `POST /admin/users/` - Create user
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Deactivate user

### Academic Management
- `GET /academics/batches/` - List batches
- `POST /academics/batches/` - Create batch
- `GET /academics/class-assignments/` - List classes
- `POST /academics/exams/` - Create exam
- `POST /academics/attendance/` - Mark attendance
- `POST /academics/report-cards/` - Generate report

### Messaging
- `POST /messaging/messages/` - Send message
- `GET /messaging/messages/conversations` - Get conversations
- `POST /messaging/groups/` - Create group
- `WebSocket /messaging/ws/{user_id}` - Real-time connection

### Notifications
- `GET /notifications/` - Get user notifications
- `PUT /notifications/{id}/read` - Mark as read
- `POST /notifications/send-bulk` - Send bulk notifications

### Feedback
- `POST /feedback/` - Submit feedback
- `GET /feedback/` - List feedback (admin/management)
- `PUT /feedback/{id}/respond` - Respond to feedback

### Analytics
- `GET /admin/analytics/overview` - System overview
- `GET /admin/analytics/attendance` - Attendance analytics
- `GET /admin/analytics/performance` - Performance analytics

## 🏗 System Architecture

### Database Schema
The system uses a comprehensive relational database schema with:
- **User Management**: Users, roles, permissions
- **Academic Structure**: Batches, students, teachers, classes
- **Assessment System**: Exams, results, attendance, behavior
- **Communication**: Messages, groups, notifications
- **Administrative**: Tasks, payments, feedback

### Permission System
Hierarchical permission system with:
- **Resource-based permissions**: Users, students, classes, etc.
- **Action-based controls**: Create, read, update, delete
- **Role-based defaults**: Predefined permissions per role
- **Individual overrides**: Custom permissions per user

### Real-time Features
- **WebSocket connections**: Persistent connections per user
- **Message broadcasting**: Instant delivery to online users
- **Notification streaming**: Real-time alerts and updates
- **Connection management**: Automatic reconnection and cleanup

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Set production values
2. **Database**: Use managed PostgreSQL service
3. **SSL/TLS**: Configure HTTPS certificates
4. **Load Balancing**: Use nginx or cloud load balancer
5. **Monitoring**: Set up logging and metrics

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Run migrations
docker-compose exec backend alembic upgrade head

# Initialize production data
docker-compose exec backend python run_seed.py
```

## 🧪 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 📝 Contributing

1. **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
2. **Testing**: Write unit tests for new features
3. **Documentation**: Update API docs and README
4. **Pull Requests**: Use descriptive titles and comments

## 🔒 Security Notes

- **Change default passwords** in production
- **Use environment variables** for sensitive data
- **Enable HTTPS** for production deployments
- **Regular backups** of database
- **Monitor access logs** for suspicious activity

## 📞 Support

For issues and questions:
- Check API documentation at `/docs`
- Review logs in `docker-compose logs backend`
- Open issues in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
