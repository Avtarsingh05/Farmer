export type MitraState = 
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'executing'
  | 'responding'
  | 'error';

export type MitraLanguage = 'en' | 'hi' | 'hi-Latn' | 'pa';

export interface MitraMessage {
  id: string;
  sender: 'user' | 'mitra';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface MitraToolResult {
  success: boolean;
  tool: string;
  data?: any;
  errorCode?: string;
  message?: string;
}

// Tool Names Whitelist
export type MitraToolName = 
  | 'searchProducts'
  | 'createProductListing'
  | 'checkOrders'
  | 'checkInventory'
  | 'navigate'
  | 'getHistoricalPrice'
  | 'getRegionalPriceComparison'
  | 'getFarmerSalesSummary'
  | 'unknown';

export interface MitraIntent {
  tool: MitraToolName;
  arguments: any; // Can be typed stricter per tool if needed
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export interface MitraSession {
  isActive: boolean;
  currentState: MitraState;
  transcript: string;
  interimTranscript: string;
  messages: MitraMessage[];
  pendingIntent: MitraIntent | null;
  language: MitraLanguage;
}
