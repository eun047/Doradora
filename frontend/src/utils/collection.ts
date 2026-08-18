import {
  COLLECTION_KEY,
  COMPRESS_QUALITY,
  MAX_COMPRESS_HEIGHT,
  MAX_COMPRESS_WIDTH,
} from "../constants/collection";
import type { CollectionItem } from "../types/collection";
import type { Shape } from "../types/shape";

/**
 * Canvas를 이용해 Base64 이미지를 지정된 크기/품질로 압축합니다.
 */
export function compressImage(
  imageDataUrl: string,
  maxWidth = MAX_COMPRESS_WIDTH,
  maxHeight = MAX_COMPRESS_HEIGHT,
  quality = COMPRESS_QUALITY,
): Promise<string> {
  return new Promise((resolve) => {
    if (!imageDataUrl) {
      resolve(imageDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (err) {
        console.warn("Canvas 압축 실패, 원본 사용:", err);
        resolve(imageDataUrl);
      }
    };

    img.onerror = (err) => {
      console.warn("압축을 위한 이미지 로드 실패:", err);
      resolve(imageDataUrl);
    };

    img.src = imageDataUrl;
  });
}

export function getCollection(): CollectionItem[] {
  try {
    const rawData = localStorage.getItem(COLLECTION_KEY);
    if (!rawData) return [];
    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed)) return [];
    return parsed as CollectionItem[];
  } catch (error) {
    console.error("Failed to load collection from localStorage:", error);
    return [];
  }
}

/**
 * Collection에 새로운 항목을 압축 후 저장합니다.
 * QuotaExceededError 등 저장 실패 시 false를 반환합니다.
 */
export async function saveCollectionItem(
  shape: Shape,
  image: string,
): Promise<boolean> {
  if (!image) return false;

  try {
    const compressedImage = await compressImage(
      image,
      MAX_COMPRESS_WIDTH,
      MAX_COMPRESS_HEIGHT,
      COMPRESS_QUALITY,
    );

    const currentCollection = getCollection();

    const newItem: CollectionItem = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shape,
      image: compressedImage,
      createdAt: new Date().toISOString(),
    };

    const updatedCollection = [newItem, ...currentCollection];
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollection));

    return true;
  } catch (error) {
    console.error("Failed to save collection item to localStorage:", error);
    return false;
  }
}

/**
 * id를 기준으로 localStorage에서 Collection 항목을 삭제합니다.
 */
export function deleteCollectionItem(id: string): boolean {
  if (!id) return false;

  try {
    const currentCollection = getCollection();
    const filteredCollection = currentCollection.filter(
      (item) => item.id !== id,
    );
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(filteredCollection));
    return true;
  } catch (error) {
    console.error("Failed to delete collection item from localStorage:", error);
    return false;
  }
}
