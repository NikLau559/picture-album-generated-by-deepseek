import sharp from 'sharp'
import { extname } from 'path'
import { createHash } from 'crypto'
import { heicToJpeg } from './heic.service'
import { extractVideoFrame } from './video-thumbnail.service'
import { cacheService } from './cache.service'

const SIZE_MAP = {
  small: 200,
  medium: 400,
  large: 800,
  preview: 1600
}

type ThumbSize = keyof typeof SIZE_MAP

class ThumbnailService {
  async getThumbnail(
    filePath: string,
    size: ThumbSize
  ): Promise<string> {
    const ext = extname(filePath).toLowerCase()
    const targetSize = SIZE_MAP[size]
    const isPreview = size === 'preview'

    // Check cache first
    const cacheKey = this.buildCacheKey(filePath)
    const cached = await cacheService.get(cacheKey, size)
    if (cached) return cached

    let buffer: Buffer

    try {
      if (ext === '.heic' || ext === '.heif') {
        buffer = await this.generateHeicPreview(filePath, targetSize, isPreview)
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.bmp'].includes(ext)) {
        buffer = await this.generateImagePreview(filePath, targetSize, isPreview)
      } else {
        // Video files — don't resize, just extract frame
        buffer = await this.generateVideoThumbnail(filePath, isPreview ? 800 : targetSize)
      }

      return cacheService.set(cacheKey, size, buffer)
    } catch (err) {
      console.error(`Failed to generate thumbnail for ${filePath}:`, err)
      return this.getPlaceholderThumbnail(Math.min(targetSize, 400))
    }
  }

  private buildCacheKey(filePath: string): string {
    return createHash('sha256')
      .update(filePath)
      .digest('hex')
      .substring(0, 16)
  }

  private async generateImagePreview(
    filePath: string,
    size: number,
    isPreview: boolean
  ): Promise<Buffer> {
    if (isPreview) {
      // Fit within box, keep aspect ratio, good quality
      return sharp(filePath)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
    }
    // Square crop for thumbnails
    return sharp(filePath)
      .resize(size, size, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer()
  }

  private async generateHeicPreview(
    filePath: string,
    size: number,
    isPreview: boolean
  ): Promise<Buffer> {
    const jpegBuffer = await heicToJpeg(filePath)
    if (isPreview) {
      // Fit within box, keep aspect ratio
      return sharp(jpegBuffer)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()
    }
    // Square crop for thumbnails
    return sharp(jpegBuffer)
      .resize(size, size, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer()
  }

  private async generateVideoThumbnail(filePath: string, size: number): Promise<Buffer> {
    return extractVideoFrame(filePath, size)
  }

  private async getPlaceholderThumbnail(size: number): Promise<string> {
    const placeholder = sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: { r: 30, g: 41, b: 59 }
      }
    })
      .jpeg({ quality: 60 })
      .toBuffer()

    return `data:image/jpeg;base64,${(await placeholder).toString('base64')}`
  }
}

export const thumbnailService = new ThumbnailService()
