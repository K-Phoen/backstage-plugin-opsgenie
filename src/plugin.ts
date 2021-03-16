import { configApiRef, createApiFactory, createPlugin, createRouteRef, discoveryApiRef, identityApiRef } from '@backstage/core';
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
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef, configApi: configApiRef },
      factory: ({ discoveryApi, identityApi, configApi }) => {
        return new OpsgenieApi({
          discoveryApi: discoveryApi,
          identityApi: identityApi,
          domain: configApi.getString('opsgenie.domain'),
          proxyPath: configApi.getOptionalString('opsgenie.proxyPath'),
        });
      },
    }),
  ],
});
