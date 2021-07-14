import { opsGeniePlugin, opsgenieRouteRef } from './plugin';
import { createComponentExtension, createRoutableExtension } from '@backstage/core-plugin-api';

export const OpsgeniePage = opsGeniePlugin.provide(
  createRoutableExtension({
    component: () => import('./components/OpsgeniePage').then(m => m.OpsgeniePage),
    mountPoint: opsgenieRouteRef,
  }),
);

export const EntityOpsgenieAlertsCard = opsGeniePlugin.provide(
  createComponentExtension({
    component: {
      lazy: () => import('./components/Entity').then(m => m.AlertsCard),
    },
  }),
);