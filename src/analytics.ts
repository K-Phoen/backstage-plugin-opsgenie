import { createApiRef } from '@backstage/core-plugin-api';
import { Opsgenie } from './api';
import moment from 'moment';
import { Incident, Team } from './types';

const UNKNOWN_TEAM_NAME = "Unknown";

export const DEFAULT_BUSINESS_HOURS_START = 9;
export const DEFAULT_BUSINESS_HOURS_END = 18;

export const analyticsApiRef = createApiRef<Analytics>({
  id: 'plugin.opsgenie.analytics',
  description: 'Used to generate analytics',
});

const teamName = (teams: Team[], teamId: string): string => {
  for (const team of teams) {
    if (team.id === teamId) {
      return team.name;
    }
  }

  return UNKNOWN_TEAM_NAME;
};

export const respondingTeam = (teams: Team[], incident: Incident): string => {
  if (incident.extraProperties.responders) {
    return incident.extraProperties.responders;
  }

  const teamResponders = incident.responders.filter((responderRef) => responderRef.type === "team");

  if (teamResponders.length === 0) {
    return UNKNOWN_TEAM_NAME;
  }

  return teamName(teams, teamResponders[0].id);
};

const sortByDate = (data: DateSortable[]): void => {
  data.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    }
    if (a.date > b.date) {
      return 1;
    }

    return 0;
  });
}

interface DateSortable {
  date: moment.Moment;
}

export interface HourlyIncidents {
  hour: string;
  total: number;
}

export interface WeeklyIncidentsBySeverity {
  week: string;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  date: moment.Moment;
}

export interface WeeklyIncidentsByHour {
  week: string;
  businessHours: number;
  onCallHours: number;
  total: number;
  date: moment.Moment;
}

export interface WeeklyIncidentsByResponders {
  dataPoints: { week: string; date: moment.Moment }[]
  responders: string[];
}

export interface QuarterlyIncidentsByResponders {
  dataPoints: { quarter: string; date: moment.Moment }[]
  responders: string[];
}

interface Incidents {
  incidents: Incident[]
  from: moment.Moment;
  to: moment.Moment;
}

export interface Analytics {
  incidentsByHour(): Promise<HourlyIncidents[]>;
  incidentsByWeekAndHours(): Promise<WeeklyIncidentsByHour[]>;
  incidentsByWeekAndSeverity(): Promise<WeeklyIncidentsBySeverity[]>;
  incidentsByWeekAndResponder(): Promise<WeeklyIncidentsByResponders>;
  incidentsByQuarterAndResponder(): Promise<QuarterlyIncidentsByResponders>;
}

interface BusinessHours {
  start: number;
  end: number;
}

export class AnalitycsApi implements Analytics {
  private readonly opsgenieApi: Opsgenie;
  private readonly businessHours: BusinessHours;

  constructor(opts: { opsgenieApi: Opsgenie, businessHours: BusinessHours }) {
    this.opsgenieApi = opts.opsgenieApi;
    this.businessHours = opts.businessHours;
  }

  async incidents(): Promise<Incidents> {
    const from = moment().subtract(1, 'year').startOf('quarter');
    const to = moment();

    const results = await this.opsgenieApi.getIncidents({
      limit: 100,
      query: `createdAt < ${to.valueOf()} AND createdAt > ${from.valueOf()}`
    });

    return {
      incidents: results.filter(incident => moment(incident.impactStartDate).isAfter(from)),
      from: from,
      to: to,
    };
  }

  async incidentsByHour(): Promise<HourlyIncidents[]> {
    const {incidents} = await this.incidents();
    const incidentsBuckets: Record<string, number> = {};

    // add empty buckets for hours with no incident
    for (let h = 0; h < 23; h++) {
      incidentsBuckets[h] = 0;
    }

    incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);

