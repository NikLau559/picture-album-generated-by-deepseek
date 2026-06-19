import ffmpeg from 'fluent-ffmpeg'
import { join, dirname } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import sharp from 'sharp'

// Set ffmpeg path
try {
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
  ffmpeg.setFfmpegPath(ffmpegPath.path)
} catch {
  // ffmpeg might not be available
}

export async function extractVideoFrame(videoPath: string, size: number): Promise<Buffer> {
  const tmpDir = join(tmpdir(), 'picture-album')
  await fs.mkdir(tmpDir, { recursive: true })

  const outputFileName = `thumb-${randomUUID()}.jpg`
  const outputPath = join(tmpDir, outputFileName)

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', async () => {
        try {
          const buffer = await sharp(outputPath)
            .resize(size, size, { fit: 'cover', withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer()

          // Clean up temp file
          try { await fs.unlink(outputPath) } catch {}

          // Add a video badge overlay indicator by compositing a play icon
          // For performance, we skip the overlay in thumbnails — add via CSS instead
          resolve(buffer)
        } catch (err) {
          reject(err)
        }
      })
      .on('error', (err) => {
        reject(err)
      })
      .screenshots({
        count: 1,
        timemarks: ['10%'],
        size: `${size}x?`,
        filename: outputFileName,
        folder: tmpDir
      })
  })
}

export async function probeVideoMetadata(videoPath: string): Promise<{
  duration: number
  dimensions: { width: number; height: number }
  codec: string
} | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        resolve(null)
        return
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) {
        resolve(null)
        return
      }

      resolve({
        duration: metadata.format.duration ?? 0,
        dimensions: {
          width: videoStream.width ?? 0,
          height: videoStream.height ?? 0
        },
        codec: videoStream.codec_name ?? 'unknown'
      })
    })
  })
}
