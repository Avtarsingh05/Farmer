/**
 * Agricultural Stock Images Library
 * Maps produce keywords to curated Unsplash images.
 * Used for auto-suggesting images when a farmer types a product name.
 */

export interface StockProduceImage {
  keyword: string;
  label: string;
  url: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'pulses' | 'spices' | 'oilseeds' | 'dairy' | 'other';
}

export const STOCK_PRODUCE_IMAGES: StockProduceImage[] = [
  // --- Vegetables ---
  { keyword: 'tomato', label: 'Tomatoes', category: 'vegetables', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'onion', label: 'Onions', category: 'vegetables', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'potato', label: 'Potatoes', category: 'vegetables', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'carrot', label: 'Carrots', category: 'vegetables', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'cauliflower', label: 'Cauliflower', category: 'vegetables', url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'cabbage', label: 'Cabbage', category: 'vegetables', url: 'https://images.unsplash.com/photo-1594282418426-f2f5e2de1603?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'spinach', label: 'Spinach / Palak', category: 'vegetables', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'palak', label: 'Palak / Spinach', category: 'vegetables', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'brinjal', label: 'Brinjal / Eggplant', category: 'vegetables', url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'eggplant', label: 'Eggplant / Brinjal', category: 'vegetables', url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'baingan', label: 'Baingan / Brinjal', category: 'vegetables', url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'okra', label: 'Okra / Bhindi', category: 'vegetables', url: 'https://images.unsplash.com/photo-1591374516696-08a20e1d0e3c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'bhindi', label: 'Bhindi / Okra', category: 'vegetables', url: 'https://images.unsplash.com/photo-1591374516696-08a20e1d0e3c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'ladyfinger', label: "Lady's Finger / Bhindi", category: 'vegetables', url: 'https://images.unsplash.com/photo-1591374516696-08a20e1d0e3c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'capsicum', label: 'Capsicum / Bell Pepper', category: 'vegetables', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'shimla mirch', label: 'Shimla Mirch / Capsicum', category: 'vegetables', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'cucumber', label: 'Cucumber', category: 'vegetables', url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'kheera', label: 'Kheera / Cucumber', category: 'vegetables', url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'peas', label: 'Green Peas', category: 'vegetables', url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'matar', label: 'Matar / Peas', category: 'vegetables', url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'garlic', label: 'Garlic', category: 'vegetables', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'lahsun', label: 'Lahsun / Garlic', category: 'vegetables', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'ginger', label: 'Ginger', category: 'vegetables', url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'adrak', label: 'Adrak / Ginger', category: 'vegetables', url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'beetroot', label: 'Beetroot', category: 'vegetables', url: 'https://images.unsplash.com/photo-1613141412610-54ac2e2b9c2e?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'pumpkin', label: 'Pumpkin / Kaddu', category: 'vegetables', url: 'https://images.unsplash.com/photo-1501746877-14782df58970?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'kaddu', label: 'Kaddu / Pumpkin', category: 'vegetables', url: 'https://images.unsplash.com/photo-1501746877-14782df58970?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'radish', label: 'Radish / Mooli', category: 'vegetables', url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'mooli', label: 'Mooli / Radish', category: 'vegetables', url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'beans', label: 'French Beans', category: 'vegetables', url: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'bitter gourd', label: 'Bitter Gourd / Karela', category: 'vegetables', url: 'https://images.unsplash.com/photo-1601236668456-8b18d81e3e81?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'karela', label: 'Karela / Bitter Gourd', category: 'vegetables', url: 'https://images.unsplash.com/photo-1601236668456-8b18d81e3e81?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'bottle gourd', label: 'Bottle Gourd / Lauki', category: 'vegetables', url: 'https://images.unsplash.com/photo-1592139691373-5d261e79e36e?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'lauki', label: 'Lauki / Bottle Gourd', category: 'vegetables', url: 'https://images.unsplash.com/photo-1592139691373-5d261e79e36e?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'corn', label: 'Sweet Corn / Makai', category: 'vegetables', url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'makai', label: 'Makai / Corn', category: 'vegetables', url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80' },

  // --- Fruits ---
  { keyword: 'mango', label: 'Mangoes', category: 'fruits', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'alphonso', label: 'Alphonso Mangoes', category: 'fruits', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'hapus', label: 'Hapus / Alphonso Mangoes', category: 'fruits', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'banana', label: 'Bananas', category: 'fruits', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'kela', label: 'Kela / Banana', category: 'fruits', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'apple', label: 'Apples', category: 'fruits', url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'seb', label: 'Seb / Apple', category: 'fruits', url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'pomegranate', label: 'Pomegranate / Anar', category: 'fruits', url: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'anar', label: 'Anar / Pomegranate', category: 'fruits', url: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'grapes', label: 'Grapes / Angoor', category: 'fruits', url: 'https://images.unsplash.com/photo-1423345741831-b9e6b7e2b8e7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'angoor', label: 'Angoor / Grapes', category: 'fruits', url: 'https://images.unsplash.com/photo-1423345741831-b9e6b7e2b8e7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'guava', label: 'Guava / Amrood', category: 'fruits', url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'amrood', label: 'Amrood / Guava', category: 'fruits', url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'orange', label: 'Oranges / Santra', category: 'fruits', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'santra', label: 'Santra / Orange', category: 'fruits', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'papaya', label: 'Papaya', category: 'fruits', url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'watermelon', label: 'Watermelon / Tarbuj', category: 'fruits', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'tarbuj', label: 'Tarbuj / Watermelon', category: 'fruits', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'lemon', label: 'Lemon / Nimbu', category: 'fruits', url: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'nimbu', label: 'Nimbu / Lemon', category: 'fruits', url: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'pineapple', label: 'Pineapple / Ananas', category: 'fruits', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'coconut', label: 'Coconut / Nariyal', category: 'fruits', url: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'nariyal', label: 'Nariyal / Coconut', category: 'fruits', url: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?w=600&auto=format&fit=crop&q=80' },

  // --- Grains & Cereals ---
  { keyword: 'wheat', label: 'Wheat / Gehu', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'gehu', label: 'Gehu / Wheat', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'rice', label: 'Rice / Chawal', category: 'grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'basmati', label: 'Basmati Rice', category: 'grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'chawal', label: 'Chawal / Rice', category: 'grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'bajra', label: 'Bajra / Pearl Millet', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'jowar', label: 'Jowar / Sorghum', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'millet', label: 'Millets', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'ragi', label: 'Ragi / Finger Millet', category: 'grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'maize', label: 'Maize / Makka', category: 'grains', url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80' },

  // --- Pulses & Lentils ---
  { keyword: 'chana', label: 'Chana / Chickpeas', category: 'pulses', url: 'https://images.unsplash.com/photo-1618329340733-ef98ab6fa4c3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'chickpea', label: 'Chickpeas / Chana', category: 'pulses', url: 'https://images.unsplash.com/photo-1618329340733-ef98ab6fa4c3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'moong', label: 'Moong Dal / Green Gram', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'masoor', label: 'Masoor Dal / Red Lentil', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'arhar', label: 'Arhar / Toor Dal', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'toor', label: 'Toor Dal', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'urad', label: 'Urad Dal / Black Lentil', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'lentil', label: 'Lentils / Dal', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'dal', label: 'Dal / Lentils', category: 'pulses', url: 'https://images.unsplash.com/photo-1616200580609-e09dbfd53f19?w=600&auto=format&fit=crop&q=80' },

  // --- Spices & Herbs ---
  { keyword: 'turmeric', label: 'Turmeric / Haldi', category: 'spices', url: 'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'haldi', label: 'Haldi / Turmeric', category: 'spices', url: 'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'chilli', label: 'Red Chilli / Mirch', category: 'spices', url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'mirch', label: 'Mirch / Chilli', category: 'spices', url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'coriander', label: 'Coriander / Dhaniya', category: 'spices', url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'dhaniya', label: 'Dhaniya / Coriander', category: 'spices', url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'cumin', label: 'Cumin / Jeera', category: 'spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'jeera', label: 'Jeera / Cumin', category: 'spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'fenugreek', label: 'Fenugreek / Methi', category: 'spices', url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'methi', label: 'Methi / Fenugreek', category: 'spices', url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'cardamom', label: 'Cardamom / Elaichi', category: 'spices', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'elaichi', label: 'Elaichi / Cardamom', category: 'spices', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80' },

  // --- Oilseeds ---
  { keyword: 'groundnut', label: 'Groundnut / Peanut', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1567892320421-4d219f46b3e1?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'peanut', label: 'Peanut / Groundnut', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1567892320421-4d219f46b3e1?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'mustard', label: 'Mustard Seeds / Sarso', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'sarso', label: 'Sarso / Mustard', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'sesame', label: 'Sesame / Til', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'til', label: 'Til / Sesame', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'sunflower', label: 'Sunflower Seeds', category: 'oilseeds', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80' },

  // --- Dairy ---
  { keyword: 'milk', label: 'Fresh Milk / Doodh', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'doodh', label: 'Doodh / Milk', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'ghee', label: 'Pure Ghee', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'paneer', label: 'Fresh Paneer', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'curd', label: 'Curd / Dahi', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'dahi', label: 'Dahi / Curd', category: 'dairy', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80' },

  // --- Other ---
  { keyword: 'honey', label: 'Natural Honey / Shahad', category: 'other', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'shahad', label: 'Shahad / Honey', category: 'other', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'jaggery', label: 'Jaggery / Gud', category: 'other', url: 'https://images.unsplash.com/photo-1615485290382-ebbe735e04a5?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'gud', label: 'Gud / Jaggery', category: 'other', url: 'https://images.unsplash.com/photo-1615485290382-ebbe735e04a5?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'mushroom', label: 'Mushrooms', category: 'other', url: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'sugarcane', label: 'Sugarcane / Ganna', category: 'other', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
  { keyword: 'ganna', label: 'Ganna / Sugarcane', category: 'other', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
];

/**
 * Fuzzy search: Given any product name string, returns the best-matching
 * stock images (up to 6), ranked by keyword relevance.
 */
export function getStockImageSuggestions(name: string, limit = 6): StockProduceImage[] {
  if (!name || name.trim().length < 2) return [];
  const query = name.toLowerCase().trim();
  
  const scored = STOCK_PRODUCE_IMAGES.map(item => {
    let score = 0;
    if (query === item.keyword) score = 100;
    else if (item.keyword.startsWith(query)) score = 80;
    else if (query.includes(item.keyword)) score = 60;
    else if (item.keyword.includes(query)) score = 50;
    else if (item.label.toLowerCase().includes(query)) score = 40;
    return { item, score };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

  // Deduplicate by url
  const seen = new Set<string>();
  const results: StockProduceImage[] = [];
  for (const { item } of scored) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      results.push(item);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Convert a StockProduceImage to a CloudinaryImage object
 * (to be stored in the product images array just like an uploaded image).
 */
export function stockImageToCloudinaryImage(stock: StockProduceImage) {
  return {
    publicId: `stock/${stock.keyword.replace(/\s+/g, '-')}`,
    secureUrl: stock.url,
    width: 600,
    height: 400,
    format: 'jpg',
  };
}
