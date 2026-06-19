import { app } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { createHash } from 'crypto'

const MAX_CACHE_SIZE = 500 * 1024 * 1024 // 500MB

interface CacheEntry {
  key: string
  size: number
  lastAccess: number
  cachePath: string
}

class CacheService {
  private baseDir: string
  private manifestPath: string
  private entries: Map<string, CacheEntry> = new Map()

  constructor() {
    this.baseDir = join(app.getPath('userData'), 'thumbnails')
    this.manifestPath = join(this.baseDir, 'manifest.json')
  }

  async init(): Promise<void> {
    await fs.mkdir(join(this.baseDir, 'small'), { recursive: true })
    await fs.mkdir(join(this.baseDir, 'medium'), { recursive: true })
    await fs.mkdir(join(this.baseDir, 'large'), { recursive: true })
    await fs.mkdir(join(this.baseDir, 'preview'), { recursive: true })

    try {
      const data = await fs.readFile(this.manifestPath, 'utf-8')
      const parsed: Record<string, CacheEntry> = JSON.parse(data)
      this.entries = new Map(Object.entries(parsed))
    } catch {
      this.entries = new Map()
    }
  }

  private async saveManifest(): Promise<void> {
    const obj: Record<string, CacheEntry> = {}
    for (const [key, entry] of this.entries) {
      obj[key] = entry
    }
    await fs.writeFile(this.manifestPath, JSON.stringify(obj, null, 2))
  }

  getCachePath(key: string, size: 'small' | 'medium' | 'large'): string {
    return join(this.baseDir, size, `${key}.jpg`)
  }

  async get(key: string, size: 'small' | 'medium' | 'large'): Promise<string | null> {
    await this.init()
    const entry = this.entries.get(key)
    if (!entry) return null

    try {
      await fs.access(entry.cachePath)
      entry.lastAccess = Date.now()
      this.entries.set(key, entry)

      const data = await fs.readFile(entry.cachePath)
      return `data:image/jpeg;base64,${data.toString('base64')}`
    } catch {
      this.entries.delete(key)
      return null
    }
  }

  async set(key: string, size: 'small' | 'medium' | 'large', buffer: Buffer): Promise<string> {
    await this.init()
    const cachePath = this.getCachePath(key, size)

    await fs.writeFile(cachePath, buffer)
    const stat = await fs.stat(cachePath)

    const entry: CacheEntry = {
      key,
      size: stat.size,
      lastAccess: Date.now(),
      cachePath
    }

    this.entries.set(key, entry)
    await this.evict()
    await this.saveManifest()

    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  }

  private async evict(): Promise<void> {
    let totalSize = 0
    for (const entry of this.entries.values()) {
      totalSize += entry.size
    }

    if (totalSize <= MAX_CACHE_SIZE) return

    // Sort by last access (oldest first) and evict
    const sorted = Array.from(this.entries.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess)

    for (const [key, entry] of sorted) {
      try {
        await fs.unlink(entry.cachePath)
      } catch {
        // File might already be gone
      }
      this.entries.delete(key)
      totalSize -= entry.size
      if (totalSize <= MAX_CACHE_SIZE * 0.8) break
    }
  }

  async clear(): Promise<void> {
    await this.init()
    for (const entry of this.entries.values()) {
      try {
        await fs.unlink(entry.cachePath)
      } catch {
        // File might already be gone
      }
    }
    this.entries.clear()
    await this.saveManifest()
  }
}

export const cacheService = new CacheService()
