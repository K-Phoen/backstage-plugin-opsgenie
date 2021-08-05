import React from 'react';
import moment from "moment"
import { IconButton } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { opsgenieApiRef } from '../../api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import { Incident } from '../../types';
import { exportGraph } from './utils';

const SeverityGraph = ({ incidents }: { incidents: Incident[] }) => {
    const incidentsBuckets: Record<string, { p1: number, p2: number, p3: number, p4: number, p5: number, date: moment.Moment }> = {};

    let minDate: moment.Moment = moment().startOf('isoWeek');
    let maxDate: moment.Moment = moment().startOf('isoWeek');

    incidents.forEach((incident) => {
        const incidentDate = moment(incident.impactStartDate);
        const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;

        if (!incidentsBuckets[week]) {
            incidentsBuckets[week] = {
                p1: 0,
                p2: 0,
                p3: 0,
                p4: 0,
                p5: 0,
                date: incidentDate,
            };
        }

        if (incident.priority == 'P1') {
            incidentsBuckets[week].p1 += 1;
        } else if (incident.priority == 'P2') {
            incidentsBuckets[week].p2 += 1;
        } else if (incident.priority == 'P3') {
            incidentsBuckets[week].p3 += 1;
        } else if (incident.priority == 'P4') {
            incidentsBuckets[week].p4 += 1;
        } else if (incident.priority == 'P5') {
            incidentsBuckets[week].p5 += 1;
        }

        if (incidentDate < minDate) {
            minDate = incidentDate.clone().startOf('isoWeek');
        }
    });

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

    data.sort((a, b) => {
        if (a.date < b.date) {
            return -1;
        }
        if (a.date > b.date) {
            return 1;
        }

        return 0;
    });

    return (
        <div id="weekly-incidents-severity" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Bar dataKey="p1" fill="#bf2600" name="P1 - Critical" stackId="a" barSize={30} />
                    <Bar dataKey="p2" fill="#ff7452" name="P2 - High" stackId="a" barSize={30} />
                    <Bar dataKey="p3" fill="#ffab00" name="P3 - Moderate" stackId="a" barSize={30} />
                    <Bar dataKey="p4" fill="#36b37e" name="P4 - Low" stackId="a" barSize={30} />
                    <Bar dataKey="p5" fill="#00857A" name="P5 - Informational" stackId="a" barSize={30} />
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeeklyIncidentsSeverity = () => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => await opsgenieApi.getIncidents({ limit: 100 }));

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    }

    const onExport = () => {
        exportGraph("weekly-incidents-severity");
    };

    const action = (
        <IconButton aria-label="save" title="Save as image" onClick={onExport}>
            <SaveAltIcon />
        </IconButton>
    );
    return (
        <InfoCard title="Incidents by week and severity" action={action}>
            <SeverityGraph incidents={value!} />
        </InfoCard>
    );
};
