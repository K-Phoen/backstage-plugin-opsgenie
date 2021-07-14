import { OpsgenieApi, opsgenieApiRef } from './api';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

export const opsgenieRouteRef = createRouteRef({
  title: 'opsgenie',
});

export const opsGeniePlugin = createPlugin({
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
  routes: {
    explore: opsgenieRouteRef,
  },
});
