import { OpsgenieApi, opsgenieApiRef } from './api';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { AnalitycsApi, analyticsApiRef, DEFAULT_BUSINESS_HOURS_END, DEFAULT_BUSINESS_HOURS_START } from './analytics';

export const opsgenieRouteRef = createRouteRef({
  id: 'opsgenie',
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
          readOnly: configApi.getOptionalBoolean('opsgenie.readOnly') ?? false,
          proxyPath: configApi.getOptionalString('opsgenie.proxyPath'),
        });
      },
    }),

    createApiFactory({
      api: analyticsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => {
        return new AnalitycsApi({
          businessHours: {
            start: configApi.getOptionalNumber('opsgenie.analytics.businessHours.start') || DEFAULT_BUSINESS_HOURS_START,
            end: configApi.getOptionalNumber('opsgenie.analytics.businessHours.end') || DEFAULT_BUSINESS_HOURS_END,
          },
        });
      },
    }),
  ],
  routes: {
    explore: opsgenieRouteRef,
  },
});
