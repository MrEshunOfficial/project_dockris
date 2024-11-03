export const ENTITY_TYPES = {
  TODO: 'todo',
  ROUTINE: 'routine',
  APPOINTMENT: 'appointment',
  EVENTS: 'specialevent'
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];