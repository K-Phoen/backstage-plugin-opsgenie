import React from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import { analyticsApiRef } from '../../analytics';
import { SaveAction } from './SaveAction';

const Graph = () => {
    const analyticsApi = useApi(analyticsApiRef);
    const { value: dataPoints, loading, error } = useAsync(async () => await analyticsApi.incidentsByWeekAndSeverity());

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
        <div id="weekly-incidents-severity" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={dataPoints}
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
    return (
        <InfoCard title="Incidents by week and severity" action={<SaveAction targetRef="weekly-incidents-severity" />}>
            <Graph />
        </InfoCard>
    );
};
