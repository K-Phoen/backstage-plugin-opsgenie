import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  tooltip: {
      backgroundColor: theme.palette.background.default,
      paddingLeft: '1rem',
      paddingRight: '1rem',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      borderRadius: '5px',
      border: '1px solid white',
      borderColor: theme.palette.grey[300],
  },
}));

export const FilterZeroTooltip = (props: any) => {
  const classes = useStyles();

  if (!props.active || !props.payload || !props.payload.length) {
    return null;
  }

  const filteredPayload = props.payload.filter((item: any) => item.payload[item.dataKey] !== 0);
  if (!filteredPayload.length) {
    return null;
  }

  const items = filteredPayload.map((row: any) => <p key={row.dataKey} style={{color: row.fill}}>{`${row.name}: ${row.payload[row.dataKey]}`}</p>)

  return (
    <div className={classes.tooltip}>
      {items}
    </div>
  );
};