export default {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    ok: 'OK',
    search: 'Search',
    back: 'Back',
    view: 'View',
    confirm: 'Confirm',
    reset: 'Reset',
    apply: 'Apply',
    retry: 'Retry',
    close: 'Close',
    selectLanguage: 'Select Language'
  },
  navigation: {
    home: 'Home',
    materials: 'Materials',
    downloads: 'Downloads',
    chat: 'Chat',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    createChatSubject: 'New Discussion',
    materialDetail: 'Material Details',
    changePassword: 'Change Password'
  },
  materials: {
    title: 'Materials',
    findMaterials: 'Find Materials',
    all: 'All',
    find: 'Find',
    search: {
      placeholder: 'Search materials...',
      noResults: 'No materials found',
      error: 'Error searching materials'
    },
    filters: {
      section: 'Section',
      level: 'Level',
      category: 'Category',
      subject: 'Subject'
    },
    hierarchy: {
      section: 'Section',
      level: 'Level',
      category: 'Category',
      subject: 'Subject',
      materials: 'Materials',
      selectSection: 'Select a Section',
      selectLevel: 'Select a Level',
      selectCategory: 'Select a Category',
      selectSubject: 'Select a Subject',
      back: 'Back to {{level}}'
    },
    status: {
      free: 'Free',
      paid: 'Paid',
      downloaded: 'Downloaded',
      downloading: 'Downloading...'
    },
    sort: {
      title: 'Sort by',
      newest: 'Most Recent',
      oldest: 'Oldest',
      nameAZ: 'Name A-Z',
      nameZA: 'Name Z-A',
      priceHighLow: 'Price high to low',
      priceLowHigh: 'Price low to high'
    },
    errors: {
      loadFailed: 'Failed to load materials',
      downloadFailed: 'Failed to download material',
      tryAgain: 'Please try again'
    },
    empty: {
      title: 'No Materials Found',
      description: 'There are no materials available in this section yet',
      action: 'Refresh'
    },
    details: {
      size: 'Size',
      created: 'Created',
      modified: 'Modified',
      price: 'Price',
      download: 'Download',
      preview: 'Preview'
    },
    loading: 'Loading materials...',
    noResults: 'No materials found',
    refresh: 'Pull to refresh'
  },
  downloadsScreen: {
    title: 'Downloads',
    search: {
      placeholder: 'Search downloads...'
    },
    filters: {
      startDate: 'Start Date',
      endDate: 'End Date',
      clear: 'Clear Filters',
      apply: 'Apply Filters'
    },
    dates: {
      notSelected: 'Not Selected'
    },
    empty: {
      title: 'No Downloads',
      description: 'You haven\'t downloaded any materials yet'
    },
    sort: {
      title: 'Sort by',
      newest: 'Most Recent',
      oldest: 'Oldest',
      nameAZ: 'Name A-Z',
      nameZA: 'Name Z-A',
      sizeHighLow: 'Size High to Low',
      sizeLowHigh: 'Size Low to High'
    }
  },
  settings: {
    title: 'Settings',
    app: {
      title: 'App Settings'
    },
    preferences: {
      title: 'Preferences'
    },
    notifications: {
      title: 'Notifications',
      push: {
        title: 'Push Notifications',
        enabled: 'Enable Push Notifications',
        disabled: 'Push Notifications are Disabled'
      },
      emailNotifications: 'Email Notifications',
      sound: 'Sound',
      vibrate: 'Vibration',
      newMaterial: 'New Material Notifications',
      newChat: 'New Chat Notifications'
    },
    sections: {
      help: {
        helpCenter: 'Help Center',
        helpCenterDescription: 'Get help and support for using the app'
      }
    },
    language: {
      title: 'Language',
      selectLanguage: 'Select Language',
      current: 'Current Language',
      options: {
        en: 'English',
        fr: 'French'
      }
    },
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System Default',
      auto: 'Auto (follow system)'
    },
    account: {
      title: 'Account',
      profile: 'Profile',
      email: 'Email',
      password: 'Password',
      changePassword: 'Change Password',
      signOut: 'Sign Out',
      deleteAccount: 'Delete Account',
      confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.'
    },
    data: {
      title: 'Data & Storage',
      clearCache: 'Clear Cache',
      downloadedContent: 'Downloaded Content',
      storageUsed: 'Storage Used',
      autoDownload: 'Auto-download on Wi-Fi'
    }
  },
  helpCenter: {
    header: {
      title: 'Help Center',
      subtitle: 'How can we help you today?'
    },
    search: {
      placeholder: 'Search for help articles...'
    },
    sections: {
      gettingStarted: {
        title: 'Getting Started',
        items: [
          {
            title: 'Welcome to PASS',
            content: 'Learn about the PASS app and how it can help you access educational materials.'
          },
          {
            title: 'Creating Your Account',
            content: 'Step-by-step guide to creating and setting up your PASS account.'
          },
          {
            title: 'Navigating the App',
            content: 'Learn how to navigate through different sections of the app.'
          },
          {
            title: 'Understanding Material Types',
            content: 'Overview of different types of materials available in PASS.'
          }
        ]
      },
      materials: {
        title: 'Materials',
        items: [
          {
            title: 'Browsing Materials',
            content: 'Learn how to browse and find materials by subject, level, or category.'
          },
          {
            title: 'Downloading Materials',
            content: 'Instructions for downloading materials for offline access.'
          },
          {
            title: 'Managing Downloads',
            content: 'How to manage your downloaded materials and storage space.'
          }
        ]
      },
      downloads: {
        title: 'Downloads',
        items: [
          {
            title: 'Download Settings',
            content: 'Configure your download preferences and storage options.'
          },
          {
            title: 'Offline Access',
            content: 'Learn how to access your downloaded materials without internet.'
          },
          {
            title: 'Managing Storage',
            content: 'Tips for managing storage space and clearing cached data.'
          }
        ]
      },
      payments: {
        title: 'Payments',
        items: [
          {
            title: 'Payment Methods',
            content: 'Learn about supported payment methods and how to add them.'
          },
          {
            title: 'Making Purchases',
            content: 'Step-by-step guide to purchasing premium materials.'
          },
          {
            title: 'Billing History',
            content: 'How to view and manage your purchase history.'
          }
        ]
      }
    }
  },
  auth: {
    login: 'Login',
    register: 'Register',
    signOut: 'Sign Out'
  },
  chat: {
    title: 'Chat',
    typeMessage: 'Type a message...',
    send: 'Send',
    fetchError: 'Failed to load messages',
    sendError: 'Failed to send message',
    noSubjects: 'No subjects available',
    noSearchResults: 'No subjects found',
    unknownUser: 'Unknown User',
    createChat: 'Create Chat',
    joinChat: 'Join Chat',
    leaveChat: 'Leave Chat',
    createSubject: 'Create Subject',
    searchPlaceholder: 'Search subjects...',
    noMessages: 'No messages yet',
    retry: 'Retry',
  },
  home: {
    welcome: 'Welcome back',
    subtitle: 'What would you like to do today?',
    quickAccess: 'Quick Access',
    seeAll: 'See All',
    features: {
      browseMaterials: 'Browse Materials',
      myDownloads: 'My Downloads',
      searchMaterials: 'Search Materials',
      myProfile: 'My Profile'
    },
    recentMaterials: 'Recent Materials',
    popularMaterials: 'Popular Materials',
    viewAll: 'View All',
    categories: 'Categories',
    downloadedMaterials: 'Downloaded Materials',
    notifications: {
      title: 'Notifications',
      empty: 'No new notifications',
      viewAll: 'View All'
    },
    quickActions: {
      title: 'Quick Actions',
      download: 'Download',
      share: 'Share',
      favorite: 'Favorite'
    },
    stats: {
      downloads: 'Downloads',
      materials: 'Materials',
      subjects: 'Subjects'
    }
  }
};