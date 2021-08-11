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
import { exportGraph, respondingTeam } from './utils';
import stc from 'string-to-color';

const ResponderGraph = ({ incidents, teams }: { incidents: Incident[], teams: Team[] }) => {
    const incidentsBuckets: Record<string, { responders: Record<string, number>, date: moment.Moment }> = {};
    const respondersMap: Record<string, boolean> = {};

    let minDate: moment.Moment = moment().startOf('isoWeek');
    let maxDate: moment.Moment = moment().startOf('isoWeek');

    incidents.forEach((incident) => {
        const incidentDate = moment(incident.impactStartDate);
        const quarter = `Q${incidentDate.quarter()} - ${incidentDate.year()}`;

        if (!incidentsBuckets[quarter]) {
            incidentsBuckets[quarter] = {
                responders: {},
                date: incidentDate,
            };
        }

        const responder = respondingTeam(teams, incident);

        respondersMap[responder] = true;

        if (!incidentsBuckets[quarter].responders[responder]) {
            incidentsBuckets[quarter].responders[responder] = 0;
        }

        incidentsBuckets[quarter].responders[responder] += 1;

        if (incidentDate < minDate) {
            minDate = incidentDate.clone().startOf('isoWeek');
        }
    });

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

    const data = Object.keys(incidentsBuckets).map(quarter => {
        const dataPoint: any = {
            quarter: quarter,
            date: incidentsBuckets[quarter].date,
        };

        Object.keys(respondersMap).forEach((responder) => {
            dataPoint[responder] = incidentsBuckets[quarter].responders[responder] || 0;
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
        <div id="quarterly-incidents-responders" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    {Object.keys(respondersMap).map(responder => (
                        <Bar dataKey={responder} fill={stc(responder)} stackId="a" barSize={30} />
                    ))}
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const QuarterlyIncidentsResponders = () => {
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
        exportGraph("quarterly-incidents-responders");
    };

    const action = (
        <IconButton aria-label="save" title="Save as image" onClick={onExport}>
            <SaveAltIcon />
        </IconButton>
    );
    return (
        <InfoCard title="Incidents by quarter and responder" action={action}>
            <ResponderGraph incidents={value![0]} teams={value![1]} />
        </InfoCard>
    );
};
