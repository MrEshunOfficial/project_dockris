export const ENTITY_TYPES = {
  TODO: 'todo',
  ROUTINE: 'routine',
  APPOINTMENT: 'appointment',
  SPECIAL_EVENT: 'specialevent'  // Using SPECIAL_EVENT to be more explicit
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];