      incidentsBuckets[incidentDate.hour()] += 1;
    });

    const data = Object.keys(incidentsBuckets).map(hour => (
      {
        hour: hour,
        total: incidentsBuckets[hour],
      }
    ));

    data.sort((a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10));

    return data;
  }

  async incidentsByWeekAndSeverity(): Promise<WeeklyIncidentsBySeverity[]> {
    const {incidents, from, to} = await this.incidents();
    const incidentsBuckets: Record<string, { p1: number, p2: number, p3: number, p4: number, p5: number, date: moment.Moment }> = {};

    const minDate = from.startOf('isoWeek');
    const maxDate = to.startOf('isoWeek');

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
      const week = `w${minDate.isoWeek()} - ${minDate.year()}`;

      if (!incidentsBuckets[week]) {
        incidentsBuckets[week] = {
          p1: 0,
          p2: 0,
          p3: 0,
          p4: 0,
          p5: 0,
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;

      if (incident.priority === 'P1') {
        incidentsBuckets[week].p1 += 1;
      } else if (incident.priority === 'P2') {
        incidentsBuckets[week].p2 += 1;
      } else if (incident.priority === 'P3') {
        incidentsBuckets[week].p3 += 1;
      } else if (incident.priority === 'P4') {
        incidentsBuckets[week].p4 += 1;
      } else if (incident.priority === 'P5') {
        incidentsBuckets[week].p5 += 1;
      }
    });

    const data = Object.keys(incidentsBuckets).map(week => (
      {
        week: week,
        p1: incidentsBuckets[week].p1,
        p2: incidentsBuckets[week].p2,
        p3: incidentsBuckets[week].p3,
        p4: incidentsBuckets[week].p4,
        p5: incidentsBuckets[week].p5,
        date: incidentsBuckets[week].date,
      }
    ));

    sortByDate(data);

    return data;
  }

  async incidentsByWeekAndHours(): Promise<WeeklyIncidentsByHour[]> {
    const {incidents, from, to} = await this.incidents();
    const incidentsBuckets: Record<string, { businessHours: number, onCallHours: number, total: number, date: moment.Moment }> = {};

    const minDate = from.startOf('isoWeek');
    const maxDate = to.startOf('isoWeek');

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
      const week = `w${minDate.isoWeek()} - ${minDate.year()}`;

      if (!incidentsBuckets[week]) {
        incidentsBuckets[week] = {
          businessHours: 0,
          onCallHours: 0,
          total: 0,
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;

      incidentsBuckets[week].total += 1;

      if (this.isBusinessHours(incidentDate)) {
        incidentsBuckets[week].businessHours += 1;
      } else {
        incidentsBuckets[week].onCallHours += 1;
      }
    });

    const data = Object.keys(incidentsBuckets).map(week => (
      {
        week: week,
        businessHours: incidentsBuckets[week].businessHours,
        onCallHours: incidentsBuckets[week].onCallHours,
        total: incidentsBuckets[week].total,
        date: incidentsBuckets[week].date,
      }
    ));

    sortByDate(data);

    return data;
  }

  async incidentsByWeekAndResponder(): Promise<WeeklyIncidentsByResponders> {
    const {incidents, from, to} = await this.incidents();
    const teams = await this.opsgenieApi.getTeams();

    const incidentsBuckets: Record<string, { responders: Record<string, number>, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const minDate = from.startOf('isoWeek');
    const maxDate = to.startOf('isoWeek');

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
      const week = `w${minDate.isoWeek()} - ${minDate.year()}`;

      if (!incidentsBuckets[week]) {
        incidentsBuckets[week] = {
          responders: {},
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;
      const responder = respondingTeam(teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[week].responders[responder]) {
        incidentsBuckets[week].responders[responder] = 0;
      }

      incidentsBuckets[week].responders[responder] += 1;
    });

    const data = Object.keys(incidentsBuckets).map(week => {
      const dataPoint: any = {
        week: week,
        date: incidentsBuckets[week].date,
      };

      Object.keys(respondersMap).forEach(responder => {
        dataPoint[responder] = incidentsBuckets[week].responders[responder] || 0;
      });

      return dataPoint;
    });

    sortByDate(data);

    return {
      dataPoints: data,
      responders: Object.keys(respondersMap),
    };
  }

  async incidentsByQuarterAndResponder(): Promise<QuarterlyIncidentsByResponders> {
    const {incidents, from, to} = await this.incidents();
    const teams = await this.opsgenieApi.getTeams();

    const incidentsBuckets: Record<string, { responders: Record<string, number>, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const minDate = from.startOf('isoWeek');
    const maxDate = to.startOf('isoWeek');

    // add empty buckets for quarters with no incident (let's be hopeful, might happen)
    while (minDate <= maxDate) {
      const quarter = `Q${minDate.quarter()} - ${minDate.year()}`;

      if (!incidentsBuckets[quarter]) {
        incidentsBuckets[quarter] = {
          responders: {},
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const quarter = `Q${incidentDate.quarter()} - ${incidentDate.year()}`;
      const responder = respondingTeam(teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[quarter].responders[responder]) {
        incidentsBuckets[quarter].responders[responder] = 0;
      }

      incidentsBuckets[quarter].responders[responder] += 1;
    });

    const data = Object.keys(incidentsBuckets).map(quarter => {
      const dataPoint: any = {
        quarter: quarter,
        date: incidentsBuckets[quarter].date,
      };

      Object.keys(respondersMap).forEach(responder => {
        dataPoint[responder] = incidentsBuckets[quarter].responders[responder] || 0;
      });

      return dataPoint;
    });

    sortByDate(data);

    return {
      dataPoints: data,
      responders: Object.keys(respondersMap),
    };
  }

  isBusinessHours(incidentStartedAt: moment.Moment): boolean {
    return incidentStartedAt.hour() >= this.businessHours.start && incidentStartedAt.hour() < this.businessHours.end;
  }
}
