# QUICK START - UniTasks School Task Manager

## ⚡ Get Started in 5 Minutes

### 1️⃣ Backend (First Terminal)
```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```
✅ Backend running at: `http://localhost:4000`

### 2️⃣ Frontend (Second Terminal)
```bash
npm install
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

### 3️⃣ Open Browser
Visit: `http://localhost:5173`

---

## 🔑 Demo Credentials

Copy-paste ready:

### Admin Account
```
Email: admin@local
Password: password123
```

### Teacher Account
```
Email: alice@local
Password: password123
```

### Student Account
```
Email: bob@local
Password: password123
```

---

## 🎯 Quick Test Workflow

1. **Login as Teacher**
   - Email: `alice@local`
   - Password: `password123`
   - Go to "My Classes"

2. **Create a Task**
   - Click "Manage Tasks"
   - Click "Create Task"
   - Fill in title and description
   - Submit

3. **Login as Student**
   - Email: `bob@local`
   - Password: `password123`
   - See task on dashboard
   - Click "View Task"
   - Click "Submit Task"
   - Enter response and submit

4. **Grade as Teacher**
   - Login as teacher again
   - Go to "Manage Tasks"
   - Click "Submissions"
   - Click "Approve" or "Reject"

---

## 📱 Key Features to Try

- ✅ **Admin Dashboard** - Manage users and classes
- ✅ **Teacher Dashboard** - Create tasks and grade submissions
- ✅ **Student Dashboard** - View tasks and submit work
- ✅ **Profile Page** - Edit user information
- ✅ **Class Management** - Enroll/remove students

---

## ⚙️ Configuration

### MongoDB Setup (Default)
Uses `mongodb://localhost:27017/uni_tasks`

Already configured in `.env`

### Change MongoDB Atlas
Edit `server/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/uni_tasks
```

### Change Frontend API URL
Edit `.env.local`:
```env
VITE_API_URL=http://your-backend-url/api
```

---

## 🆘 Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas (cloud)

### "API not responding"
- Check backend is running on port 4000
- Verify VITE_API_URL in `.env.local`

### "Can't login"
- Run `npm run seed` to create demo data
- Check password is `password123`

---

## 📦 Project Files

Key files to know:

**Frontend:**
- `src/App.jsx` - Main routing
- `src/pages/` - All page components
- `.env.local` - Frontend config
- `src/api/client.js` - API client

**Backend:**
- `server/app.js` - Express server
- `server/models/` - Database schemas
- `server/controllers/` - Business logic
- `server/.env` - Backend config
- `server/seed.js` - Demo data

---

## 🚀 Next Steps

### Ready to Deploy?
1. Build: `npm run build`
2. See `README.md` for Firebase/Heroku instructions

### Want to Add Features?
1. Create new API route in `server/routes/`
2. Add controller in `server/controllers/`
3. Call from frontend component

### Need More Documentation?
- See `README.md` - Comprehensive guide
- See `COMPLETION_SUMMARY.md` - What was built
- Check API endpoints in README

---

## ✨ That's It!

You now have a fully functional school task management system running locally.

**Enjoy building! 🎉**
