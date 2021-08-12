import React from 'react';
import { Grid } from '@material-ui/core';
import { WeeklyIncidents } from './WeeklyIncidents';
import { WeeklyIncidentsSeverity } from './WeeklyIncidentsSeverity';
import { WeeklyIncidentsResponders } from './WeeklyIncidentsResponder';
import { QuarterlyIncidentsResponders } from './QuarterlyIncidentsResponder';
import { HourlyIncidents } from './HourlyIncidents';
import { MonthlyIncidentsResponders } from './MonthlyIncidentsResponder';

export const Analytics = () => {
    return (
        <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
                <WeeklyIncidents />
            </Grid>

            <Grid item md={6} xs={12}>
                <WeeklyIncidentsSeverity />
            </Grid>

            <Grid item md={6} xs={12}>
                <WeeklyIncidentsResponders />
            </Grid>

            <Grid item md={6} xs={12}>
                <MonthlyIncidentsResponders />
            </Grid>

            <Grid item md={6} xs={12}>
                <QuarterlyIncidentsResponders />
            </Grid>

            <Grid item md={6} xs={12}>
                <HourlyIncidents />
            </Grid>
        </Grid>
    );
};
