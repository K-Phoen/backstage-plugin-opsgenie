import React from 'react';
import { Grid } from '@material-ui/core';
import { WeeklyIncidents } from './WeeklyIncidents';

export const Analytics = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <WeeklyIncidents />
            </Grid>
        </Grid>
    );
};
