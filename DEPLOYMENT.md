# Deployment Guide - Render

This guide provides step-by-step instructions for deploying the Video Meeting Platform to Render's free tier.

## Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- Git installed locally
- Tested application locally (see TESTING.md)

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd meeting
git init
```

### 1.2 Create .gitignore

The `.gitignore` file is already created. Verify it contains:

```
__pycache__/
*.py[cod]
venv/
*.db
*.sqlite
.env
```

### 1.3 Commit Your Code

```bash
git add .
git commit -m "Initial commit - Video Meeting Platform"
```

### 1.4 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `video-meeting-platform` (or your choice)
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### 1.5 Push to GitHub

```bash
# Replace with your GitHub username and repository name
git remote add origin https://github.com/YOUR_USERNAME/video-meeting-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

### 2.1 Sign Up / Log In to Render

1. Go to [render.com](https://render.com)
2. Sign up or log in (you can use GitHub to sign in)

### 2.2 Create a New Web Service

1. Click "New +" button in the top right
2. Select "Web Service"

### 2.3 Connect Your Repository

1. Click "Connect account" if you haven't connected GitHub
2. Authorize Render to access your GitHub repositories
3. Find and select your `video-meeting-platform` repository
4. Click "Connect"

### 2.4 Configure the Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `video-meeting-platform` (or your choice)
  - This will be part of your URL: `https://video-meeting-platform.onrender.com`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`

**Build Settings:**
- **Build Command**: 
  ```
  pip install -r requirements.txt
  ```

**Start Command**:
  ```
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

**Plan:**
- Select **Free** (or paid plan for better performance)

### 2.5 Environment Variables (Optional)

Click "Advanced" and add environment variables if needed:

- `PYTHON_VERSION`: `3.11.0` (optional, Render auto-detects)
- `PORT`: Automatically set by Render (don't add manually)

### 2.6 Deploy

1. Click "Create Web Service"
2. Render will start building and deploying your application
3. Wait for the deployment to complete (usually 2-5 minutes)

### 2.7 Monitor Deployment

Watch the logs in real-time:
- You'll see pip installing dependencies
- Uvicorn starting the server
- "Application startup complete" message

## Step 3: Verify Deployment

### 3.1 Check Service Status

1. Once deployed, you'll see "Live" status with a green indicator
2. Your app URL will be: `https://your-service-name.onrender.com`

### 3.2 Test the Application

1. Click the URL to open your application
2. Test creating a meeting
3. Test joining from multiple devices/browsers
4. Verify WebSocket connections work (check browser console)

### 3.3 Test API Endpoints

```bash
# Replace with your Render URL
curl https://your-service-name.onrender.com/api/health

curl https://your-service-name.onrender.com/api/create_meeting
```

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Render dashboard, go to your service
2. Click "Settings" tab
3. Scroll to "Custom Domain"
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `meet.yourdomain.com`)

### 4.2 Update DNS

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add a CNAME record:
   - **Name**: `meet` (or your subdomain)
   - **Value**: `your-service-name.onrender.com`
   - **TTL**: 3600 (or default)

3. Wait for DNS propagation (can take up to 48 hours, usually faster)

### 4.3 Enable HTTPS

Render automatically provides free SSL certificates via Let's Encrypt.
HTTPS will be enabled automatically once your custom domain is verified.

## Step 5: Post-Deployment Configuration

### 5.1 Update Share Links

The application automatically uses the current domain for share links.
No configuration needed!

### 5.2 Monitor Performance

1. Go to Render dashboard
2. Click on your service
3. View metrics:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### 5.3 View Logs

1. Click "Logs" tab in Render dashboard
2. Monitor for errors or issues
3. Use logs to debug problems

## Step 6: Scaling and Optimization

### 6.1 Free Tier Limitations

Render's free tier has limitations:
- **Sleep after inactivity**: Service sleeps after 15 minutes of no requests
- **Cold start**: First request after sleep takes 30-60 seconds
- **Resources**: 512 MB RAM, shared CPU
- **Bandwidth**: Limited

### 6.2 Upgrade to Paid Plan

For production use, consider upgrading:

**Starter Plan ($7/month):**
- No sleep
- 512 MB RAM
- Better performance
- More bandwidth

**Standard Plan ($25/month):**
- 2 GB RAM
- Dedicated CPU
- Auto-scaling
- Priority support

### 6.3 Optimize for Free Tier

If staying on free tier:

1. **Keep Service Awake:**
   - Use a service like [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes
   - Add a health check endpoint (already included: `/api/health`)

2. **Reduce Resource Usage:**
   - Limit concurrent connections
   - Optimize database queries
   - Use efficient WebRTC settings

3. **Database Optimization:**
   - SQLite works fine for free tier
   - For production, consider PostgreSQL (Render offers free tier)

## Step 7: Continuous Deployment

### 7.1 Auto-Deploy on Push

Render automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main
```

Render will automatically:
1. Detect the push
2. Build the new version
3. Deploy it
4. Zero-downtime deployment

### 7.2 Manual Deploy

To manually trigger a deployment:
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

### 7.3 Rollback

If something goes wrong:
1. Go to "Events" tab
2. Find a previous successful deployment
3. Click "Rollback to this version"

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Notifications

1. Go to service settings
2. Add notification email
3. Get alerts for:
   - Deployment failures
   - Service crashes
   - High resource usage

### 8.2 Regular Maintenance

- **Weekly**: Check logs for errors
- **Monthly**: Review performance metrics
- **Quarterly**: Update dependencies

### 8.3 Update Dependencies

```bash
# Update requirements.txt
pip install --upgrade fastapi uvicorn websockets

# Test locally first
uvicorn main:app --reload

# Commit and push
git add requirements.txt
git commit -m "Update dependencies"
git push origin main
```

## Troubleshooting

### Issue: Deployment Failed

**Check:**
1. Build logs in Render dashboard
2. Verify `requirements.txt` is correct
3. Ensure `Procfile` is in root directory
4. Check Python version compatibility

**Solution:**
```bash
# Test build locally
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Issue: Service Keeps Crashing

**Check:**
1. Logs for error messages
2. Memory usage (may exceed 512 MB)
3. Database connection issues

**Solution:**
- Reduce concurrent connections
- Optimize code
- Upgrade to paid plan

### Issue: WebSocket Not Working

**Check:**
1. Browser console for errors
2. Ensure using `wss://` (not `ws://`)
3. Check CORS settings

**Solution:**
The app automatically uses correct protocol based on page URL.

### Issue: Slow Performance

**Causes:**
- Free tier limitations
- Service was sleeping (cold start)
- Too many concurrent users

**Solutions:**
- Upgrade to paid plan
- Use UptimeRobot to prevent sleep
- Optimize WebRTC connections

### Issue: Database Not Persisting

**Note:** Render's free tier uses ephemeral storage.
Database resets on each deployment.

**Solution:**
For production, use Render's PostgreSQL:
1. Create PostgreSQL database (free tier available)
2. Update `database.py` to use PostgreSQL
3. Add database URL to environment variables

## Alternative Deployment Options

If Render doesn't meet your needs:

### Heroku
- Similar to Render
- Free tier available (with limitations)
- Good documentation

### Railway
- Modern platform
- Free tier with $5 credit
- Easy deployment

### DigitalOcean App Platform
- $5/month minimum
- Better performance
- More control

### Self-Hosted
- VPS (DigitalOcean, Linode, AWS EC2)
- Full control
- Requires more setup

## Security Considerations

### For Production Deployment:

1. **Add Authentication:**
   - Implement user login
   - Use JWT tokens
   - Add meeting passwords

2. **Rate Limiting:**
   - Prevent abuse
   - Limit API calls per IP

3. **HTTPS Only:**
   - Render provides this automatically
   - Redirect HTTP to HTTPS

4. **Environment Variables:**
   - Store secrets securely
   - Don't commit `.env` files

5. **Database Security:**
   - Use PostgreSQL for production
   - Enable SSL connections
   - Regular backups

## Cost Estimation

### Free Tier (Render)
- **Cost**: $0/month
- **Limitations**: Sleep after inactivity, 512 MB RAM
- **Best for**: Testing, small groups, demos

### Starter Plan
- **Cost**: $7/month
- **Benefits**: No sleep, better performance
- **Best for**: Small teams (5-20 users)

### Standard Plan
- **Cost**: $25/month
- **Benefits**: 2 GB RAM, auto-scaling
- **Best for**: Medium teams (20-50 users)

### For 100 Users
- **Recommended**: Standard or Pro plan
- **Estimated cost**: $25-85/month
- **Additional**: May need TURN server ($10-50/month)

## Next Steps

After successful deployment:

1. ✅ Test thoroughly with real users
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Add authentication for production
5. ✅ Implement additional features
6. ✅ Gather user feedback
7. ✅ Optimize based on usage patterns

## Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **WebRTC Resources**: [webrtc.org](https://webrtc.org)

## Conclusion

Your video meeting platform is now deployed and accessible worldwide!

Share your URL: `https://your-service-name.onrender.com`

Happy video conferencing! 🎥

