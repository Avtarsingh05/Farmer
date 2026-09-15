import { MitraIntent, MitraToolResult } from './types';
import { createProduct } from '@/services/productService';
import { AppUser } from '@/types';
import { 
  getCropPriceStatistics, 
  getRegionalPrices, 
  getFarmerSalesPerformance 
} from '@/features/analytics/services/analyticsService';

// Category mappings aligning with platform categories
const CATEGORY_MAP: Record<string, string> = {
  'Tomato': 'cat-veg',
  'Potato': 'cat-veg',
  'Onion': 'cat-veg',
  'Cauliflower': 'cat-veg',
  'Cabbage': 'cat-veg',
  'Carrot': 'cat-veg',
  'Chilli': 'cat-veg',
  'Garlic': 'cat-veg',
  'Ginger': 'cat-veg',
  'Peas': 'cat-veg',
  'Wheat': 'cat-grains',
  'Rice': 'cat-grains',
  'Paddy': 'cat-grains',
  'Maize': 'cat-grains',
  'Mustard': 'cat-spices',
};

// Realistic crop image presets for voice-created listings
const CROP_IMAGES: Record<string, string> = {
  'Tomato': 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600&auto=format&fit=crop&q=80',
  'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  'Onion': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
  'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
  'Mustard': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

export async function executeMitraTool(
  intent: MitraIntent,
  user: AppUser | null
): Promise<MitraToolResult> {
  if (!user) {
    return {
      success: false,
      tool: intent.tool,
      errorCode: 'UNAUTHORIZED',
      message: 'Aapko pehle login karna hoga.'
    };
  }

  try {
    switch (intent.tool) {
      case 'createProductListing': {
        if (user.role !== 'farmer') {
          throw new Error("Sirf registered farmers hi produce list kar sakte hain.");
        }
        
        const { product, quantity, unit, price } = intent.arguments;
        if (!product || !quantity || !unit || !price) {
          throw new Error("Puri details nahi mili (crop name, quantity, unit, asking price).");
        }

        const normalizedName = product.charAt(0).toUpperCase() + product.slice(1);
        const categoryId = CATEGORY_MAP[normalizedName] || 'cat-veg';
        const imageUrl = CROP_IMAGES[normalizedName] || DEFAULT_IMAGE;

        // Call real application service
        const productId = await createProduct(user.id || user.uid, user.name, {
          name: normalizedName,
          categoryId,
          quantity: Number(quantity),
          unit: unit as any,
          price: Number(price),
          description: `Fresh farm-harvested ${normalizedName} directly available from ${user.name}.`,
          qualityGrade: 'A',
          tags: [product.toLowerCase(), 'fresh', 'farm-direct'],
          images: [{
            publicId: 'voice-' + Date.now(),
            secureUrl: imageUrl,
            width: 600,
            height: 400,
            format: 'jpg',
          }]
        });

        return {
          success: true,
          tool: intent.tool,
          data: { productId },
          message: `${normalizedName} ki listing successfully publish ho gayi hai!`
        };
      }

      case 'searchProducts': {
        return {
          success: true,
          tool: intent.tool,
          data: { query: intent.arguments.product, maxPrice: intent.arguments.maxPrice },
          message: 'Market mein matching listings search kar raha hoon.'
        };
      }

      case 'navigate': {
        const dest = intent.arguments.destination;
        let route = '/';
        if (dest === 'orders') route = user.role === 'farmer' ? '/farmer/orders' : '/buyer/orders';
        else if (dest === 'inventory') route = '/farmer/inventory';
        else if (dest === 'market') route = '/market';
        else if (dest === 'profile') route = user.role === 'farmer' ? '/farmer/profile' : '/buyer/profile';
        
        return {
          success: true,
          tool: intent.tool,
          data: { route },
          message: 'Page open kar raha hoon.'
        };
      }

      case 'checkOrders': {
        return {
          success: true,
          tool: intent.tool,
          data: { route: user.role === 'farmer' ? '/farmer/orders' : '/buyer/orders' },
          message: 'Aapke orders load kar raha hoon.'
        };
      }

      case 'checkInventory': {
        return {
          success: true,
          tool: intent.tool,
          data: { route: '/farmer/inventory' },
          message: 'Aapki inventory load kar raha hoon.'
        };
      }

      case 'getHistoricalPrice': {
        const crop = (intent.arguments.product || 'tomato').toLowerCase();
        const period = (intent.arguments.period as any) || '30d';
        const stats = await getCropPriceStatistics(crop, period);

        if (!stats) {
          return {
            success: true,
            tool: intent.tool,
            message: `${crop} ke liye historical data uplabdh nahi hai.`
          };
        }

        const demoNote = stats.isDemo ? " (Ye demo historical data par based hai)." : "";
        const trendWord = stats.trend === 'rising' ? 'badha hai' : stats.trend === 'falling' ? 'gira hai' : 'stable raha hai';
        const msg = `Pichle 30 din mein ${stats.timePeriod} ke mutabiq ${crop} ka average reference price ₹${stats.averagePrice} per ${stats.unit} raha. Current price ₹${stats.currentPrice} hai aur trend ${trendWord}${demoNote}`;

        return {
          success: true,
          tool: intent.tool,
          data: { stats },
          message: msg
        };
      }

      case 'getRegionalPriceComparison': {
        const crop = (intent.arguments.product || 'tomato').toLowerCase();
        const records = await getRegionalPrices(crop);

        if (!records || records.length === 0) {
          return {
            success: true,
            tool: intent.tool,
            message: `${crop} ke liye regional comparison uplabdh nahi hai.`
          };
        }

        // Highlight first 2-3 districts
        const summaries = records.slice(0, 3).map(r => `${r.district} mein ₹${r.averagePrice}/${r.unit}`).join(', ');
        const msg = `${crop} ke regional rates: ${summaries}.`;

        return {
          success: true,
          tool: intent.tool,
          data: { records },
          message: msg
        };
      }

      case 'getFarmerSalesSummary': {
        if (user.role !== 'farmer') {
          return {
            success: false,
            tool: intent.tool,
            message: 'Sales summary sirf farmers ke liye uplabdh hai.'
          };
        }

        const sales = await getFarmerSalesPerformance(user.id || user.uid, '30d');
        const topCrop = sales.topCrops[0]?.cropName || 'produce';
        const msg = `Aapka pichle 30 din ka total revenue ₹${sales.totalRevenue} hai (${sales.totalOrders} orders delivered). Sabse zyada bikne wala crop ${topCrop} raha.`;

        return {
          success: true,
          tool: intent.tool,
          data: { sales },
          message: msg
        };
      }

      default:
        return {
          success: false,
          tool: intent.tool,
          message: "Mujhe samajh nahi aaya. Kripya dobara boliye."
        };
    }
  } catch (error: any) {
    console.error("Tool execution error:", error);
    return {
      success: false,
      tool: intent.tool,
      errorCode: 'EXECUTION_ERROR',
      message: error.message || 'Error occurred.'
    };
  }
}
