/**
 * CollisionSystem — pure AABB collision helpers.
 *
 * No Pixi, no DOM, no ECS imports. Pure functions on axis-aligned bounding boxes.
 * Any overlap between runner hitbox and obstacle hitbox = instant death trigger.
 */

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Returns true if two AABBs overlap (any overlap = collision).
 * Uses standard separating axis theorem for rectangles.
 */
export const checkCollision = (a: AABB, b: AABB): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
