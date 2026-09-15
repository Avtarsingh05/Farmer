import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { MitraIntent } from './types';

// The schema tells Gemini exactly what JSON structure to return
const intentSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    tool: {
      type: SchemaType.STRING,
      description: "The action the user wants to perform. Must be one of: 'searchProducts', 'createProductListing', 'checkOrders', 'checkInventory', 'navigate', 'unknown'",
    },
    arguments: {
      type: SchemaType.OBJECT,
      description: "The structured arguments required for the tool.",
      properties: {
        product: { type: SchemaType.STRING },
        quantity: { type: SchemaType.NUMBER },
        unit: { type: SchemaType.STRING },
        price: { type: SchemaType.NUMBER },
        maxPrice: { type: SchemaType.NUMBER },
        destination: { type: SchemaType.STRING }
      }
    },
    requiresConfirmation: {
      type: SchemaType.BOOLEAN,
      description: "True if this action creates/modifies data or needs confirmation.",
    },
    confirmationMessage: {
      type: SchemaType.STRING,
      description: "The conversational question asking the user to confirm the action, in their spoken language.",
    },
  },
  required: ["tool", "arguments", "requiresConfirmation", "confirmationMessage"]
};

const SYSTEM_INSTRUCTION = `
You are Mitra, the professional voice assistant for Kisan Mitra ("From Farm to Market, Direct").
Your job is to listen to the user (who might speak Hindi, Hinglish, Punjabi, or English) and convert their intent into a structured tool call.

RULES:
1. NEVER invent market prices, products, orders, or account information.
2. If the user asks for a feature you don't support, return tool="unknown" and a helpful confirmationMessage.
3. If information is missing for a critical action (e.g., they want to sell tomatoes but didn't state the price), return tool="unknown" and ask for the missing information in confirmationMessage.
4. For 'createProductListing', requiresConfirmation MUST be true.
5. Speak simply and naturally. Match the user's language (e.g., reply in Hindi if they speak Hindi).
6. Convert Indian numeric concepts properly (e.g., "ek quintal" = 100 kg).

TOOLS:
- createProductListing: Requires 'product', 'quantity', 'unit', 'price'.
- searchProducts: Requires 'product', optional 'quantity', 'maxPrice'.
- checkOrders: No args required.
- checkInventory: No args required.
- navigate: Requires 'destination' (e.g., 'orders', 'inventory', 'market', 'profile', 'insights').
- getHistoricalPrice: Requires 'product', optional 'period' ('7d', '30d', '90d', '1y').
- getRegionalPriceComparison: Requires 'product'.
- getFarmerSalesSummary: No args required.
`;

// Agricultural dictionary & normalizations
const CROP_MAP: Record<string, string> = {
  // Hindi / Hinglish
  'tamatar': 'Tomato',
  'tamatara': 'Tomato',
  'tamater': 'Tomato',
  'aloo': 'Potato',
  'aalu': 'Potato',
  'alu': 'Potato',
  'batata': 'Potato',
  'pyaaz': 'Onion',
  'pyaj': 'Onion',
  'pyaz': 'Onion',
  'kanda': 'Onion',
  'gehun': 'Wheat',
  'gehu': 'Wheat',
  'kanak': 'Wheat',
  'chawal': 'Rice',
  'dhan': 'Paddy',
  'makka': 'Maize',
  'makki': 'Maize',
  'sarson': 'Mustard',
  'sarsonn': 'Mustard',
  'mirch': 'Chilli',
  'mirchi': 'Chilli',
  'gobhi': 'Cauliflower',
  'bandgobhi': 'Cabbage',
  'matar': 'Peas',
  'gajar': 'Carrot',
  'lahsun': 'Garlic',
  'adrak': 'Ginger',
  // Punjabi
  'ਟਮਾਟਰ': 'Tomato',
  'ਆਲੂ': 'Potato',
  'ਪਿਆਜ਼': 'Onion',
  'ਕਣਕ': 'Wheat',
  'ਚੌਲ': 'Rice',
  'ਸਰ੍ਹੋਂ': 'Mustard',
  'ਮਿਰਚ': 'Chilli',
  'ਮਟਰ': 'Peas',
  'ਗੋਭੀ': 'Cauliflower',
  // English
  'tomato': 'Tomato',
  'tomatoes': 'Tomato',
  'potato': 'Potato',
  'potatoes': 'Potato',
  'onion': 'Onion',
  'onions': 'Onion',
  'wheat': 'Wheat',
  'rice': 'Rice',
  'maize': 'Maize',
  'corn': 'Maize',
  'mustard': 'Mustard',
  'chilli': 'Chilli',
  'peas': 'Peas',
  'carrot': 'Carrot'
};

/**
 * Built-in deterministic Agricultural Intent Parser.
 * Used when offline, when API key is missing/invalid, or as an ultra-fast fallback.
 */
