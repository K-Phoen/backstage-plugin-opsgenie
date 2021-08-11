import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import { analyticsApiRef } from '../../analytics';
import { SaveAction } from './SaveAction';

const Graph = () => {
    const analyticsApi = useApi(analyticsApiRef);
    const { value: dataPoints, loading, error } = useAsync(async () => await analyticsApi.incidentsByHour());

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    }

    return (
        <div id="hourly-incidents" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ScatterChart data={dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" name="Hour" unit="h" />
                    <YAxis dataKey="total" name="Total" />
                    <Tooltip />
                    <Scatter name="Hour" data={dataPoints} fill="#8884d8" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export const HourlyIncidents = () => {
    return (
        <InfoCard title="Incidents by hour" action={<SaveAction targetRef="hourly-incidents" />}>
            <Graph />
        </InfoCard>
    );
};
