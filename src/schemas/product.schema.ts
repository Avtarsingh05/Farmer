import { z } from 'zod';

const UNITS = ['kg', 'quintal', 'tonne', 'piece', 'dozen', 'litre', 'bundle', 'bag'] as const;
const QUALITY_GRADES = ['A', 'B', 'C', 'mixed'] as const;

export const productSchema = z.object({
  name:               z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description:        z.string().min(10, 'Description must be at least 10 characters').max(1000),
  categoryId:         z.string().min(1, 'Select a category'),
  quantity:           z.coerce.number().positive('Quantity must be greater than 0').max(1_000_000),
  unit:               z.enum(UNITS, { message: 'Select a unit' }),
  price:              z.coerce.number().positive('Price must be greater than 0').max(1_000_000),
  qualityGrade:       z.enum(QUALITY_GRADES, { message: 'Select a quality grade' }),
  location:           z.string().max(100).optional(),
  district:           z.string().max(100).optional(),
  state:              z.string().max(100).optional(),
  tags:               z.array(z.string()).optional(),
  lowStockThreshold:  z.coerce.number().min(0).optional(),
});

export const updateProductSchema = productSchema.partial().extend({
  availabilityStatus: z.enum(['available', 'limited', 'sold_out', 'inactive']).optional(),
});

export type ProductFormData       = z.infer<typeof productSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

export { UNITS, QUALITY_GRADES };
