# 🚀 RadiantArena Deployment Guide for Render

This guide will help you deploy the RadiantArena Token Pre Sale Wallet Checker on Render.

## 📋 Prerequisites

- A Render account (free tier available)
- Your project files ready for deployment

## 🛠️ Deployment Steps

### 1. Prepare Your Files

Make sure you have all these files in your project directory:
- `server.js` - Main server file
- `package.json` - Dependencies and scripts
- `index.html` - Frontend interface
- `script.js` - Frontend logic
- `styles.css` - Styling
- `README.md` - Documentation

### 2. Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository** (or use "Deploy from existing repository")
4. **Configure the service:**
   - **Name**: `radiantarena-token-presale` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)

### 3. Environment Variables (Optional)

If you need to customize the port or add environment variables:
- Go to your service settings
- Add environment variables if needed
- The app will automatically use `process.env.PORT` or default to 3000

### 4. Deploy

1. **Click "Create Web Service"**
2. **Wait for the build to complete** (usually 2-3 minutes)
3. **Your app will be live** at `https://your-app-name.onrender.com`

## 🔧 Configuration Details

### Package.json
- **Start Script**: `node server.js`
- **Node Version**: `>=18.0.0`
- **Dependencies**: `express` and `cors`

### Server Configuration
- **Port**: Automatically uses `process.env.PORT` (Render provides this)
- **CORS**: Configured for all origins
- **Static Files**: Served from root directory
- **Health Check**: Available at `/health`

## 📊 Monitoring

### Health Check
- **Endpoint**: `https://your-app-name.onrender.com/health`
- **Response**: `{"status":"OK","message":"RadiantArena Server is running"}`

### Logs
- View logs in the Render dashboard
- Monitor for any errors or issues
- Check build logs for deployment problems

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all files are in the repository
   - Verify `package.json` is valid
   - Ensure Node.js version is compatible

2. **App Not Starting**
   - Check the start command in Render settings
   - Verify `server.js` is the main file
   - Check logs for specific error messages

3. **CORS Issues**
   - The app is configured to allow all origins
   - If issues persist, check browser console for errors

4. **Port Issues**
   - Render automatically provides `process.env.PORT`
   - The app will use this automatically

### Debug Steps

1. **Check Build Logs**
   - Go to your service in Render dashboard
   - Click on "Logs" tab
   - Look for any error messages

2. **Test Health Endpoint**
   - Visit `https://your-app-name.onrender.com/health`
   - Should return JSON response

3. **Check Dependencies**
   - Ensure `express` and `cors` are in `package.json`
   - Verify Node.js version compatibility

## 📁 File Structure

```
radiantarena-token-presale/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── index.html         # Frontend interface
├── script.js          # Frontend logic
├── styles.css         # Styling
├── README.md          # Documentation
├── DEPLOYMENT.md      # This file
└── submissions.csv    # Generated automatically
```

## 🎯 Success Indicators

When deployment is successful, you should see:
- ✅ Build completed successfully
- ✅ Service is running (green status)
- ✅ Health endpoint returns OK
- ✅ Main app loads without errors
- ✅ MetaMask connection works
- ✅ Eligibility checking works
- ✅ $SUI address submission works

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render logs for specific errors
3. Verify all files are properly uploaded
4. Test locally first with `node server.js` 