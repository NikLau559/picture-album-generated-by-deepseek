import type { MediaItem } from '@shared/types'

let livePhotoPairs: Map<string, string> = new Map()

// Strip the inner extension from doubled extensions like "IMG_0008.JPG.jpg"
// by finding the last "." in the basename
function getMatchKey(baseName: string): string {
  const lastDot = baseName.lastIndexOf('.')
  return lastDot > 0 ? baseName.substring(0, lastDot).toLowerCase() : baseName.toLowerCase()
}

export function detectLivePhotos(items: MediaItem[]): Record<string, string> {
  const pairs: Record<string, string> = {}
  const photoMap = new Map<string, MediaItem>()
  const movMap = new Map<string, MediaItem>()

  // Separate into photo and MOV, using root name as key
  for (const item of items) {
    const ext = item.extension.toLowerCase()
    const rootKey = getMatchKey(item.baseName)
    if (ext === '.heic' || ext === '.heif' || ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      photoMap.set(rootKey, item)
    } else if (ext === '.mov') {
      movMap.set(rootKey, item)
    }
  }

  // Match pairs (photo + MOV with same root name)
  for (const [rootKey, photoItem] of photoMap) {
    const movItem = movMap.get(rootKey)
    if (movItem) {
      photoItem.subType = 'livePhoto'
      photoItem.isLivePhoto = true
      photoItem.livePhotoVideoPath = movItem.filePath
      pairs[photoItem.filePath] = movItem.filePath

      // Remove the MOV as a standalone item
      const idx = items.indexOf(movItem)
      if (idx >= 0) {
        items.splice(idx, 1)
      }
    }
  }

  livePhotoPairs = new Map(Object.entries(pairs))
  return pairs
}

export function getLivePhotoVideoPath(heicPath: string): string | null {
  return livePhotoPairs.get(heicPath) ?? null
}
