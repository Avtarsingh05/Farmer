// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'buyer' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned';

export interface AppUser {
  uid: string;
  id?: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  avatar?: string;
  isEmailVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Farmer ──────────────────────────────────────────────────────────────────

export type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface FarmerProfile {
  userId: string;
  id?: string;
  displayName: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  farmCount: number;
  primaryLocation?: string;
  district?: string;
  state?: string;
  aadhaarProvided: boolean;
  photoURL?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  address: string;
  district: string;
  state: string;
  areaInAcres?: number;
  cropTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Buyer ───────────────────────────────────────────────────────────────────

export interface BuyerProfile {
  userId: string;
  id?: string;
  displayName: string;
  district?: string;
  state?: string;
  deliveryAddress?: DeliveryAddress;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type QualityGrade = 'A' | 'B' | 'C' | 'mixed';

export type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'inactive';

export interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmId?: string;
  categoryId: string;
  categoryName?: string;
  category?: string;
  name: string;
  description: string;
  images: CloudinaryImage[];
  quantity: number;
  unit: string;
  price: number;
  currency: 'INR';
  location?: string;
  district?: string;
  state?: string;
  qualityGrade: QualityGrade;
  availabilityStatus: AvailabilityStatus;
  status?: string;
  isAvailable?: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListItem {
  id: string;
  farmerId: string;
  farmerName: string;
  categoryId: string;
  categoryName?: string;
  category?: string;
  name: string;
  images: CloudinaryImage[];
  quantity: number;
  unit: string;
  price: number;
  currency: 'INR';
  district?: string;
  state?: string;
  qualityGrade: QualityGrade;
  availabilityStatus: AvailabilityStatus;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  productId: string;
  farmerId: string;
  productName: string;
  availableQty: number;
  reservedQty: number;
  soldQty: number;
  unit: string;
  lowStockThreshold: number;
  updatedAt: Date;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'processing'
  | 'ready_for_dispatch'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type DeliveryType = 'pickup' | 'delivery';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  name?: string;
  phone?: string;
  address?: string;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedBy: string; // uid
  changedByRole: UserRole;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  statusHistory: OrderStatusHistoryEntry[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

// ─── Market Prices ───────────────────────────────────────────────────────────

export interface MarketPrice {
  id: string;
  productName: string;
  categoryId?: string;
  priceMin: number;
  priceMax: number;
  unit: string;
  source: string;
  sourceDate: Date;
  district?: string;
  state?: string;
  createdAt: Date;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | 'new_order'
  | 'order_accepted'
  | 'order_rejected'
  | 'order_status_changed'
  | 'order_delivered'
  | 'product_approved'
  | 'product_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'low_stock'
  | 'account_event';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  message?: string;
  actionUrl?: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: 'order' | 'product' | 'farmer' | 'user';
  createdAt: Date;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportStatus = 'open' | 'reviewed' | 'resolved';

export type ReportReason =
  | 'fraud'
  | 'misleading_listing'
  | 'inappropriate_content'
  | 'spam'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'product' | 'farmer' | 'user';
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  maxQuantity: number;
  imageUrl?: string;
}

export * from './settings.types';
