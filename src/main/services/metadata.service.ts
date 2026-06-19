import { readFile } from 'fs/promises'
import exifreader from 'exifreader'
import { stat } from 'fs/promises'
import { probeVideoMetadata } from './video-thumbnail.service'
import { heicToJpegBuffer } from './heic.service'
import type { MediaMetadata } from '@shared/types'

const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4', '.webm', '.mkv', '.avi'])

class MetadataService {
  async extractMetadata(filePath: string): Promise<MediaMetadata | null> {
    try {
      const ext = filePath.toLowerCase().split('.').pop()
      const isVideo = ext && VIDEO_EXTENSIONS.has(`.${ext}`)

      if (isVideo) {
        return this.extractVideoMetadata(filePath)
      }
      return this.extractExifMetadata(filePath)
    } catch {
      return null
    }
  }

  private async extractExifMetadata(filePath: string): Promise<MediaMetadata> {
    let fileBuffer: Buffer
    let tags: Record<string, unknown>

    const ext = filePath.toLowerCase().split('.').pop()

    try {
      fileBuffer = await readFile(filePath)

      // For HEIC files, convert to JPEG first for better EXIF reading
      if (ext === 'heic' || ext === 'heif') {
        try {
          const jpegBuffer = await heicToJpegBuffer(fileBuffer)
          tags = (await exifreader.load(jpegBuffer, { expanded: true })) as unknown as Record<string, unknown>
        } catch {
          tags = (await exifreader.load(fileBuffer, { expanded: true })) as unknown as Record<string, unknown>
        }
      } else {
        tags = (await exifreader.load(fileBuffer, { expanded: true })) as unknown as Record<string, unknown>
      }
    } catch {
      return {
        dateTaken: null,
        dimensions: null,
        orientation: 1,
        cameraModel: null,
        gps: null,
        duration: null
      }
    }

    const exif = (tags.exif as Record<string, unknown> | undefined) ?? {}
    const file = (tags.file as Record<string, unknown> | undefined) ?? {}
    const gpsData = (tags.gps as Record<string, unknown> | undefined) ?? {}

    // Extract date taken
    const dateTimeOriginal = exif['DateTimeOriginal'] as { description?: string } | undefined
    const dateTaken = dateTimeOriginal?.description ?? null

    // Extract dimensions
    const imageWidth = (file['Image Width'] as { value?: number })?.value
    const imageHeight = (file['Image Height'] as { value?: number })?.value
    const dimensions = imageWidth && imageHeight
      ? { width: imageWidth, height: imageHeight }
      : null

    // Extract orientation
    const orientation = ((exif['Orientation'] as { value?: number })?.value) ?? 1

    // Extract camera model
    const make = (exif['Make'] as { description?: string })?.description ?? ''
    const model = (exif['Model'] as { description?: string })?.description ?? ''
    const cameraModel = [make, model].filter(Boolean).join(' ') || null

    // Extract GPS
    const lat = (gpsData['Latitude'] as number | undefined)
    const lng = (gpsData['Longitude'] as number | undefined)
    const gps = (lat != null && lng != null) ? { lat, lng } : null

    return {
      dateTaken,
      dimensions,
      orientation,
      cameraModel,
      gps,
      duration: null
    }
  }

  private async extractVideoMetadata(filePath: string): Promise<MediaMetadata> {
    const stats = await stat(filePath)
    const probeResult = await probeVideoMetadata(filePath)

    return {
      dateTaken: stats.mtime.toISOString(),
      dimensions: probeResult?.dimensions ?? null,
      orientation: 1,
      cameraModel: null,
      gps: null,
      duration: probeResult?.duration ?? null
    }
  }
}

export const metadataService = new MetadataService()
