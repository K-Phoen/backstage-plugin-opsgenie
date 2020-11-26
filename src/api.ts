import { Entity } from '@backstage/catalog-model';
import { createApiRef, DiscoveryApi } from '@backstage/core';

import { Alert } from './types';

export const opsgenieApiRef = createApiRef<OpsGenie>({
  id: 'plugin.opsgenie.service',
  description: 'Used to make requests towards OpsGenie API',
});

type AlertsFetchOpts = {
  limit?: number
}

export interface OpsGenie {
  getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]>;

  getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]>;
  getAlertDetailsURL(alert: Alert): string;
}

interface AlertsResponse {
  data: Alert[];
}

const DEFAULT_PROXY_PATH = '/opsgenie/api';

type Options = {
  discoveryApi: DiscoveryApi;

  /**
   * Domain used by users to access OpsGenie web UI.
   * Example: https://my-app.app.eu.opsgenie.com/
   */
  domain: string;

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
  private readonly domain: string;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.domain = opts.domain;
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

  async getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 50;

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}`);

    return response.data;
  }

  async getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 5;

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}&query=tag:"service:${entity.metadata.name}"`);

    return response.data;
  }

  getAlertDetailsURL(alert: Alert): string {
    return `${this.domain}/alert/detail/${alert.id}/details`;
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }
}