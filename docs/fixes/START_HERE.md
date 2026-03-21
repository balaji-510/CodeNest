# 🎯 START HERE - Quick Start Guide

## ✅ Setup Status: COMPLETE!

Everything is installed and configured. You're ready to run the project!

## 🚀 3 Simple Steps to Get Started

### Step 1: Create Admin Account
Double-click: **`create-superuser.bat`**

Or manually:
```bash
cd codenest_backend
venv\Scripts\activate
python manage.py createsuperuser
```

Enter:
- Username (e.g., admin)
- Email (optional - press Enter to skip)
- Password (type twice)

### Step 2: Start the Servers
Double-click: **`start-dev.bat`**

This opens two windows:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Step 3: Open Your Browser
Go to: **http://localhost:5173**

## 🎉 That's It!

You can now:
- Register a new account
- Login with your superuser
- Solve coding problems
- View analytics
- Explore all features

## 📚 What's Been Set Up

✅ Backend (Django)
- Virtual environment created
- All dependencies installed
- Database migrated (SQLite)
- Settings configured

✅ Frontend (React)
- All dependencies installed
- Environment configured
- Ready to run

✅ Configuration Files
- `.env` files created
- Database ready
- CORS configured
- JWT authentication set up

## 🔑 Important Information

### Default Settings
- **Database**: SQLite (file: `codenest_backend/db.sqlite3`)
- **Backend Port**: 8000
- **Frontend Port**: 5173
- **Teacher Code**: TEACHER2024

### Access Points
- **App**: http://localhost:5173
- **API**: http://localhost:8000
- **Admin**: http://localhost:8000/admin

## 🎓 Creating Accounts

### Student Account
1. Click "Register" on homepage
2. Fill in details
3. Login and start solving!

### Teacher Account
1. Register normally
2. Enter code: `TEACHER2024`
3. Access mentor dashboard

## 🛠️ Troubleshooting

### Backend won't start?
```bash
cd codenest_backend
venv\Scripts\activate
python manage.py check
```

### Frontend won't start?
```bash
cd project2
npm install
npm run dev
```

### Port already in use?
- Backend: `python manage.py runserver 8001`
- Frontend: Vite will auto-use next port (5174)

### Need to reset database?
```bash
cd codenest_backend
del db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## 📖 More Documentation

- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Detailed setup info
- **[README.md](README.md)** - Full project documentation
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command reference
- **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - Best practices

## 💡 Quick Tips

1. **Keep both terminals open** while developing
2. **Backend changes** require server restart
3. **Frontend changes** auto-reload (hot reload)
4. **Check terminal** for error messages
5. **Use Ctrl+C** to stop servers

## 🎮 Try These Features

- [ ] Register and login
- [ ] Browse problems
- [ ] Open code editor
- [ ] Submit a solution
- [ ] View your analytics
- [ ] Check leaderboard
- [ ] Explore roadmap
- [ ] Try command palette (Ctrl+K)

## ⚡ Development Workflow

1. Start servers: `start-dev.bat`
2. Make changes to code
3. Test in browser
4. Check terminal for errors
5. Repeat!

## 🆘 Need Help?

1. Check error messages in terminal
2. Review documentation files
3. Check browser console (F12)
4. Verify both servers are running

---

## 🎊 You're All Set!

**Next Action**: Run `create-superuser.bat` then `start-dev.bat`

Happy coding! 🚀
