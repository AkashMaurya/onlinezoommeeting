# 🚀 RENDER DEPLOYMENT - QUICK START

## ⚠️ IMPORTANT: START COMMAND REQUIRED

When deploying to Render, you **MUST** provide the Start Command.

---

## 📋 RENDER CONFIGURATION

### 1. Basic Settings
- **Name**: `online-church-meeting` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty)

### 2. Build Settings
- **Runtime**: `Python 3`

- **Build Command**:
  ```
  pip install -r requirements.txt
  ```

- **Start Command** (⚠️ REQUIRED):
  ```
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### 3. Instance Type
- **Plan**: `Free`

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### Step 1: Go to Render
1. Visit: https://render.com
2. Sign up or log in (use GitHub for easy connection)

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if needed
3. Find repository: **"onlinezoommeeting"**
4. Click **"Connect"**

### Step 3: Configure (IMPORTANT!)
Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Name** | `online-church-meeting` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | (empty) |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. You'll see "Live" when ready
4. Click the URL to open your app!

---

## ✅ VERIFICATION

After deployment, test:
- ✅ App loads at your Render URL
- ✅ Can create a meeting
- ✅ Can join a meeting
- ✅ Video/audio works
- ✅ Chat works
- ✅ Reactions work

---

## 🔧 TROUBLESHOOTING

### Error: "Start command is required"
**Solution**: Make sure you entered the Start Command:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Error: "Build failed"
**Solution**: 
1. Check build logs in Render dashboard
2. Verify Build Command is: `pip install -r requirements.txt`
3. Try manual redeploy

### Error: "Application failed to start"
**Solution**:
1. Check logs in Render dashboard
2. Verify Start Command is correct
3. Make sure `main.py` exists in repository

### App is slow on first load
**Solution**: 
- This is normal on free tier (sleeps after 15 min)
- First load takes 30-60 seconds
- Subsequent loads are fast
- Upgrade to paid tier ($7/month) for always-on

---

## 📱 YOUR APP URL

After deployment, your app will be at:
```
https://online-church-meeting.onrender.com
```
(or whatever name you chose)

---

## 🔄 UPDATING YOUR APP

To make changes:
1. Edit files locally
2. Test locally: `python -m uvicorn main:app --reload`
3. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. Render will auto-deploy (2-5 minutes)

---

## 📞 NEED HELP?

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Check Logs**: Click "Logs" tab in Render dashboard
- **GitHub Repo**: https://github.com/AkashMaurya/onlinezoommeeting

---

## 🎉 THAT'S IT!

Your app will be live in 10-15 minutes!

**Remember**: The Start Command is **REQUIRED**:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Good luck! 🚀

