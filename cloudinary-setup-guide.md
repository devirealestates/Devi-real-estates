
# Cloudinary Setup Guide - ACTIVE CONFIGURATION

## ✅ Current Cloudinary Configuration

The platform is configured with the following Cloudinary settings:
- **Cloud Name**: `drr2mblir`
- **Upload Preset**: `devirealestates`

## 🔧 Current Configuration Status

### Active Settings
All image and video upload components are configured with:
```javascript
const CLOUDINARY_CLOUD_NAME = 'drr2mblir';
const CLOUDINARY_UPLOAD_PRESET = 'devirealestates';
```

### Upload Endpoints
- **Images**: `https://api.cloudinary.com/v1_1/drr2mblir/image/upload`
- **Videos**: `https://api.cloudinary.com/v1_1/drr2mblir/video/upload`

## ⚠️ IMPORTANT: Verify Upload Preset Configuration

To ensure uploads work correctly, verify your Cloudinary upload preset settings:

### Step 1: Check Upload Preset in Cloudinary Dashboard
1. Log into your Cloudinary dashboard at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings** > **Upload**
3. Find the preset named **`devirealestates`**
4. Ensure the following settings:
   - **Signing Mode**: `Unsigned` (crucial for frontend uploads)
   - **Resource Type**: `Image`
   - **Allowed Formats**: `jpg,png,jpeg,webp,gif`
   - **Max File Size**: `10MB` or higher
   - **Folder**: `real_estate` (optional, for organization)

### Step 2: Test Upload Functionality
1. Go to your Admin Dashboard
2. Try adding a new property or team member
3. Upload an image using the image uploader
4. Verify the image appears in the preview
5. Check your Cloudinary dashboard to confirm the image was uploaded

## 🚨 Troubleshooting Common Issues

**Problem: "Cloudinary authentication failed" error**
- Solution: Verify the upload preset `devirealestates` exists and is set to "Unsigned"

**Problem: "Invalid upload request" error**
- Solution: Check that your upload preset allows the file format you're trying to upload
- Ensure file size is under the preset's maximum limit

**Problem: Images not appearing after upload**
- Solution: Check browser console for detailed error messages
- Verify the secure_url returned from Cloudinary is valid

## 📋 Quick Verification Checklist
- [ ] Cloud name `drr2mblir` is active in the code
- [ ] Upload preset `devirealestates` exists in your Cloudinary dashboard
- [ ] Upload preset is set to "Unsigned"
- [ ] Test upload shows success message
- [ ] Image/video appears in browser preview
- [ ] Media appears in Cloudinary dashboard under `real_estate` folder
- [ ] No console errors during upload

## 🎯 Active Components
- ✅ ImageUploader component uses `drr2mblir` cloud name
- ✅ VideoUploader component uses `drr2mblir` cloud name
- ✅ Upload preset: `devirealestates`
- ✅ All upload endpoints configured correctly
- ✅ Error handling maintained for configuration issues
- ✅ Preview and storage functionality preserved

## 💡 Benefits of Current Setup
- **Reliable hosting**: Images stored on Cloudinary's global CDN
- **Automatic optimization**: Images optimized for web delivery
- **Scalable storage**: No file size limitations in your main database
- **Fast loading**: Images served from nearest CDN location
- **Backup & security**: Images safely stored in the cloud

**🚀 Your platform is now ready to use the updated Cloudinary configuration!**
