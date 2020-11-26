import React, { FC } from 'react';
import { Progress, useApi } from '@backstage/core';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { useAsync } from 'react-use';
import { Alert as AlertUI } from '@material-ui/lab';
import { Entity } from '@backstage/catalog-model';
import moment from "moment";

import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';
import { AlertStatus, AlertActionsMenu } from '../Alert';

const useStyles = makeStyles({
    listItemPrimary: {
        fontWeight: 'bold',
    },
    listItemIcon: {
        minWidth: '1em',
    },
});

const AlertListItem = ({ alert }: { alert: Alert }) => {
    const classes = useStyles();
    const createdAt = moment(alert.createdAt).fromNow();

    return (
        <ListItem dense key={alert.id}>
            <ListItemIcon className={classes.listItemIcon}>
                <AlertStatus alert={alert} />
            </ListItemIcon>
            <ListItemText
                primary={alert.message}
                primaryTypographyProps={{
                    variant: 'body1',
                    className: classes.listItemPrimary,
                }}
                secondary={
                    <Typography noWrap variant="body2" color="textSecondary">
                        Created {createdAt}
                    </Typography>
                }
            />
            <ListItemSecondaryAction>
                <AlertActionsMenu alert={alert} />
            </ListItemSecondaryAction>
        </ListItem>
    );
};

const AlertsSummaryTable: FC<{ alerts: Alert[] }> = ({ alerts }) => {
    return (
        <List dense>
            {alerts.map((alert, index) => (<AlertListItem key={alert.id + index} alert={alert} />))}
            {alerts.length === 0 && <>No recent alerts</>}
        </List>
    );
};

export const AlertsSummary: FC<{ entity: Entity }> = ({ entity }) => {
    const opsgenieApi = useApi(opsgenieApiRef);

    const { value, loading, error } = useAsync(async () => await opsgenieApi.getAlertsForEntity(entity, {limit: 3}));

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <AlertUI data-testid="error-message" severity="error">
                {error.message}
            </AlertUI>
        );
    }

    return (
        <AlertsSummaryTable alerts={value!} />
    );
};
