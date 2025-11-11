/**
 * Image Compression Service
 * Handles image compression and optimization
 */

// Note: expo-image-manipulator may not be available - using placeholder
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { CompressionOptions } from '../types/media';
import * as FileSystem from 'expo-file-system';

class ImageCompressionService {
  /**
   * Compress image
   */
  async compressImage(uri: string, options: CompressionOptions = {}): Promise<string> {
    try {
      const {
        quality = 0.8,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'jpeg',
      } = options;

      // Get image dimensions
      const { width, height } = await this.getImageDimensions(uri);

      // Calculate resize dimensions
      let resizeWidth = width;
      let resizeHeight = height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          resizeWidth = maxWidth;
          resizeHeight = maxWidth / aspectRatio;
        } else {
          resizeHeight = maxHeight;
          resizeWidth = maxHeight * aspectRatio;
        }
      }

      // TODO: Install expo-image-manipulator for actual compression
      // const manipulated = await manipulateAsync(
      //   uri,
      //   [
      //     {
      //       resize: {
      //         width: Math.round(resizeWidth),
      //         height: Math.round(resizeHeight),
      //       },
      //     },
      //   ],
      //   {
      //     compress: quality,
      //     format: format === 'png' ? SaveFormat.PNG : format === 'webp' ? SaveFormat.WEBP : SaveFormat.JPEG,
      //   }
      // );
      // return manipulated.uri;

      // Placeholder: return original URI
      // In production, implement actual compression
      console.warn('Image compression requires expo-image-manipulator');
      return uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original URI if compression fails
      return uri;
    }
  }

  /**
   * Process document (enhance, crop, optimize)
   */
  async processDocument(uri: string, options: CompressionOptions = {}): Promise<string> {
    try {
      const { quality = 0.9, maxWidth = 2480, maxHeight = 3508 } = options; // A4 dimensions at 300 DPI

      // Get dimensions
      const { width, height } = await this.getImageDimensions(uri);

      // Calculate resize to maintain aspect ratio but fit within max dimensions
      let resizeWidth = width;
      let resizeHeight = height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          resizeWidth = maxWidth;
          resizeHeight = maxWidth / aspectRatio;
        } else {
          resizeHeight = maxHeight;
          resizeWidth = maxHeight * aspectRatio;
        }
      }

      // TODO: Install expo-image-manipulator for actual document processing
      // const manipulated = await manipulateAsync(
      //   uri,
      //   [
      //     {
      //       resize: {
      //         width: Math.round(resizeWidth),
      //         height: Math.round(resizeHeight),
      //       },
      //     },
      //   ],
      //   {
      //     compress: quality,
      //     format: SaveFormat.JPEG,
      //   }
      // );
      // return manipulated.uri;

      // Placeholder: return original URI
      console.warn('Document processing requires expo-image-manipulator');
      return uri;
    } catch (error) {
      console.error('Error processing document:', error);
      return uri;
    }
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      // Using Image component to get dimensions
      // In production, use a library like react-native-image-size
      const Image = require('react-native').Image;
      
      Image.getSize(
        uri,
        (width: number, height: number) => {
          resolve({ width, height });
        },
        (error: Error) => {
          console.error('Error getting image dimensions:', error);
          // Default dimensions
          resolve({ width: 1920, height: 1080 });
        }
      );
    });
  }

  /**
   * Get file size
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        return info.size || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Optimize image for web upload
   */
  async optimizeForWeb(uri: string): Promise<string> {
    return this.compressImage(uri, {
      quality: 0.7,
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'jpeg',
    });
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(uri: string, size: number = 200): Promise<string> {
    try {
      // TODO: Install expo-image-manipulator for thumbnail creation
      // const manipulated = await manipulateAsync(
      //   uri,
      //   [
      //     {
      //       resize: {
      //         width: size,
      //         height: size,
      //       },
      //     },
      //   ],
      //   {
      //     compress: 0.7,
      //     format: SaveFormat.JPEG,
      //   }
      // );
      // return manipulated.uri;

      // Placeholder: return original URI
      console.warn('Thumbnail creation requires expo-image-manipulator');
      return uri;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return uri;
    }
  }
}

export const imageCompressionService = new ImageCompressionService();