export function parseLocalAgriculturalIntent(
  text: string, 
  context?: { pendingListing?: { product?: string; quantity?: number; unit?: string } }
): MitraIntent {
  const lower = text.toLowerCase().trim();

  // 1. Check if user is responding with a PRICE to an in-progress listing (Multi-turn Flow 1)
  if (context?.pendingListing?.product && context?.pendingListing?.quantity) {
    const priceMatch = lower.match(/(?:(?:rs\.?|₹|inr)\s*)?(\d+)(?:\s*(?:rupaye|rupee|rs|₹|\/kg|per kilo|kilo))?/i);
    if (priceMatch && priceMatch[1]) {
      const price = parseInt(priceMatch[1], 10);
      const { product, quantity, unit = 'kg' } = context.pendingListing;
      return {
        tool: 'createProductListing',
        arguments: {
          product,
          quantity,
          unit,
          price
        },
        requiresConfirmation: true,
        confirmationMessage: `${quantity} ${unit} ${product}, ₹${price} per ${unit}. Listing publish kar doon?`
      };
    }
  }

  // 2. Navigation Intents
  if (lower.includes('market') || lower.includes('mandi') || lower.includes('bazaar') || lower.includes('explore')) {
    return {
      tool: 'navigate',
      arguments: { destination: 'market' },
      requiresConfirmation: false,
      confirmationMessage: 'Marketplace open kar raha hoon.'
    };
  }

  if (lower.includes('order') || lower.includes('orders') || lower.includes('tracking') || lower.includes('track')) {
    return {
      tool: 'checkOrders',
      arguments: {},
      requiresConfirmation: false,
      confirmationMessage: 'Aapke orders check kar raha hoon.'
    };
  }

  if (lower.includes('insights') || lower.includes('analytics') || lower.includes('report')) {
    return {
      tool: 'navigate',
      arguments: { destination: 'insights' },
      requiresConfirmation: false,
      confirmationMessage: 'Kisan Insights dashboard open kar raha hoon.'
    };
  }

  // Check farmer sales query
  if (lower.includes('mera revenue') || lower.includes('mere sales') || lower.includes('meri bikri') || lower.includes('sabse zyada bikne')) {
    return {
      tool: 'getFarmerSalesSummary',
      arguments: { period: '30d' },
      requiresConfirmation: false,
      confirmationMessage: 'Aapki sales performance calculate kar raha hoon.'
    };
  }

  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('maal')) {
    return {
      tool: 'checkInventory',
      arguments: {},
      requiresConfirmation: false,
      confirmationMessage: 'Aapki inventory open kar raha hoon.'
    };
  }

  // 3. Extract crop / product
  let detectedCrop: string | null = null;
  for (const [key, canonical] of Object.entries(CROP_MAP)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower) || lower.includes(key)) {
      detectedCrop = canonical;
      break;
    }
  }

  // 4. Extract quantity and unit
  let detectedQty: number | null = null;
  let detectedUnit: string = 'kg';

  // Handle quintal (1 quintal = 100 kg)
  if (lower.includes('quintal') || lower.includes('kuntal')) {
    const qMatch = lower.match(/(\d+)\s*(?:quintal|kuntal)/i);
    if (qMatch) {
      detectedQty = parseInt(qMatch[1], 10) * 100;
      detectedUnit = 'kg';
    } else if (lower.includes('ek') || lower.includes('one') || lower.includes('1')) {
      detectedQty = 100;
      detectedUnit = 'kg';
    } else if (lower.includes('do') || lower.includes('two') || lower.includes('2')) {
      detectedQty = 200;
      detectedUnit = 'kg';
    }
  }

  if (!detectedQty) {
    const qtyMatch = lower.match(/(\d+)\s*(?:kg|kilo|kilos|gram|g|ton|tonne)?/i);
    if (qtyMatch && qtyMatch[1]) {
      detectedQty = parseInt(qtyMatch[1], 10);
      if (lower.includes('tonne') || lower.includes('ton')) {
        detectedQty = detectedQty * 1000;
      }
    }
  }

  // 5. Extract price
  let detectedPrice: number | null = null;
  const priceMatches = lower.match(/(?:rupaye|rs|₹|under|andar|tak|price|rate)\s*[:]?\s*(\d+)|(\d+)\s*(?:rupaye|rs|₹|kilo tak|per kilo)/i);
  if (priceMatches) {
    const rawPrice = priceMatches[1] || priceMatches[2];
    if (rawPrice) detectedPrice = parseInt(rawPrice, 10);
  }

  // 6. Differentiate Search vs Listing Intent
  const isSearch = lower.includes('chahiye') || 
                   lower.includes('kharidna') || 
                   lower.includes('search') || 
                   lower.includes('find') || 
                   lower.includes('dikhao') || 
                   lower.includes('buy') || 
                   lower.includes('get') ||
                   lower.includes('under') ||
                   lower.includes('andar');

  const isListing = lower.includes('paas') || 
                    lower.includes('bechna') || 
                    lower.includes('listing') || 
                    lower.includes('sell') || 
                    lower.includes('list') || 
                    lower.includes('create') ||
                    lower.includes('hain');

  // Regional Comparison Intent
  if (detectedCrop && (lower.includes('compare') || lower.includes('mukabla') || (lower.includes('aur') && (lower.includes('amritsar') || lower.includes('jalandhar') || lower.includes('ludhiana') || lower.includes('mandi'))))) {
    return {
      tool: 'getRegionalPriceComparison',
      arguments: { product: detectedCrop },
      requiresConfirmation: false,
      confirmationMessage: `${detectedCrop} ke regional mandi rates compare kar raha hoon.`
    };
  }

  // Historical Price / Trend Intent
  if (detectedCrop && (lower.includes('rate kaisa') || lower.includes('history') || lower.includes('pichle') || lower.includes('trend') || lower.includes('bhav') || lower.includes('average') || lower.includes('kaisa raha'))) {
    const period = lower.includes('7') ? '7d' : lower.includes('90') ? '90d' : lower.includes('saal') || lower.includes('year') ? '1y' : '30d';
    return {
      tool: 'getHistoricalPrice',
      arguments: { product: detectedCrop, period },
      requiresConfirmation: false,
      confirmationMessage: `${detectedCrop} ka pichle ${period} ka historical price analysis nikal raha hoon.`
    };
  }

  // Search Flow
  if (isSearch || (!isListing && detectedCrop && (lower.includes('kilo') || lower.includes('chahiye')))) {
    return {
      tool: 'searchProducts',
      arguments: {
        product: detectedCrop || 'Produce',
        quantity: detectedQty || 1,
        maxPrice: detectedPrice || undefined
      },
      requiresConfirmation: false,
      confirmationMessage: detectedCrop 
        ? `${detectedCrop} search kar raha hoon${detectedPrice ? ` ₹${detectedPrice} ke andar` : ''}.` 
        : 'Market mein search kar raha hoon.'
    };
  }

  // Farmer Listing Flow
  if (detectedCrop) {
    if (detectedQty && detectedPrice) {
      return {
        tool: 'createProductListing',
        arguments: {
          product: detectedCrop,
          quantity: detectedQty,
          unit: detectedUnit,
          price: detectedPrice
        },
        requiresConfirmation: true,
        confirmationMessage: `${detectedQty} ${detectedUnit} ${detectedCrop}, ₹${detectedPrice} per ${detectedUnit}. Listing publish kar doon?`
      };
    } else if (detectedQty && !detectedPrice) {
      // Missing price -> ask the user for price!
      return {
        tool: 'unknown',
        arguments: {
          partialListing: { product: detectedCrop, quantity: detectedQty, unit: detectedUnit }
        },
        requiresConfirmation: false,
        confirmationMessage: `Aap ${detectedQty} ${detectedUnit} ${detectedCrop} ki listing banana chahte hain? Price kitna rakhna chahenge?`
      };
    }
  }

  // Generic fallback if ambiguous
  return {
    tool: 'unknown',
    arguments: {},
    requiresConfirmation: false,
    confirmationMessage: 'Main samajh nahi paaya. Aap bol sakte hain: "Mere paas 100 kilo tamatar hain" ya "20 kilo aloo chahiye".'
  };
}

