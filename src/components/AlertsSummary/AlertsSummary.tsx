import React, { useState } from 'react';
import { useAsync } from 'react-use';
import moment from "moment";
import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { Alert as AlertUI } from '@material-ui/lab';
import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';
import { AlertStatus, AlertActionsMenu } from '../Alert';

const useStyles = makeStyles({
  listItemPrimary: {
    fontWeight: 'bold',
    whiteSpace: 'normal',
  },
  listItemIcon: {
    minWidth: '1em',
  },
});

const AlertListItem = ({ alert }: { alert: Alert }) => {
  const classes = useStyles();
  const [alertState, setAlertState] = useState({ data: alert, updatedAt: alert.updatedAt });

  const onAlertChanged = (newAlert: Alert) => {
    setAlertState({
      data: newAlert,
      updatedAt: (new Date()).toISOString(),
    });
  };

  return (
    <ListItem dense key={alertState.data.id}>
      <ListItemIcon className={classes.listItemIcon}>
        <AlertStatus alert={alertState.data} />
      </ListItemIcon>
      <ListItemText
        primary={alertState.data.message}
        primaryTypographyProps={{
          variant: 'body1',
          className: classes.listItemPrimary,
        }}
        secondary={
          <Typography noWrap variant="body2" color="textSecondary">
            Created {moment(alertState.data.createdAt).fromNow()}
          </Typography>
        }
      />
      <ListItemSecondaryAction>
        <AlertActionsMenu alert={alertState.data} onAlertChanged={onAlertChanged} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const AlertsSummaryTable = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <List dense>
      {alerts.map((alert, index) => (<AlertListItem key={alert.id + index} alert={alert} />))}
      {alerts.length === 0 && <>No recent alerts</>}
    </List>
  );
};

export const AlertsSummary = ({ query }: { query: string }) => {
  const opsgenieApi = useApi(opsgenieApiRef);
  const { value, loading, error } = useAsync(async () => await opsgenieApi.getAlerts({ limit: 3, query: query }));

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
