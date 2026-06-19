import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, ScanProgress } from '@shared/types'

const electronAPI: ElectronAPI = {
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),

  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan:directory', dirPath),

  onScanProgress: (callback: (progress: ScanProgress) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: ScanProgress): void => {
      callback(progress)
    }
    ipcRenderer.on('scan:progress', handler)
    return () => {
      ipcRenderer.removeListener('scan:progress', handler)
    }
  },

  getThumbnail: (filePath: string, size: 'small' | 'medium' | 'large') =>
    ipcRenderer.invoke('thumbnail:get', filePath, size),

  getMetadata: (filePath: string) => ipcRenderer.invoke('metadata:get', filePath),

  readFileForPreview: (filePath: string) => ipcRenderer.invoke('preview:readFile', filePath),

  readOriginalForPreview: (filePath: string) => ipcRenderer.invoke('preview:readOriginal', filePath),

  getLivePhotoVideoPath: (heicPath: string) => ipcRenderer.invoke('livephoto:getVideoPath', heicPath),

  clearThumbnailCache: () => ipcRenderer.invoke('cache:clear')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
