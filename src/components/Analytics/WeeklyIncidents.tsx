import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import { analyticsApiRef } from '../../analytics';
import { SaveAction } from './SaveAction';

const Graph = () => {
    const analyticsApi = useApi(analyticsApiRef);
    const { value: dataPoints, loading, error } = useAsync(async () => await analyticsApi.incidentsByWeekAndHours());

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
        <div id="weekly-incidents" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={dataPoints}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Bar dataKey="businessHours" fill="#82ca9d" name="Business hours" stackId="a" barSize={30} />
                    <Bar dataKey="onCallHours" fill="#8884d8" name="On-call hours" stackId="a" barSize={30} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#ff7300" />
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeeklyIncidents = () => {
    return (
        <InfoCard title="Incidents by week" action={<SaveAction targetRef="weekly-incidents" />}>
            <Graph />
        </InfoCard>
    );
};
