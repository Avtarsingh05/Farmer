

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  district: string;
  photo: string;
  quote: string;
  rating: number;
  stat: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ramesh Patil', role: 'Onion Farmer', district: 'Nashik, Maharashtra',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    quote: 'Middlemen used to take 40%. Now I sell directly through KisanMitra. Last month I earned â‚¹12,000 more.',
    rating: 5, stat: '+â‚¹12,000 / month',
  },
  {
    id: 't2',
    name: 'Anita Mehta', role: 'Restaurant Buyer', district: 'Bandra, Mumbai',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b18c?w=120&auto=format&fit=crop&q=80',
    quote: 'I source all vegetables for my 3 restaurants through KisanMitra. Quality is consistent and prices are fair.',
    rating: 5, stat: 'Saves â‚¹8,000/month',
  },
  {
    id: 't3',
    name: 'Sukhwinder Singh', role: 'Wheat & Rice Farmer', district: 'Amritsar, Punjab',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    quote: 'Used to struggle getting fair rates at the mandi. KisanMitra gave me access to buyers in Delhi and Mumbai.',
    rating: 5, stat: '+â‚¹18,000 / month',
  }
];

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const data = localStorage.getItem('kisanmitra_landing_testimonials');
  if (data) {
    try {
      return JSON.parse(data);
    } catch(e) {}
  }
  return DEFAULT_TESTIMONIALS;
};

export const saveTestimonials = async (testimonials: Testimonial[]): Promise<void> => {
  localStorage.setItem('kisanmitra_landing_testimonials', JSON.stringify(testimonials));
};
