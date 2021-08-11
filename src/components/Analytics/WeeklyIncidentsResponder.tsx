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
import { Incident, Team } from '../../types';
import { exportGraph, respondingTeam, stringToColour } from './utils';


const ResponderGraph = ({ incidents, teams }: { incidents: Incident[], teams: Team[] }) => {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    let minDate: moment.Moment = moment().startOf('isoWeek');
    let maxDate: moment.Moment = moment().startOf('isoWeek');

    incidents.forEach((incident) => {
        const incidentDate = moment(incident.impactStartDate);
        const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;

        if (!incidentsBuckets[week]) {
            incidentsBuckets[week] = {
                responders: {},
                date: incidentDate,
            };
        }

        const responder = respondingTeam(teams, incident);

        respondersMap[responder] = true;

        if (!incidentsBuckets[week].responders[responder]) {
            incidentsBuckets[week].responders[responder] = 0;
        }

        incidentsBuckets[week].responders[responder] += 1;

        if (incidentDate < minDate) {
            minDate = incidentDate.clone().startOf('isoWeek');
        }
    });

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

    const data = Object.keys(incidentsBuckets).map(week => {
        const dataPoint: any = {
            week: week,
            date: incidentsBuckets[week].date,
        };

        Object.keys(respondersMap).forEach((responder) => {
            dataPoint[responder] = incidentsBuckets[week].responders[responder] || 0;
        });

        return dataPoint;
    });

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
        <div id="weekly-incidents-responders" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    {Object.keys(respondersMap).map(responder => (
                        <Bar dataKey={responder} fill={stringToColour(responder)} stackId="a" barSize={30} />
                    ))}
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeeklyIncidentsResponders = () => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => {
        return Promise.all([
            await opsgenieApi.getIncidents({ limit: 100 }),
            await opsgenieApi.getTeams(),
        ]);
    });

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
        exportGraph("weekly-incidents-responders");
    };

    const action = (
        <IconButton aria-label="save" title="Save as image" onClick={onExport}>
            <SaveAltIcon />
        </IconButton>
    );
    return (
        <InfoCard title="Incidents by week and responder" action={action}>
            <ResponderGraph incidents={value![0]} teams={value![1]} />
        </InfoCard>
    );
};