export async function processVoiceInput(
  transcript: string, 
  apiKey?: string,
  context?: { pendingListing?: { product?: string; quantity?: number; unit?: string } }
): Promise<MitraIntent> {
  const cleanKey = (apiKey || '').trim();
  const isKeyValid = cleanKey.length > 10 && !cleanKey.includes('your_gemini_api_key_here');

  // If a real Gemini key is present, try Gemini first
  if (isKeyValid) {
    try {
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: intentSchema,
          temperature: 0.1,
        },
      });

      const promptContext = context?.pendingListing 
        ? `[Conversation Context: User is creating a listing for ${context.pendingListing.quantity} ${context.pendingListing.unit} ${context.pendingListing.product}. They are now specifying the price.] User said: "${transcript}"`
        : transcript;

      const result = await model.generateContent(promptContext);
      const responseText = result.response.text();
      
      if (responseText) {
        const parsed: MitraIntent = JSON.parse(responseText);
        if (['searchProducts', 'createProductListing', 'checkOrders', 'checkInventory', 'navigate', 'unknown'].includes(parsed.tool)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Gemini AI API unavailable or failed, falling back to local agricultural NLP engine:", error);
    }
  }

  // Fallback to local Agricultural NLP engine
  return parseLocalAgriculturalIntent(transcript, context);
}
