# Brains@Play: Universal Web Development Made Simple
This repository is a **template repo** for creating a [Tauri] app with [Capacitor] for mobile support. It contains an example app using [graphscript] to create apps with a simple, declarative syntax and package them using this template repo!

## The Brains@Play App
This is an example app using [graphscript] to create apps with a simple, declarative syntax and package them using this template repo!

> **Note:** This app is a work in progress and is not yet ready for production use.

## Contributing
### Repo Structure
- `frontend` - The frontend code for the app
- `backend` - The backend code for the app
    - `cli` - The brainsatplay CLI (WIP)
- `src-tauri` - The [Tauri] source files
- `capacitor.config.js` - The [Capacitor] configuration file

### Building
#### Desktop (Windows / Mac / Linux)
Ensure that the [Tauri] CLI is installed by running `npm i`.

You must also ensure that both [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section) (if below Windows 10 / 11), and [Rust](https://www.rust-lang.org/tools/install).

After this, you can run `npm run tauri dev` to run the app in development mode. This will open a window with the app running in it. 

You can also run `npm run tauri build` to build the app for your current platform.

#### Mobile (Android / IOS)
Ensure that [Capacitor] is installed by running `npm i`.

##### Android
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

##### IOS 
1. Install XCode
2. Install cocoapods (if required)
3. Create a new project in XCode
    - `npm run init:ios` (will run `npx cap add ios`, `npx cap copy`)
4. Open the project in XCode
    - `npm run ios` (will run `npx cap open ios`)


[Capacitor]: https://capacitorjs.com/
[Tauri]: https://tauri.app/
[Tauri]: https://github.com/brainsatplay/graphscript
