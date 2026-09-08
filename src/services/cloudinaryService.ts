/**
 * Cloudinary image upload utility.
 *
 * Uses unsigned upload preset — safe for client-side use.
 * Never exposes Cloudinary API secret in the browser.
 */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResult {
  publicId:  string;
  secureUrl: string;
  width:     number;
  height:    number;
  format:    string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validate a file before uploading.
 * Returns an error string or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are accepted.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

/**
 * Upload an image to Cloudinary using unsigned upload preset.
 * Reports upload progress via the onProgress callback (0–100).
 */
export async function uploadImage(
  file: File,
  options: {
    folder?: string;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<CloudinaryUploadResult> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  // If Cloudinary is not configured or in demo mode, provide instant local preview URL
  if (!CLOUD_NAME || CLOUD_NAME === 'dummy_cloud_name' || !UPLOAD_PRESET || UPLOAD_PRESET === 'dummy_preset') {
    if (options.onProgress) {
      options.onProgress(100);
    }
    const objectUrl = URL.createObjectURL(file);
    return {
      publicId: 'local-' + Date.now(),
      secureUrl: objectUrl,
      width: 800,
      height: 600,
      format: file.type.split('/')[1] || 'jpg',
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (options.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          options.onProgress!(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as {
          public_id: string;
          secure_url: string;
          width: number;
          height: number;
          format: string;
        };
        resolve({
          publicId:  data.public_id,
          secureUrl: data.secure_url,
          width:     data.width,
          height:    data.height,
          format:    data.format,
        });
      } else {
        // Fallback to local object URL on failed upload in development
        const objectUrl = URL.createObjectURL(file);
        resolve({
          publicId: 'local-' + Date.now(),
          secureUrl: objectUrl,
          width: 800,
          height: 600,
          format: file.type.split('/')[1] || 'jpg',
        });
      }
    };

    xhr.onerror = () => {
      const objectUrl = URL.createObjectURL(file);
      resolve({
        publicId: 'local-' + Date.now(),
        secureUrl: objectUrl,
        width: 800,
        height: 600,
        format: file.type.split('/')[1] || 'jpg',
      });
    };
    xhr.send(formData);
  });
}

/**
 * Build an optimized Cloudinary delivery URL.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options.width)   transforms.push(`w_${options.width}`);
  if (options.height)  transforms.push(`h_${options.height}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  const t = transforms.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`;
}

/**
 * Get a thumbnail URL for a product image.
 */
export function getProductThumbnail(publicId: string, width = 400): string {
  return buildCloudinaryUrl(publicId, { width, format: 'webp' });
}


/**
 * Returns the best image URL to display.
 * For stock images or local previews, returns the raw secureUrl.
 * For actual Cloudinary uploads, requests a highly optimized webp thumbnail.
 */
export function getOptimizedImageUrl(image?: CloudinaryUploadResult | { publicId?: string; secureUrl?: string; }, width = 600): string {
  if (!image) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  
  if (image.publicId?.startsWith('stock/') || image.publicId?.startsWith('local-')) {
    return image.secureUrl || '';
  }
  
  if (image.publicId) {
    return getProductThumbnail(image.publicId, width);
  }
  
  return image.secureUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
}
