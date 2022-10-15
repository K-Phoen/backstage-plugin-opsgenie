import { Alert, Incident, OnCallParticipantRef, Schedule, Team } from './types';
import { createApiRef, DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

export const opsgenieApiRef = createApiRef<Opsgenie>({
  id: 'plugin.opsgenie.service',
});

type AlertsFetchOpts = {
  limit?: number
  query?: string
}

type IncidentsFetchOpts = {
  limit?: number
  query?: string;
  sort?: string;
  order?: string;
}

export interface Opsgenie {
  getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]>;
  getIncidents(opts?: IncidentsFetchOpts): Promise<Incident[]>;

  getAlertDetailsURL(alert: Alert): string;

  acknowledgeAlert(alert: Alert): Promise<void>;
  closeAlert(alert: Alert): Promise<void>;

  getIncidentDetailsURL(incident: Incident): string;

  getSchedules(): Promise<Schedule[]>;
  getSchedulesForTeam(name: string): Promise<Schedule[]>;
  getOnCall(scheduleId: string): Promise<OnCallParticipantRef[]>;

  getTeams(): Promise<Team[]>;

  getUserDetailsURL(userId: string): string;

  isReadOnly(): boolean;
}

interface AlertsResponse {
  data: Alert[];
}

interface IncidentsResponse {
  data: Incident[];
  paging: {
    first: string;
    next?: string;
    last: string;
  };
}

interface SchedulesResponse {
  data: Schedule[];
}

interface ScheduleOnCallResponse {
  data: {
    onCallParticipants: OnCallParticipantRef[];
  };
}

interface TeamsResponse {
  data: Team[];
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
   * If used token for OpsGenie has only read rights, you have to set it to true.
   */
  readOnly: boolean;

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
  private readonly readOnly: boolean;

  constructor(opts: Options) {
    this.discoveryApi = opts.discoveryApi;
    this.identityApi = opts.identityApi;
    this.domain = opts.domain;
    this.proxyPath = opts.proxyPath ?? DEFAULT_PROXY_PATH;
    this.readOnly = opts.readOnly;
  }

  private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const apiUrl = await this.apiUrl();
    const authedInit = await this.addAuthHeaders(init || {});

    const resp = await fetch(`${apiUrl}${input}`, authedInit);
    if (!resp.ok) {
      throw new Error(`Request failed with ${resp.status} ${resp.statusText}`);
    }

    return await resp.json();
  }

  private async call(input: string, init?: RequestInit): Promise<void> {
    const apiUrl = await this.apiUrl();
    const authedInit = await this.addAuthHeaders(init || {});

    const resp = await fetch(`${apiUrl}${input}`, authedInit);
    if (!resp.ok) throw new Error(`Request failed with ${resp.status}: ${resp.statusText}`);
  }

  async getAlerts(opts?: AlertsFetchOpts): Promise<Alert[]> {
    const limit = opts?.limit || 50;
    const query = opts?.query ? `&query=${opts?.query}` : '';
    const response = await this.fetch<AlertsResponse>(`/v2/alerts?limit=${limit}${query}`);

    return response.data;
  }

  async getIncidents(opts?: IncidentsFetchOpts): Promise<Incident[]> {
    const limit = opts?.limit || 50;
    const sort = opts?.sort || 'createdAt';
    const order = opts?.order || 'desc';
    const query = opts?.query ? `&query=${opts?.query}` : '';

    let response = await this.fetch<IncidentsResponse>(`/v1/incidents?limit=${limit}&sort=${sort}&order=${order}${query}`);
    let incidents = response.data;

    while (response.paging.next) {
      const parsedUrl = new URL(response.paging.next);
      response = await this.fetch(parsedUrl.pathname + parsedUrl.search);

      incidents = incidents.concat(response.data);
    }

    return incidents;
  }

  async acknowledgeAlert(alert: Alert): Promise<void> {
    if (this.isReadOnly()) {
      throw new Error('You can\'t acknowledge an alert in read-only mode.');
    }
    const init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'Backstage — Opsgenie plugin' }),
    };

    await this.call(`/v2/alerts/${alert.id}/acknowledge`, init);
  }

  async closeAlert(alert: Alert): Promise<void> {
    if (this.isReadOnly()) {
      throw new Error('You can\'t close an alert in read-only mode.');
    }
    const init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'Backstage — Opsgenie plugin' }),
    };

    await this.call(`/v2/alerts/${alert.id}/close`, init);
  }

  async getSchedules(): Promise<Schedule[]> {
    const response = await this.fetch<SchedulesResponse>("/v2/schedules");

    return response.data;
  }

  async getSchedulesForTeam(name: string): Promise<Schedule[]> {
    const response = await this.fetch<SchedulesResponse>("/v2/schedules");

    return response.data.filter(schedule => schedule.ownerTeam && schedule.ownerTeam.name === name);
  }

  async getTeams(): Promise<Team[]> {
    const response = await this.fetch<TeamsResponse>("/v2/teams");

    return response.data;
  }

  async getOnCall(scheduleId: string): Promise<OnCallParticipantRef[]> {
    const response = await this.fetch<ScheduleOnCallResponse>(`/v2/schedules/${scheduleId}/on-calls`);

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

  isReadOnly(): boolean {
    return this.readOnly;
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }

  private async addAuthHeaders(init: RequestInit): Promise<RequestInit> {
    const { token } = await this.identityApi.getCredentials();
    const headers = init.headers || {};

    return {
      ...init,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    };
  }
}
