import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  line1:    z.string().min(5, 'Street address required').max(200),
  line2:    z.string().max(200).optional(),
  city:     z.string().min(2, 'City required').max(100),
  district: z.string().min(2, 'District required').max(100),
  state:    z.string().min(2, 'State required').max(100),
  pincode:  z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
});

export const placeOrderSchema = z.object({
  deliveryType:    z.enum(['pickup', 'delivery']),
  deliveryAddress: deliveryAddressSchema.optional(),
  notes:           z.string().max(500).optional(),
}).refine(
  (data) => data.deliveryType === 'pickup' || !!data.deliveryAddress,
  { message: 'Delivery address is required', path: ['deliveryAddress'] }
);

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;
export type PlaceOrderFormData      = z.infer<typeof placeOrderSchema>;
