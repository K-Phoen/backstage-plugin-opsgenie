import { configApiRef, createApiFactory, createPlugin, createRouteRef, discoveryApiRef } from '@backstage/core';
import { OpsgenieApi, opsgenieApiRef } from './api';

export const rootRouteRef = createRouteRef({
  path: '',
  title: 'opsgenie',
});

export const plugin = createPlugin({
  id: 'opsgenie',
  apis: [
    createApiFactory({
      api: opsgenieApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ discoveryApi, configApi }) => {
        return new OpsgenieApi({
          discoveryApi: discoveryApi,
          domain: configApi.getString('opsgenie.domain'),
          proxyPath: configApi.getOptionalString('opsgenie.proxyPath'),
        });
      },
    }),
  ],
});
