export default {
  expo: {
    name: 'AmiraTracker',
    displayName: 'Amira Tracker',
    slug: 'amira-tracker',
    version: '1.0.0',
    sdkVersion: '51.0.0',
    platforms: ['ios', 'android'],
    icon: './assets/Logo.jpg',
    splash: {
      image: './assets/Logo.jpg',
      resizeMode: 'cover',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/a8853df3-b419-4c52-834e-c940cd689233',
    },
    runtimeVersion: '1.0.0',
    ios: {
      supportsTablet: false,
      infoPlist: {
        UIBackgroundModes: ['fetch'],
        MinimumOSVersion: "8.0",
        deploymentTarget: "15.0",
      },
      bundleIdentifier: 'com.sensetech.amiratracker',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/Logo.jpg',
        backgroundColor: '#ffffff',
      },
      package: 'com.sensetech.amiratracker',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'a8853df3-b419-4c52-834e-c940cd689233',
      },
    },
  },
};
