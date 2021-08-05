import React from 'react';
import { Grid } from '@material-ui/core';
import { WeeklyIncidents } from './WeeklyIncidents';
import { WeeklyIncidentsSeverity } from './WeeklyIncidentsSeverity';

export const Analytics = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <WeeklyIncidents />
            </Grid>

            <Grid item xs={12}>
                <WeeklyIncidentsSeverity />
            </Grid>
        </Grid>
    );
};
