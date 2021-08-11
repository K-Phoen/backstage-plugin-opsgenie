import React from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
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
    const { value: data, loading, error } = useAsync(async () => await analyticsApi.incidentsByWeekAndResponder());

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
        <div id="weekly-incidents-responders" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart data={data!.dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    {data!.responders.map(responder => (
                        <Bar dataKey={responder} fill={stc(responder)} stackId="a" barSize={30}  key={responder} />
                    ))}
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeeklyIncidentsResponders = () => {
    return (
        <InfoCard title="Incidents by week and responder" action={<SaveAction targetRef="weekly-incidents-responders" />}>
            <ResponderGraph />
        </InfoCard>
    );
};
