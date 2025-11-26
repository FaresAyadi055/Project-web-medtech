# UniTasks - School Task Management Platform

A complete full-stack web application for managing school tasks with role-based access control for Admin, Teachers, and Students.

## 🚀 Features

- **Role-Based Access Control**: Admin, Teacher, and Student roles with specific permissions
- **Admin Dashboard**: User management, class creation, teacher assignment
- **Teacher Dashboard**: Class management, student enrollment, task creation, submission grading
- **Student Dashboard**: View assigned tasks, submit work, track submission status
- **Authentication**: Secure login/registration with JWT tokens
- **Real-time Updates**: Dynamic UI updates for task submissions and grading
- **Responsive Design**: Mobile-friendly dark theme UI using TailwindCSS

## 🛠 Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- TailwindCSS for styling
- Axios for HTTP requests

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🏃 Quick Start (Local Development)

### 1. Frontend Setup

```bash
cd "dev web"
npm install
cp .env.example .env.local
```

Edit `.env.local` to use the backend API:
```env
VITE_USE_API=true
VITE_API_URL=http://localhost:4000/api
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your MongoDB connection:
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/uni_tasks
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/uni_tasks
```

### 3. Seed Demo Data (Optional)

```bash
cd server
npm run seed
```

This creates demo accounts:
- Admin: `admin@local` / `password123`
- Teacher: `alice@local` / `password123`
- Student: `bob@local` / `password123`

### 4. Run the Application

#### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:4000`

#### Terminal 2: Frontend Dev Server
```bash
npm run dev
```
App runs on: `http://localhost:5173`

### 5. Access the Application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum("admin", "teacher", "student"),
  classes: [ObjectId]
}
```

### Class
```javascript
{
  name: String,
  teacher: ObjectId (User),
  students: [ObjectId (User)],
  tasks: [ObjectId (Task)]
}
```

### Task
```javascript
{
  title: String,
  description: String,
  class: ObjectId,
  createdBy: ObjectId (Teacher),
  createdAt: Date
}
```

### Submission
```javascript
{
  task: ObjectId,
  student: ObjectId,
  content: String,
  status: Enum("pending", "approved", "rejected"),
  gradedBy: ObjectId (Teacher),
  submittedAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Classes
- `POST /api/classes` - Create class (Admin)
- `GET /api/classes` - List all classes
- `GET /api/classes/:id` - Get class details
- `POST /api/classes/:id/enroll` - Enroll student (Teacher)
- `POST /api/classes/:id/remove-student` - Remove student (Teacher)
- `DELETE /api/classes/:id` - Delete class (Admin)

### Tasks
- `POST /api/tasks` - Create task (Teacher)
- `GET /api/tasks/class/:classId` - Get tasks for class
- `GET /api/tasks/:id` - Get task details
- `DELETE /api/tasks/:id` - Delete task (Teacher)

### Submissions
- `POST /api/submissions` - Submit task (Student)
- `GET /api/submissions/task/:taskId` - Get submissions for task (Teacher)
- `GET /api/submissions/student` - Get student's submissions
- `POST /api/submissions/:id/grade` - Grade submission (Teacher)

## 👥 User Roles & Permissions

### Admin
- Create, update, delete users
- Create and manage classes
- Assign teachers to classes
- View all tasks and users

### Teacher
- View assigned classes
- Enroll/remove students from classes
- Create tasks for their classes
- View and grade student submissions
- Approve or reject submissions

### Student
- View tasks from enrolled classes
- Submit tasks
- View submission status and feedback
- Edit profile

## 📁 Project Structure

```
dev web/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── TaskDetail.jsx
│   │   ├── ClassManagement.jsx
│   │   ├── TaskManagement.jsx
│   │   └── Profile.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── ...
│   ├── lib/
│   │   ├── useAuth.jsx
│   │   └── dbClient.js
│   ├── api/
│   │   └── client.js
│   └── App.jsx
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Task.js
│   │   └── Submission.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── classController.js
│   │   ├── taskController.js
│   │   └── submissionController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── classes.js
│   │   ├── tasks.js
│   │   └── submissions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   ├── app.js
│   ├── seed.js
│   └── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Deployment

### Deploy Frontend to Firebase Hosting

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Initialize Firebase project**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist`
   - Configure single-page app: Yes

5. **Deploy**:
   ```bash
   firebase deploy
   ```

### Deploy Backend to Heroku

1. **Create Heroku account and install CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set JWT_EXPIRES_IN=7d
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Update frontend API URL** in Firebase/deploy to use your Heroku URL

## 🧪 Testing with Postman

1. Register a new user or use demo credentials
2. Login and copy the JWT token from the response
3. Add token to Authorization header: `Bearer <token>`
4. Test API endpoints

## 📝 Notes

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- All API endpoints require authentication (except /auth/login and /auth/register)
- Role-based access control is enforced on all protected endpoints
- Database connection uses Mongoose with connection pooling

## 🐛 Troubleshooting

**MongoDB connection error**:
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access is allowed in MongoDB Atlas

**API requests fail**:
- Check if backend server is running on port 4000
- Verify VITE_API_URL in .env.local matches backend URL
- Check browser console for CORS errors

**Login fails**:
- Ensure seed data is populated with `npm run seed`
- Check password matches exactly (case-sensitive)
- Verify MongoDB has the users collection

## 📄 License

This project is provided as-is for educational purposes.

## 👨‍💻 Support

For issues or questions, please check the API response messages and browser console logs for debugging information.
