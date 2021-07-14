import { Entity } from '@backstage/catalog-model';
import { OPSGENIE_ANNOTATION } from './integration';
import { Alert, Incident, OnCallParticipantRef, Schedule } from './types';
import { createApiRef, DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

export const opsgenieApiRef = createApiRef<Opsgenie>({
  id: 'plugin.opsgenie.service',
  description: 'Used to make requests towards Opsgenie API',
});

type AlertsFetchOpts = {
  limit?: number
}

type IncidentsFetchOpts = {
  limit?: number
}

export interface Opsgenie {
  getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]>;
  getIncidents(opts?: IncidentsFetchOpts): Promise<Incident[]>;

  getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]>;
  getAlertDetailsURL(alert: Alert): string;

  acknowledgeAlert(alert: Alert): Promise<void>;
  closeAlert(alert: Alert): Promise<void>;

  getIncidentDetailsURL(incident: Incident): string;

  getSchedules(): Promise<Schedule[]>;
  getOnCall(scheduleId: string): Promise<OnCallParticipantRef[]>;

  getUserDetailsURL(userId: string): string;
}

interface AlertsResponse {
  data: Alert[];
}

interface IncidentsResponse {
  data: Incident[];
}

interface SchedulesResponse {
  data: Schedule[];
}

interface ScheduleOnCallResponse {
  data: {
    onCallParticipants: OnCallParticipantRef[];
  };
}

const DEFAULT_PROXY_PATH = '/opsgenie/api';

type Options = {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;

  /**
   * Domain used by users to access Opsgenie web UI.
   * Example: https://my-app.app.eu.opsgenie.com/
   */
  domain: string;

  /**
   * Path to use for requests via the proxy, defaults to /opsgenie/api
   */
  proxyPath?: string;
};

/**
 * API to talk to Opsgenie.
 */
export class OpsgenieApi implements Opsgenie {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private readonly proxyPath: string;
  private readonly domain: string;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.identityApi = opts.identityApi;
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
    const init = await this.addAuthHeaders({});

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}`, init);

    return response.data;
  }

  async getIncidents(opts?: AlertsFetchOpts): Promise<Incident[]> {
    const limit = opts?.limit || 50;
    const init = await this.addAuthHeaders({});

    const response = await this.fetch<IncidentsResponse>(`/v1/incidents?limit=${limit}`, init);

    return response.data;
  }

  async getAlertsForEntity(entity: Entity, opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 5;
    const query = entity.metadata.annotations?.[OPSGENIE_ANNOTATION];
    const init = await this.addAuthHeaders({});

    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}&query=${query}`, init);

    return response.data;
  }

  async acknowledgeAlert(alert: Alert): Promise<void> {
    const init = await this.addAuthHeaders({
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({source: 'Backstage — Opsgenie plugin'}),
    });

    await this.call(`/v2/alerts/${alert.id}/acknowledge`, init);
  }

  async closeAlert(alert: Alert): Promise<void> {
    const init = await this.addAuthHeaders({
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({source: 'Backstage — Opsgenie plugin'}),
    });

    await this.call(`/v2/alerts/${alert.id}/close`, init);
  }

  async getSchedules(): Promise<Schedule[]> {
    const init = await this.addAuthHeaders({});
    const response = await this.fetch<SchedulesResponse>("/v2/schedules", init);

    return response.data;
  }

  async getOnCall(scheduleId: string): Promise<OnCallParticipantRef[]> {
    const init = await this.addAuthHeaders({});
    const response = await this.fetch<ScheduleOnCallResponse>(`/v2/schedules/${scheduleId}/on-calls`, init);

    return response.data.onCallParticipants;
  }

  getAlertDetailsURL(alert: Alert): string {
    return `${this.domain}/alert/detail/${alert.id}/details`;
  }

  getIncidentDetailsURL(incident: Incident): string {
    return `${this.domain}/incident/detail/${incident.id}`;
  }

  getUserDetailsURL(userId: string): string {
    return `${this.domain}/settings/users/${userId}/detail`;
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }

  private async addAuthHeaders(init: RequestInit): Promise<RequestInit> {
    const authToken = await this.identityApi.getIdToken();
    const headers = init.headers || {};

    return {
      ...init,
      headers: {
        ...headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      }
    };
  }
}
