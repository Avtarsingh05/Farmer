import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle, Camera } from 'lucide-react';
import { uploadImage, validateImageFile } from '@/services/cloudinaryService';
import { CloudinaryImage } from '@/types';
import { cn } from '@/utils/cn';

const compressImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original if canvas fails
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file); // Fallback
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback
    };
    reader.onerror = () => resolve(file); // Fallback
  });
};

interface ImageUploaderProps {
  images: CloudinaryImage[];
  onImagesChange: (images: CloudinaryImage[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadProgress {
  fileId: string;
  file: File;
  progress: number;
  error?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  className
}: ImageUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const availableSlots = maxImages - images.length - uploads.length;
    
    if (availableSlots <= 0) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    let updatedImages = [...images];
    
    for (const originalFile of filesToUpload) {
      const fileId = Math.random().toString(36).substring(7);
      
      setUploads(prev => [...prev, { fileId, file: originalFile, progress: 0 }]);
      
      try {
        const file = await compressImage(originalFile);

        const validationError = validateImageFile(file);
        if (validationError) {
          setUploads(prev => prev.map(u => 
            u.fileId === fileId ? { ...u, error: validationError } : u
          ));
          continue;
        }
        
        const result = await uploadImage(file, {
          onProgress: (progress: number) => {
            setUploads(prev => prev.map(u => 
              u.fileId === fileId ? { ...u, progress } : u
            ));
          }
        });
        
        setUploads(prev => prev.filter(u => u.fileId !== fileId));
        updatedImages = [...updatedImages, {
          publicId: result.publicId,
          secureUrl: result.secureUrl,
          width: result.width,
          height: result.height,
          format: result.format,
        }];
        onImagesChange(updatedImages);
        
      } catch (error: any) {
        setUploads(prev => prev.map(u => 
          u.fileId === fileId ? { ...u, error: error.message || 'Upload failed' } : u
        ));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const removeUpload = (fileId: string) => {
    setUploads(prev => prev.filter(u => u.fileId !== fileId));
  };

  const canUpload = images.length + uploads.length < maxImages;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div key={image.publicId} className="relative aspect-square rounded-lg border border-neutral-200 overflow-hidden group bg-neutral-50">
            <img 
              src={image.secureUrl} 
              alt={`Uploaded ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-neutral-900/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-900"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 bg-neutral-900/75 text-white text-[10px] px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
          </div>
        ))}

        {/* Uploading Statuses */}
        {uploads.map((upload) => (
          <div key={upload.fileId} className="relative aspect-square rounded-lg border border-neutral-200 bg-neutral-50 p-2 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs text-neutral-500 truncate max-w-[80%]">
                {upload.file.name}
              </span>
              <button 
                type="button" 
                onClick={() => removeUpload(upload.fileId)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {upload.error ? (
              <div className="flex flex-col items-center justify-center text-center text-red-500 py-2">
                <AlertCircle className="w-5 h-5 mb-1" />
                <span className="text-[10px] leading-tight line-clamp-2">{upload.error}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 block text-right">
                  {upload.progress}%
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Drop Zone Box */}
        {canUpload && (
          <div className="aspect-square flex flex-col gap-2">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors",
                dragActive ? "border-primary bg-primary-50/20" : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/50"
              )}
            >
              <UploadCloud className="w-5 h-5 text-neutral-400 mb-1" />
              <span className="text-xs font-medium text-neutral-700">Upload</span>
            </div>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-none h-10 rounded-lg border border-neutral-200 bg-white flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors text-xs font-medium text-neutral-700"
            >
              <Camera className="w-4 h-4 text-neutral-500" />
              Take Photo
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
