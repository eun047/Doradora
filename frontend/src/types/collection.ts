import type { Shape } from "./shape";

export interface CollectionItem {
  id: string;
  shape: Shape;
  image: string;
  createdAt: string;
}
