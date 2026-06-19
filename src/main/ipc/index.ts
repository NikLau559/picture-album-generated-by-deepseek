import { ipcMain, dialog } from 'electron'
import { scanDirectoryService } from '../services/scanner'
import { thumbnailService } from '../services/thumbnail-generator'
import { metadataService } from '../services/metadata.service'
import { cacheService } from '../services/cache.service'
import { detectLivePhotos, getLivePhotoVideoPath } from '../services/live-photo.service'
import type { ScanProgress } from '@shared/types'

export function registerIpcHandlers(): void {
  // Directory selection
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Directory scanning
  ipcMain.handle('scan:directory', async (event, dirPath: string) => {
    const onProgress = (progress: ScanProgress): void => {
      event.sender.send('scan:progress', progress)
    }
    const result = await scanDirectoryService(dirPath, onProgress)
    const livePhotoPairs = detectLivePhotos(result.items)
    return { ...result, livePhotoPairs }
  })

  // Thumbnail
  ipcMain.handle('thumbnail:get', async (_event, filePath: string, size: string) => {
    return thumbnailService.getThumbnail(filePath, size as 'small' | 'medium' | 'large' | 'preview')
  })

  // Metadata
  ipcMain.handle('metadata:get', async (_event, filePath: string) => {
    return metadataService.extractMetadata(filePath)
  })

  // Preview — use thumbnail service with preview size (1600px), cached on disk
  ipcMain.handle('preview:readFile', async (_event, filePath: string) => {
    return thumbnailService.getThumbnail(filePath, 'preview')
  })

  // Live Photo
  ipcMain.handle('livephoto:getVideoPath', async (_event, heicPath: string) => {
    return getLivePhotoVideoPath(heicPath)
  })

  // Cache
  ipcMain.handle('cache:clear', async () => {
    await cacheService.clear()
  })
}
