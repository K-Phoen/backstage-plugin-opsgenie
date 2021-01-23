import { Entity } from '@backstage/catalog-model';
import { createApiRef, DiscoveryApi } from '@backstage/core';
import { OPSGENIE_ANNOTATION } from './integration';

import { Alert, Incident } from './types';

export const opsgenieApiRef = createApiRef<OpsGenie>({
  id: 'plugin.opsgenie.service',
  description: 'Used to make requests towards OpsGenie API',
});

type AlertsFetchOpts = {
  limit?: number
}

type IncidentsFetchOpts = {
  limit?: number
}

export interface OpsGenie {
  getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]>;
  getIncidents(opts?: IncidentsFetchOpts): Promise<Incident[]>;

  getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]>;
  getAlertDetailsURL(alert: Alert): string;

  acknowledgeAlert(alert: Alert): Promise<void>;
  closeAlert(alert: Alert): Promise<void>;

  getIncidentDetailsURL(incident: Incident): string;
}

interface AlertsResponse {
  data: Alert[];
}

interface IncidentsResponse {
  data: Incident[];
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

  private async call(input: string, init?: RequestInit): Promise<void> {
    const apiUrl = await this.apiUrl();

    const resp = await fetch(`${apiUrl}${input}`, init);
    if (!resp.ok) throw new Error(`Request failed with ${resp.status}: ${resp.statusText}`);
  }

  async getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 50;

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}`);

    return response.data;
  }

  async getIncidents(opts?: AlertsFetchOpts): Promise<Incident[]> {
    const limit = opts?.limit || 50;

    const response = await this.fetch<IncidentsResponse>(`/v1/incidents?limit=${limit}`);

    return response.data;
  }

  async getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 5;
    const query = entity.metadata.annotations?.[OPSGENIE_ANNOTATION];

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}&query=${query}`);

    return response.data;
  }

  async acknowledgeAlert(alert: Alert): Promise<void> {
    await this.call(`/v2/alerts/${alert.id}/acknowledge`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({source: 'Backstage — OpsGenie plugin'}),
    })
  }

  async closeAlert(alert: Alert): Promise<void> {
    await this.call(`/v2/alerts/${alert.id}/close`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({source: 'Backstage — OpsGenie plugin'}),
    })
  }

  getAlertDetailsURL(alert: Alert): string {
    return `${this.domain}/alert/detail/${alert.id}/details`;
  }

  getIncidentDetailsURL(incident: Incident): string {
    return `${this.domain}/incident/detail/${incident.id}`;
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }
}