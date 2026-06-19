import { readFile } from 'fs/promises'
import convert from 'heic-convert'

export async function heicToJpeg(inputPath: string): Promise<Buffer> {
  const inputBuffer = await readFile(inputPath)

  const jpegBuffer = await convert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format: 'JPEG',
    quality: 0.92
  })

  return Buffer.from(jpegBuffer)
}

export async function heicToJpegBuffer(inputBuffer: Buffer): Promise<Buffer> {
  const jpegBuffer = await convert({
    buffer: inputBuffer as unknown as ArrayBuffer,
    format: 'JPEG',
    quality: 0.92
  })

  return Buffer.from(jpegBuffer)
}
