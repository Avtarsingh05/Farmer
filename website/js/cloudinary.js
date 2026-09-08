// ==========================================================================
// Cloudinary Service
// ==========================================================================

const cloudName = 'dkwicn3vq';
const uploadPreset = 'farmer';

window.Cloudinary = {
    /**
     * Upload an image to Cloudinary
     * @param {File} file - The image file
     * @param {string} folder - Target folder in Cloudinary
     * @param {Function} onProgress - Callback for upload progress (0-100)
     * @returns {Promise<Object>} { publicId, secureUrl, width, height }
     */
    async uploadImage(file, folder = 'general', onProgress = null) {
        if (!file) throw new Error("No file provided");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `kisanmitra/${folder}`);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            xhr.open('POST', url, true);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        publicId: response.public_id,
                        secureUrl: response.secure_url,
                        width: response.width,
                        height: response.height
                    });
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Upload failed due to network error"));
            };

            xhr.send(formData);
        });
    },

    /**
     * Get optimized URL for an image
     * @param {string} publicIdOrUrl - Cloudinary public_id or external URL
     * @param {number} width - Desired width
     * @returns {string} URL
     */
    getOptimizedUrl(publicIdOrUrl, width = 800) {
        if (!publicIdOrUrl) return '';
        
        // If it's already a full URL (like Unsplash), just return it or attempt simple transforms if supported
        if (publicIdOrUrl.startsWith('http')) {
            if (publicIdOrUrl.includes('unsplash.com')) {
                // Add unsplash optimization params if not present
                const url = new URL(publicIdOrUrl);
                url.searchParams.set('w', width);
                url.searchParams.set('q', 'auto');
                url.searchParams.set('fm', 'webp');
                return url.toString();
            }
            return publicIdOrUrl;
        }

        // It's a Cloudinary public ID
        return `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_${width},f_auto,q_auto/${publicIdOrUrl}`;
    },

    /**
     * Get a thumbnail URL
     * @param {string} publicIdOrUrl 
     * @param {number} width 
     * @returns {string} URL
     */
    getProductThumbnail(publicIdOrUrl, width = 300) {
        if (!publicIdOrUrl) return '';
        
        if (publicIdOrUrl.startsWith('http')) {
             if (publicIdOrUrl.includes('unsplash.com')) {
                const url = new URL(publicIdOrUrl);
                url.searchParams.set('w', width);
                url.searchParams.set('q', 'auto');
                url.searchParams.set('fm', 'webp');
                url.searchParams.set('fit', 'crop');
                return url.toString();
            }
            return publicIdOrUrl;
        }

        return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_${width},h_${width},f_auto,q_auto/${publicIdOrUrl}`;
    }
};
