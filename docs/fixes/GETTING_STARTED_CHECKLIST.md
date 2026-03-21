# 🎯 Getting Started Checklist

Use this checklist to ensure your CodeNest setup is complete and ready for development.

## ✅ Pre-Setup Checklist

### System Requirements
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)

### Download & Extract
- [ ] Project downloaded/cloned
- [ ] Navigated to CodeNest directory

## ✅ Backend Setup Checklist

### Environment Setup
- [ ] Created virtual environment (`python -m venv venv`)
- [ ] Activated virtual environment
  - Windows: `venv\Scripts\activate`
  - Linux/Mac: `source venv/bin/activate`
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Installed python-dotenv (`pip install python-dotenv`)

### Database Configuration
- [ ] MySQL service is running
- [ ] Created database: `codenest_db`
  ```sql
  CREATE DATABASE codenest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `.env` with your MySQL credentials:
  - [ ] DATABASE_USER
  - [ ] DATABASE_PASSWORD
  - [ ] DATABASE_HOST
  - [ ] DATABASE_PORT

### Django Setup
- [ ] Ran migrations (`python manage.py migrate`)
- [ ] Created superuser (`python manage.py createsuperuser`)
  - Username: _______________
  - Email: _______________
  - Password: _______________
- [ ] (Optional) Seeded database (`python manage.py seed_db`)
- [ ] Started server (`python manage.py runserver`)
- [ ] Verified backend at http://localhost:8000
- [ ] Accessed admin panel at http://localhost:8000/admin

## ✅ Frontend Setup Checklist

### Environment Setup
- [ ] Navigated to `project2` directory
- [ ] Installed dependencies (`npm install`)
- [ ] Copied `.env.example` to `.env`
- [ ] Verified `VITE_API_URL=http://localhost:8000` in `.env`

### React Setup
- [ ] Started dev server (`npm run dev`)
- [ ] Verified frontend at http://localhost:5173
- [ ] No console errors in browser

## ✅ Application Testing Checklist

### Basic Functionality
- [ ] Frontend loads without errors
- [ ] Can navigate between pages
- [ ] Registration page accessible
- [ ] Login page accessible

### User Registration & Login
- [ ] Created a test student account
  - Username: _______________
  - Email: _______________
- [ ] Successfully logged in
- [ ] JWT token received
- [ ] Redirected to dashboard

### Core Features
- [ ] Can view problems list
- [ ] Can open a problem
- [ ] Code editor loads (Monaco Editor)
- [ ] Can write code in editor
- [ ] Can submit code
- [ ] Can view profile
- [ ] Can view analytics
- [ ] Can view leaderboard

### Teacher/Mentor Features (Optional)
- [ ] Created teacher account (use registration code: TEACHER2024)
- [ ] Can access mentor dashboard
- [ ] Can create context/problem sets
- [ ] Can view student analytics

## ✅ Configuration Checklist

### Security (Important!)
- [ ] Changed SECRET_KEY in settings.py (for production)
- [ ] Updated DATABASE_PASSWORD in .env
- [ ] Verified DEBUG=True only for development
- [ ] Checked ALLOWED_HOSTS configuration
- [ ] Reviewed CORS_ALLOWED_ORIGINS

### Optional Configurations
- [ ] Configured email backend (for notifications)
- [ ] Set up logging directory
- [ ] Configured static files directory
- [ ] Set up media files directory

## ✅ Development Workflow Checklist

### Daily Development
- [ ] Start MySQL service
- [ ] Activate virtual environment
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Open browser to http://localhost:5173

### Using Helper Scripts
- [ ] Tested `quick-start.bat` or `quick-start.sh`
- [ ] Tested `start-dev.bat` or `start-dev.sh`
- [ ] Scripts work correctly

## ✅ Documentation Review

- [ ] Read README.md
- [ ] Read SETUP_GUIDE.md
- [ ] Read RECOMMENDATIONS.md
- [ ] Understand project structure
- [ ] Know where to find API endpoints

## ✅ Next Steps

### Immediate
- [ ] Explore the application features
- [ ] Try solving a problem
- [ ] Check analytics dashboard
- [ ] Test different user roles

### Short Term
- [ ] Review code structure
- [ ] Understand API endpoints
- [ ] Customize styling/branding
- [ ] Add more problems to database

### Long Term
- [ ] Implement security recommendations
- [ ] Add automated tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production
- [ ] Add new features

## 🐛 Troubleshooting

If you encounter issues, check:

1. **Backend not starting?**
   - [ ] MySQL service running?
   - [ ] Virtual environment activated?
   - [ ] All dependencies installed?
   - [ ] Database credentials correct?
   - [ ] Migrations run successfully?

2. **Frontend not loading?**
   - [ ] Node modules installed?
   - [ ] Backend server running?
   - [ ] Correct API URL in .env?
   - [ ] No port conflicts?

3. **Can't login?**
   - [ ] User account created?
   - [ ] Correct credentials?
   - [ ] Backend API responding?
   - [ ] Check browser console for errors

4. **CORS errors?**
   - [ ] Frontend URL in CORS_ALLOWED_ORIGINS?
   - [ ] Backend server restarted after changes?

## 📞 Getting Help

- Check SETUP_GUIDE.md for detailed instructions
- Review RECOMMENDATIONS.md for common issues
- Check browser console for frontend errors
- Check terminal for backend errors
- Review Django logs in `logs/` directory

## 🎉 Success Criteria

You're ready to develop when:
- ✅ Both servers start without errors
- ✅ Can register and login
- ✅ Can view and solve problems
- ✅ Code editor works
- ✅ Can submit solutions
- ✅ Analytics display correctly

---

**Congratulations!** 🎊 If you've checked all the boxes, your CodeNest development environment is ready!

Start coding and happy learning! 🚀
