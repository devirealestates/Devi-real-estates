# How to Remove Duplicate Cities

## Issue
You have duplicate cities in Firebase (e.g., two "Hyderabad" entries).

## Solution: Remove Duplicates via Admin Dashboard

### Method 1: Manual Deletion (Recommended)
1. Go to your Admin Dashboard
2. Click on "Popular Cities" tab in sidebar
3. You'll see all cities with their images and order numbers
4. Find the duplicate entries (e.g., both Hyderabad cards)
5. Click the **trash icon** on the duplicate you want to remove
6. Confirm the deletion

### Method 2: Firebase Console (Advanced)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Navigate to the `cities` collection
5. Find the duplicate document
6. Click the three dots (...) and select "Delete document"

## Prevention
The system now automatically counts listings based on property locations, so:
- Only add each city **once**
- Make sure the city name **matches exactly** with the location field in your properties
- Example: If properties use "Hyderabad", add city as "Hyderabad" (case-insensitive match)

## After Cleanup
Once you remove duplicates:
1. Refresh your homepage
2. The listing counts will show automatically based on properties
3. Format will be: "100 Listings" (with the word "Listings" added automatically)

## Important Notes
- City names are matched case-insensitively with property locations
- If a city has 0 properties, it will show "0 Listings"
- Add properties with the correct location field for counts to update
