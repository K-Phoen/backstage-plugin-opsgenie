import React from 'react';
import { BackstageTheme } from '@backstage/theme';
import { Chip, makeStyles } from '@material-ui/core';
import Done from '@material-ui/icons/Done';
import DoneAll from '@material-ui/icons/DoneAll';
import Warning from '@material-ui/icons/Warning';
import { Alert } from '../../types';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  warning: {
    borderColor: theme.palette.status.warning,
    color: theme.palette.status.warning,
    '& *': {
      color: theme.palette.status.warning,
    },
  },
  error: {
    borderColor: theme.palette.status.error,
    color: theme.palette.status.error,
    '& *': {
      color: theme.palette.status.error,
    },
  },
  closed: {
    borderColor: theme.palette.status.ok,
    color: theme.palette.status.ok,
    '& *': {
      color: theme.palette.status.ok,
    },
  },
}));

export const StatusChip = ({ alert }: { alert: Alert }) => {
  const classes = useStyles();

  let chipClass = classes.error;
  let label = 'Unknown';
  let icon = <Warning />;
  if (alert.status === 'open' && !alert.acknowledged && !alert.isSeen) {
    chipClass = classes.error;
    label = 'Open';
    icon = <Warning />;
  } else if (alert.status === 'open' && !alert.acknowledged && alert.isSeen) {
    chipClass = classes.error;
    label = 'Seen';
    icon = <Done />;
  } else if (alert.status === 'open' && alert.acknowledged) {
    chipClass = classes.warning;
    label = 'Acknowledged';
    icon = <DoneAll />;
  } else if (alert.status === 'closed') {
    chipClass = classes.closed;
    label = 'Closed';
  }

  return (<Chip
    label={label}
    size="small"
    variant="outlined"
    icon={alert.status === "closed" ? undefined : icon}
    className={chipClass}
  />);
};
