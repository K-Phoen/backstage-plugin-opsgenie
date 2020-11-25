import { createApiRef, DiscoveryApi } from '@backstage/core';

import { Alert } from './types';

export const opsgenieApiRef = createApiRef<OpsGenie>({
  id: 'plugin.opsgenie.service',
  description: 'Used to make requests towards OpsGenie API',
});

export interface OpsGenie {
  getAlerts(): Promise<Alert[]>;
}

interface AlertsResponse {
  data: Alert[];
}

const DEFAULT_PROXY_PATH = '/opsgenie/api';

type Options = {
  discoveryApi: DiscoveryApi;
  /**
   * Path to use for requests via the proxy, defaults to /opsgenie/api
   */
  proxyPath?: string;
};

/**
 * API to talk to OpsGenie.
 */
export class OpsGenieApi implements OpsGenie {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.proxyPath = opts.proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const apiUrl = await this.apiUrl();

    const resp = await fetch(`${apiUrl}${input}`, init);
    if (!resp.ok) {
      throw new Error(`Request failed with ${resp.status} ${resp.statusText}`);
    }

    return await resp.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await this.fetch<AlertsResponse>(`/v2/alerts`);

    return response.data;
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }
}