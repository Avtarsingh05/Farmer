import { z } from 'zod';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
] as const;

export const farmerProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name required').max(80),
  bio:         z.string().max(500).optional(),
  district:    z.string().max(100).optional(),
  state:       z.enum(indianStates, { message: 'Select a state' }).optional(),
});

export const farmSchema = z.object({
  name:        z.string().min(2, 'Farm name required').max(100),
  address:     z.string().min(5, 'Address required').max(300),
  district:    z.string().min(2, 'District required').max(100),
  state:       z.enum(indianStates, { message: 'Select a state' }),
  areaInAcres: z.coerce.number().positive().max(10000).optional(),
  cropTypes:   z.array(z.string()).min(1, 'Add at least one crop type'),
});

export type FarmerProfileFormData = z.infer<typeof farmerProfileSchema>;
export type FarmFormData          = z.infer<typeof farmSchema>;
export { indianStates };
