import React from 'react';
import { makeStyles, Tooltip } from "@material-ui/core";
import { StatusError, StatusOK } from '@backstage/core-components';
import { Alert } from "../../types";

const useStyles = makeStyles({
  denseListIcon: {
    marginRight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const AlertStatus = ({ alert }: { alert: Alert }) => {
  const classes = useStyles();

  return (
    <Tooltip title={alert.status} placement="top">
      <div className={classes.denseListIcon}>
        {alert.status === 'open' ? <StatusError /> : <StatusOK />}
      </div>
    </Tooltip>
  );
};
