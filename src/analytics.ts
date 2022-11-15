import { createApiRef } from '@backstage/core-plugin-api';
import moment from 'moment';
import { Incident, Team } from './types';

const UNKNOWN_TEAM_NAME = "Unknown";

export const DEFAULT_BUSINESS_HOURS_START = 9;
export const DEFAULT_BUSINESS_HOURS_END = 18;

export const analyticsApiRef = createApiRef<Analytics>({
  id: 'plugin.opsgenie.analytics',
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

interface HourlyIncidents {
  hour: string;
  total: number;
}

interface DailyIncidents {
  day: string;
  total: number;
}

interface WeeklyIncidentsBySeverity {
  week: string;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  date: moment.Moment;
}

interface WeeklyIncidentsByHour {
  week: string;
  businessHours: number;
  onCallHours: number;
  total: number;
  date: moment.Moment;
}

export interface IncidentsByResponders {
  dataPoints: { period: string; total: number; date: moment.Moment }[]
  responders: string[];
}

export interface Context {
  from: moment.Moment;
  to: moment.Moment;
  incidents: Incident[];
  teams: Team[];
}

export interface Analytics {
  incidentsByHour(context: Context): HourlyIncidents[];
  incidentsByDay(context: Context): DailyIncidents[];

  incidentsByWeekAndHours(context: Context): WeeklyIncidentsByHour[];
  incidentsByWeekAndSeverity(context: Context): WeeklyIncidentsBySeverity[];

  incidentsByDayAndResponder(context: Context): IncidentsByResponders;
  incidentsByWeekAndResponder(context: Context): IncidentsByResponders;
  incidentsByMonthAndResponder(context: Context): IncidentsByResponders;
  incidentsByQuarterAndResponder(context: Context): IncidentsByResponders;

  impactByWeekAndResponder(context: Context): IncidentsByResponders;
}

interface BusinessHours {
  start: number;
  end: number;
}

export class AnalitycsApi implements Analytics {
  private readonly businessHours: BusinessHours;

  constructor(opts: { businessHours: BusinessHours }) {
    this.businessHours = opts.businessHours;
  }

  incidentsByHour(context: Context): HourlyIncidents[] {
    const incidentsBuckets: Record<string, number> = {};

    // add empty buckets for hours with no incident
    for (let h = 0; h <= 23; h++) {
      incidentsBuckets[h] = 0;
    }

    context.incidents.forEach(incident => {
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

  incidentsByDay(context: Context): DailyIncidents[] {
    const incidentsBuckets: Record<string, number> = {};

    // add empty buckets for days with no incident
    for (let d = 0; d < 7; d++) {
      incidentsBuckets[d] = 0;
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);

      incidentsBuckets[incidentDate.day()] += 1;
    });

    const data = Object.keys(incidentsBuckets).map(day => (
      {
        day: moment().day(day).format('dddd'),
        dayNum: parseInt(day, 10),
        total: incidentsBuckets[day],
      }
    ));

    // Mondays first.
    data.sort((a, b) => (a.dayNum + 6) % 7 - (b.dayNum + 6) % 7);

    return data;
  }

  incidentsByWeekAndSeverity(context: Context): WeeklyIncidentsBySeverity[] {
    const incidentsBuckets: Record<string, { p1: number, p2: number, p3: number, p4: number, p5: number, date: moment.Moment }> = {};

    const minDate = context.from.clone().startOf('isoWeek');
    const maxDate = context.to.clone().startOf('isoWeek');

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

    context.incidents.forEach(incident => {
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

  incidentsByWeekAndHours(context: Context): WeeklyIncidentsByHour[] {
    const incidentsBuckets: Record<string, { businessHours: number, onCallHours: number, total: number, date: moment.Moment }> = {};

    const minDate = context.from.clone().startOf('isoWeek');
    const maxDate = context.to.clone().startOf('isoWeek');

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

    context.incidents.forEach(incident => {
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

  incidentsByDayAndResponder(context: Context): IncidentsByResponders {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, total: number }> = {};
    const respondersMap: Record<string, boolean> = {};

    // add empty buckets for days with no incident
    for (let d = 0; d < 7; d++) {
      incidentsBuckets[d] = {
        total: 0,
        responders: {},
      };
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const day = incidentDate.day();
      const responder = respondingTeam(context.teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[day].responders[responder]) {
        incidentsBuckets[day].responders[responder] = 0;
      }

      incidentsBuckets[day].responders[responder] += 1;
      incidentsBuckets[day].total += 1;
    });

    const data = Object.keys(incidentsBuckets).map(day => {
      const dataPoint: any = {
        period: moment().day(day).format('dddd'),
        dayNum: parseInt(day, 10),
        total: incidentsBuckets[day].total,
      };

      Object.keys(respondersMap).forEach(responder => {
        dataPoint[responder] = incidentsBuckets[day].responders[responder] || 0;
      });

      return dataPoint;
    });

    // Mondays first.
    data.sort((a, b) => (a.dayNum + 6) % 7 - (b.dayNum + 6) % 7);

    return {
      dataPoints: data,
      responders: Object.keys(respondersMap),
    };
  }

  incidentsByMonthAndResponder(context: Context): IncidentsByResponders {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, total: number, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const from = context.from.clone();
    const to = context.to.clone();

    // add empty buckets for months with no incident
    while (from <= to) {
      const month = `${from.month() + 1}/${from.year()}`;

      if (!incidentsBuckets[month]) {
        incidentsBuckets[month] = {
          responders: {},
          total: 0,
          date: from.clone(),
        };
      }

      from.add(1, 'month');
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const month = `${incidentDate.month() + 1}/${incidentDate.year()}`;
      const responder = respondingTeam(context.teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[month].responders[responder]) {
        incidentsBuckets[month].responders[responder] = 0;
      }

      incidentsBuckets[month].responders[responder] += 1;
      incidentsBuckets[month].total += 1;
    });

    const data = Object.keys(incidentsBuckets).map(month => {
      const dataPoint: any = {
        period: month,
        total: incidentsBuckets[month].total,
        date: incidentsBuckets[month].date,
      };

      Object.keys(respondersMap).forEach(responder => {
        dataPoint[responder] = incidentsBuckets[month].responders[responder] || 0;
      });

      return dataPoint;
    });

    sortByDate(data);

    return {
      dataPoints: data,
      responders: Object.keys(respondersMap),
    };
  }

  incidentsByWeekAndResponder(context: Context): IncidentsByResponders {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, total: number, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const minDate = context.from.clone().startOf('isoWeek');
    const maxDate = context.to.clone().startOf('isoWeek');

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
      const week = `w${minDate.isoWeek()} - ${minDate.year()}`;

      if (!incidentsBuckets[week]) {
        incidentsBuckets[week] = {
          responders: {},
          total: 0,
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;
      const responder = respondingTeam(context.teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[week].responders[responder]) {
        incidentsBuckets[week].responders[responder] = 0;
      }

      incidentsBuckets[week].responders[responder] += 1;
      incidentsBuckets[week].total += 1;
    });

    const data = Object.keys(incidentsBuckets).map(week => {
      const dataPoint: any = {
        period: week,
        total: incidentsBuckets[week].total,
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

  incidentsByQuarterAndResponder(context: Context): IncidentsByResponders {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, total: number, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const from = context.from.clone();
    const to = context.to.clone();

    // add empty buckets for quarters with no incident (let's be hopeful, might happen)
    while (from <= to) {
      const quarter = `Q${from.quarter()} - ${from.year()}`;

      if (!incidentsBuckets[quarter]) {
        incidentsBuckets[quarter] = {
          responders: {},
          total: 0,
          date: from.clone(),
        };
      }

      from.add(1, 'quarter');
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const quarter = `Q${incidentDate.quarter()} - ${incidentDate.year()}`;
      const responder = respondingTeam(context.teams, incident);

      respondersMap[responder] = true;

      if (!incidentsBuckets[quarter].responders[responder]) {
        incidentsBuckets[quarter].responders[responder] = 0;
      }

      incidentsBuckets[quarter].responders[responder] += 1;
      incidentsBuckets[quarter].total += 1;
    });


    const data = Object.keys(incidentsBuckets).map(quarter => {
      const dataPoint: any = {
        period: quarter,
        total: incidentsBuckets[quarter].total,
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

  impactByWeekAndResponder(context: Context): IncidentsByResponders {
    const incidentsBuckets: Record<string, { responders: Record<string, number[]>, durations: number[], date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    const minDate = context.from.clone().startOf('isoWeek');
    const maxDate = context.to.clone().startOf('isoWeek');

    const average = (durations: number[]) => durations.length === 0 ? 0 : durations.reduce((a, b) => a + b, 0) / durations.length;

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
      const week = `w${minDate.isoWeek()} - ${minDate.year()}`;

      if (!incidentsBuckets[week]) {
        incidentsBuckets[week] = {
          responders: {},
          durations: [],
          date: minDate.clone(),
        };
      }

      minDate.add(1, 'weeks');
    }

    context.incidents.forEach(incident => {
      const incidentDate = moment(incident.impactStartDate);
      const incidentEnd = moment(incident.impactEndDate);
      const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;
      const responder = respondingTeam(context.teams, incident);
      const impactDuration = incidentEnd.diff(incidentDate, 'minutes');

      respondersMap[responder] = true;

      if (!incidentsBuckets[week].responders[responder]) {
        incidentsBuckets[week].responders[responder] = [];
      }

      incidentsBuckets[week].responders[responder].push(impactDuration);
      incidentsBuckets[week].durations.push(impactDuration);
    });

    const data = Object.keys(incidentsBuckets).map(week => {
      const dataPoint: any = {
        period: week,
        total: average(incidentsBuckets[week].durations),
        date: incidentsBuckets[week].date,
      };

      Object.keys(respondersMap).forEach(responder => {
        dataPoint[responder] = incidentsBuckets[week].responders[responder] ? average(incidentsBuckets[week].responders[responder]) : 0;
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
