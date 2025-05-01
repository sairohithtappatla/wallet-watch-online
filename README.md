
# Wallet Watch Online

## Project info

**URL**: https://lovable.dev/projects/ee0e4fdc-be3d-4a91-817f-81cb0fd9618a

## How to run this project locally

Follow these steps to run the project on your local machine:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Update the browserslist database
npx update-browserslist-db@latest

# Step 5: Start the development server
npm run dev
```

## How to build for mobile platforms

This project is configured with Capacitor to create native mobile applications. Follow these steps:

### Prerequisites
- For iOS: A Mac with Xcode installed
- For Android: Android Studio with Android SDK

### Build Steps

```sh
# 1. Build the project first
npm run build

# 2. Sync the built web assets with the native projects
npx cap sync

# 3. Open the native IDE to build and run
# For Android:
npx cap open android

# For iOS:
npx cap open ios
```

### Building for Production

#### Android
1. Open the project in Android Studio
2. Go to Build > Generate Signed Bundle/APK
3. Follow the wizard to create a signed APK or App Bundle
4. The generated file can be uploaded to Google Play Store

#### iOS
1. Open the project in Xcode
2. Configure your signing certificates and provisioning profiles
3. Select Product > Archive
4. Use the Organizer to upload to App Store Connect

## How to create a Chrome Extension

To convert this app into a Chrome extension:

1. Create a `manifest.json` file in the public folder:
```json
{
  "name": "Wallet Watch Online",
  "version": "1.0.0",
  "manifest_version": 3,
  "description": "Track your finances and expenses with this wallet management application",
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icon-192.png",
      "48": "icon-192.png",
      "128": "icon-512.png"
    }
  },
  "icons": {
    "16": "icon-192.png",
    "48": "icon-192.png",
    "128": "icon-512.png"
  },
  "permissions": ["storage"]
}
```

2. Build your application:
```sh
npm run build
```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select your `dist` directory
6. Your extension should now be loaded in Chrome

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for mobile apps)
- Supabase (for backend)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ee0e4fdc-be3d-4a91-817f-81cb0fd9618a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
