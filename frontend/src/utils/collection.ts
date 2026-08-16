import type { CollectionItem } from "../types/collection";
import type { Shape } from "../types/shape";

const COLLECTION_KEY = "doradora-collection";

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

export function saveCollectionItem(
  shape: Shape,
  image: string,
): CollectionItem | null {
  if (!image) return null;

  try {
    const currentCollection = getCollection();

    const newItem: CollectionItem = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shape,
      image,
      createdAt: new Date().toISOString(),
    };

    const updatedCollection = [newItem, ...currentCollection];
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollection));

    return newItem;
  } catch (error) {
    console.error("Failed to save collection item to localStorage:", error);
    return null;
  }
}
