import { opsGeniePlugin, opsgenieRouteRef } from './plugin';
import { createComponentExtension, createRoutableExtension } from '@backstage/core-plugin-api';

export const OpsgeniePage = opsGeniePlugin.provide(
  createRoutableExtension({
    name: 'OpsgeniePage',
    component: () => import('./components/OpsgeniePage').then(m => m.OpsgeniePage),
    mountPoint: opsgenieRouteRef,
  }),
);

export const EntityOpsgenieAlertsCard = opsGeniePlugin.provide(
  createComponentExtension({
    name: 'EntityOpsgenieAlertsCard',
    component: {
      lazy: () => import('./components/Entity').then(m => m.AlertsCard),
    },
  }),
);
export const EntityOpsgenieOnCallListCard = opsGeniePlugin.provide(
  createComponentExtension({
    name: 'EntityOpsgenieOnCallListCard',
    component: {
      lazy: () => import('./components/Entity').then(m => m.OnCallListCard),
    },
  }),
);
