export type Language = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

export interface TranslationSchema {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    back: string;
    close: string;
    search: string;
    searchPlaceholder: string;
    filter: string;
    all: string;
    actions: string;
    status: string;
    date: string;
    total: string;
    view: string;
    loading: string;
    noData: string;
    retry: string;
    submit: string;
    logout: string;
    settings: string;
    profile: string;
    liveNetwork: string;
    viewAll: string;
    refresh: string;
    rupee: string;
  };
  nav: {
    farmer: {
      dashboard: string;
      products: string;
      orders: string;
      inventory: string;
      earnings: string;
      analytics: string;
      profile: string;
      settings: string;
      logout: string;
    };
    buyer: {
      dashboard: string;
      browse: string;
      search: string;
      cart: string;
      orders: string;
      favorites: string;
      profile: string;
      settings: string;
      logout: string;
    };
    admin: {
      dashboard: string;
      users: string;
      farmers: string;
      products: string;
      orders: string;
      categories: string;
      reports: string;
      settings: string;
      logout: string;
    };
    public: {
      home: string;
      market: string;
      farmers: string;
      howItWorks: string;
      about: string;
      login: string;
      register: string;
      getStarted: string;
    };
  };
  farmer: {
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    activeListings: string;
    pendingOrders: string;
    monthOrders: string;
    monthEarnings: string;
    verificationPending: string;
    completeProfileToVerify: string;
    verifyNotice: string;
    lowStockNotice: string;
    recentOrders: string;
    quickActions: string;
    addProduct: string;
    viewAllOrders: string;
    inventoryAlert: string;
    buyerName: string;
    orderId: string;
    itemsCount: string;
  };
  buyer: {
    welcomeBack: string;
    quickActions: string;
    browseProduce: string;
    activeOrders: string;
    recentFavorites: string;
    noActiveOrders: string;
    noFavorites: string;
    exploreMarketCTA: string;
    items: string;
    subtotal: string;
    deliveryFee: string;
    totalAmount: string;
    deliveryAddress: string;
    placeOrder: string;
    cartEmpty: string;
  };
  admin: {
    adminDashboard: string;
    totalUsers: string;
    totalFarmers: string;
    activeProducts: string;
    totalOrders: string;
    pendingVerifications: string;
    recentOrders: string;
    verify: string;
    reject: string;
    systemStatus: string;
  };
  status: {
    pending: string;
    accepted: string;
    processing: string;
    ready_for_dispatch: string;
    out_for_delivery: string;
    delivered: string;
    cancelled: string;
    rejected: string;
  };
}
