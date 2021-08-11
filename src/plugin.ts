import { OpsgenieApi, opsgenieApiRef } from './api';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { AnalitycsApi, analyticsApiRef } from './analytics';

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

    createApiFactory({
      api: analyticsApiRef,
      deps: { opsgenieApi: opsgenieApiRef },
      factory: ({ opsgenieApi }) => {
        return new AnalitycsApi({opsgenieApi: opsgenieApi});
      },
    }),
  ],
  routes: {
    explore: opsgenieRouteRef,
  },
});
