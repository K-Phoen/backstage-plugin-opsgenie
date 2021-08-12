import React from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Line
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import stc from 'string-to-color';
import { analyticsApiRef } from '../../analytics';
import { SaveAction } from './SaveAction';

const ResponderGraph = () => {
    const analyticsApi = useApi(analyticsApiRef);
    const { value: data, loading, error } = useAsync(async () => await analyticsApi.incidentsByMonthAndResponder());

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
        <div id="monthly-incidents-responders" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart data={data!.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    {data!.responders.map(responder => (
                        <Bar dataKey={responder} fill={stc(responder)} stackId="a" barSize={30}  key={responder} />
                    ))}
                    <Line type="monotone" dataKey="total" name="Total" stroke="#ff7300" />
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const MonthlyIncidentsResponders = () => {
    return (
        <InfoCard title="Incidents by month and responder" action={<SaveAction targetRef="monthly-incidents-responders" />}>
            <ResponderGraph />
        </InfoCard>
    );
};
