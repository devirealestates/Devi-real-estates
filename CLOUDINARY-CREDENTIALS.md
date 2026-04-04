# 📸 Cloudinary Configuration - Devi Real Estates

## ✅ Active Configuration

Your project uses the following Cloudinary account:

```javascript
Cloud Name: drr2mblir
Upload Preset: devirealestates
```

**Used in:**
- `src/components/ImageUploader.tsx` (Property images)
- `src/components/VideoUploader.tsx` (Property videos)

**Upload Endpoints:**
```
Images: https://api.cloudinary.com/v1_1/drr2mblir/image/upload
Videos: https://api.cloudinary.com/v1_1/drr2mblir/video/upload
```

---

## ⚙️ Configuration Files

1. **`src/components/ImageUploader.tsx`** (lines 28-29)
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'drr2mblir';
   const CLOUDINARY_UPLOAD_PRESET = 'devirealestates';
   ```

2. **`src/components/VideoUploader.tsx`** (lines 27-28)
   ```javascript
   const CLOUDINARY_CLOUD_NAME = 'drr2mblir';
   const CLOUDINARY_UPLOAD_PRESET = 'devirealestates';
   ```

## 📋 Required Cloudinary Settings

For the upload preset to work properly, ensure these settings in your Cloudinary Dashboard:

### Go to: [Cloudinary Dashboard](https://cloudinary.com/console) → Settings → Upload

**Upload Preset: `devirealestates`**
- ⚠️ **Signing Mode**: **UNSIGNED** (Critical for frontend uploads)
- **Resource Type**: Auto
- **Allowed Formats**: `jpg, png, jpeg, webp, gif, heic, heif, mp4, webm, mov`
- **Max File Size**: 10 MB or higher
- **Folder**: `real_estate` (optional, for organization)

## 🧪 Test Your Configuration

1. Go to Admin Dashboard
2. Try adding a property with an image
3. Check browser console for upload status
4. Verify image appears in Cloudinary dashboard

## 🚨 Common Issues & Solutions

**Issue 1: "Upload preset not found"**
- Solution: Create the preset `devirealestates` in Cloudinary Dashboard
- Make sure it's set to **Unsigned**

**Issue 2: "Authentication failed"**
- Solution: Verify cloud name `drr2mblir` is correct
- Check upload preset exists and is unsigned

**Issue 3: "Invalid file format"**
- Solution: Ensure file type is in allowed formats list
- Add HEIC/HEIF support for iPhone photos

## 📍 Where to Find Your Cloudinary Details

1. Login to [Cloudinary Console](https://console.cloudinary.com/)
2. **Dashboard** → Your cloud name is at the top
3. **Settings** → **Upload** → Find your upload presets
4. **Settings** → **Security** → API keys (not needed for unsigned uploads)

## 🔄 Current Upload Flow

```
User uploads media (image/video)
     ↓
ImageUploader.tsx / VideoUploader.tsx
     ↓
Cloudinary API (drr2mblir)
     ↓
Returns secure_url
     ↓
Saved to Firebase Firestore
     ↓
Displayed on website via CDN
```

## 💾 Storage Details

- **Media Location**: Cloudinary cloud storage (drr2mblir)
- **URLs Stored In**: Firebase Firestore (properties collection)
- **Folder Structure**: `/real_estate/` in Cloudinary
- **CDN Delivery**: Automatic via Cloudinary global CDN

---

## ✅ Summary

**Current Configuration (Active):**
- Cloud Name: `drr2mblir`
- Upload Preset: `devirealestates`
- Status: ✅ **Configured and Ready**

All components are using this single, consistent configuration.
