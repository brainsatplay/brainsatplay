# brainsatplay-mobile
 Development environment for mobile apps using Capacitor.

## Installation
 Install project dependencies by running `npm install` in the root directory.

### Android
1. Install Android Studio
2. Create a new project in Android Studio
    - `npm run init:android` (will run `npx cap add android`, `npx cap copy`)
3. Open the project in Android Studio
    - `npm run android` (will run `npx cap open android`)

If you do not have our AndroidManifest.xml in `android/app/src/main`, ensure these permissions are available, placed under the <!-- Permissions --> tag in the file created by capacitor:
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"  />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"  />
<uses-permission
    android:name="android.permission.BLUETOOTH"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_ADMIN"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_SCAN"
    tools:targetApi="s"
/>
<uses-permission
    android:name="android.permission.BLUETOOTH_CONNECT"
    tools:targetApi="s"
/>

<uses-permission android:name="android.permission.INTERNET" />
```

The first run will likely need to install all of the tools in the android project necessary. Build the android project in Android Studio after running these commands by clicking the Make Project hammer icon if it doesn't start automatically. Then if you see BUILD SUCCESSFUL, run with your android device connected or the built-in android emulators active.

### IOS 
1. Install XCode
2. Install cocoapods (if required)
3. Create a new project in XCode
    - `npm run init:ios` (will run `npx cap add ios`, `npx cap copy`)
4. Open the project in XCode
    - `npm run ios` (will run `npx cap open ios`)
