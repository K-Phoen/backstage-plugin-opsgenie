import React from 'react';
import { Grid } from '@material-ui/core';
import { WeeklyIncidents } from './WeeklyIncidents';
import { WeeklyIncidentsSeverity } from './WeeklyIncidentsSeverity';
import { WeeklyIncidentsResponders } from './WeeklyIncidentsResponder';
import { QuarterlyIncidentsResponders } from './QuarterlyIncidentsResponder';
import { HourlyIncidents } from './HourlyIncidents';
import { MonthlyIncidentsResponders } from './MonthlyIncidentsResponder';
import { useApi } from '@backstage/core-plugin-api';
import moment from 'moment';
import { opsgenieApiRef } from '../../api';
import { useAsync } from 'react-use';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import { Context } from '../../analytics';
import { DailyIncidents } from './DailyIncidents';

export const Analytics = () => {
    const opsgenieApi = useApi(opsgenieApiRef);

    const from = moment().subtract(1, 'year').startOf('quarter');
    const to = moment();

    const { value: data, loading, error } = useAsync(async () => {
        return Promise.all([
            opsgenieApi.getIncidents({
                limit: 100,
                query: `createdAt < ${to.valueOf()} AND createdAt > ${from.valueOf()}`
            }),
            opsgenieApi.getTeams(),
        ])
    });

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    const context: Context = {
        from: from,
        to: to,
        incidents: data![0].filter(incident => moment(incident.impactStartDate).isAfter(from)),
        teams: data![1],
    };

    return (
        <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
                <WeeklyIncidents context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <WeeklyIncidentsSeverity context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <WeeklyIncidentsResponders context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <MonthlyIncidentsResponders context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <QuarterlyIncidentsResponders context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <HourlyIncidents context={context} />
            </Grid>

            <Grid item md={6} xs={12}>
                <DailyIncidents context={context} />
            </Grid>
        </Grid>
    );
};
