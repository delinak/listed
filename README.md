# Listed Mobile App - iOS Setup

## Prerequisites
- Mac computer with macOS
- Xcode installed from Mac App Store
- Node.js installed

## Running in iOS Simulator

1. **Install dependencies:**
   ```bash
   cd listed-mobile
   npm install
   ```

2. **Update API endpoint:**
   - Open `src/services/api.ts`
   - Change `API_BASE_URL` to your backend URL:
     ```typescript
     const API_BASE_URL = 'http://localhost:5000/api'; // For local testing
     // or
     const API_BASE_URL = 'https://your-app.replit.app/api'; // For production
     ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Open in iOS Simulator:**
   - Press `i` in the terminal to open iOS simulator
   - Or scan the QR code with Expo Go app on your iPhone

## Features
- Tag-based list organization matching your web app
- Create, edit, and delete lists and items
- Mark items as complete/incomplete
- User preferences and dark/light theme
- Offline-ready with React Query caching

## Next Steps
- Test all functionality in simulator
- Build for TestFlight (requires Apple Developer account)
- Submit to App Store (requires Apple review)

## **Step 2: Set Up EAS Build for iOS**

### **A. Install EAS CLI (if you haven't already)**
In your project directory, run:
```sh
npm install -g eas-cli
```

### **B. Log in to Expo**
If you're not already logged in:
```sh
npx expo login
```

### **C. Configure EAS Build**
Run:
```sh
npx eas build:configure
```
- This will set up your project for EAS Build and create an `eas.json` file.

### **D. Build the iOS App**
To start a production build for iOS, run:
```sh
npx eas build -p ios --profile production
```
- You'll be prompted to log in to your Apple Developer account and set up credentials if you haven't already.
- EAS will handle provisioning profiles, certificates, etc.

### **E. Wait for the Build to Finish**
- You'll get a link to the build dashboard.
- Once the build is complete, you can download the `.ipa` file.