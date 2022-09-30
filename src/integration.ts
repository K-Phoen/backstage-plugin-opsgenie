import { Entity } from "@backstage/catalog-model";

export const OPSGENIE_ANNOTATION = 'opsgenie.com/component-selector';
export const OPSGENIE_TEAM_ANNOTATION = 'opsgenie.com/team';
export const OPSGENIE_IS_SCHEDULE_ANNOTATION = 'opsgenie.com/isSchedule';

export const isOpsgenieAvailable = (entity: Entity) => Boolean(entity.metadata.annotations?.[OPSGENIE_ANNOTATION]);
export const isOpsgenieOnCallListAvailable = (entity: Entity) => Boolean(entity.metadata.annotations?.[OPSGENIE_TEAM_ANNOTATION]);
