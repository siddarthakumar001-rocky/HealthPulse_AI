/**
 * HealthPulse AI - Image Privacy & EXIF Stripper
 * Re-encodes user clinical images onto an off-screen canvas to permanently remove EXIF / GPS / device metadata
 * and compresses image files before transmission.
 */

export interface ProcessedImageResult {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB raw limit
const TARGET_MAX_DIMENSION = 1280; // 1280px max width/height for clinical triage

/**
 * Validates, compresses, and strips EXIF metadata from a user-uploaded clinical image.
 */
export async function sanitizeAndCompressImage(file: File): Promise<ProcessedImageResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image format (${file.type}). Please upload a JPEG, PNG, or WebP image.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 4 MB limit.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format or corrupted file"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize down proportionally if dimension exceeds threshold
        if (width > TARGET_MAX_DIMENSION || height > TARGET_MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * TARGET_MAX_DIMENSION) / width);
            width = TARGET_MAX_DIMENSION;
          } else {
            width = Math.round((width * TARGET_MAX_DIMENSION) / height);
            height = TARGET_MAX_DIMENSION;
          }
        }

        // Draw onto clean canvas (strips all EXIF, GPS, device tags)
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error("Canvas context initialization failed"));
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as clean WebP (or JPEG fallback)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to process clean image blob"));
            }

            const cleanFile = new File([blob], `clinical_scan_${Date.now()}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(cleanFile);

            resolve({
              file: cleanFile,
              previewUrl,
              width,
              height,
              sizeBytes: blob.size,
            });
          },
          'image/webp',
          0.85 // quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
