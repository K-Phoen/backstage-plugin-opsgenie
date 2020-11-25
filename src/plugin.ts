import { createApiFactory, createPlugin, createRouteRef, discoveryApiRef } from '@backstage/core';
import { OpsGenieApi, opsgenieApiRef } from './api';

export const rootRouteRef = createRouteRef({
  path: '',
  title: 'opsgenie',
});

export const plugin = createPlugin({
  id: 'opsgenie',
  apis: [
    createApiFactory({
      api: opsgenieApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new OpsGenieApi({ discoveryApi: discoveryApi }),
    }),
  ],
});
