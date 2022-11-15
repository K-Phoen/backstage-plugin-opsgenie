import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { colorForString } from './utils';
import { Bar, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import moment from 'moment';
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

const formatDuration = (value: number) => value === 0 ? '0 min' : moment.duration(value, 'minutes').humanize();

const DurationTooltip = (props: any) => {
  const classes = useStyles();

  if (!props.active || !props.payload || !props.payload.length) {
    return null;
  }

  const filteredPayload = props.payload.filter((item: any) => item.payload[item.dataKey] !== 0);
  if (!filteredPayload.length) {
    return null;
  }

  const items = filteredPayload.map((row: any) => {
    const value = formatDuration(row.payload[row.dataKey]);

    return (
      <p key={row.dataKey} style={{ color: row.fill }}>
        {`${row.name}: ${value}`}
      </p>
    );
  });

  return (
    <div className={classes.tooltip}>
      {items}
    </div>
  );
};

export const WeeklyImpactResponders = ({ context }: { context: Context }) => {
  const graphId = "weekly-impact-responders";
  const analyticsApi = useApi(analyticsApiRef);
  const data = analyticsApi.impactByWeekAndResponder(context);

  return (
    <InfoCard title="Average impact by week and responder" action={<SaveAction targetRef={graphId} />}>
      <div id={graphId} style={{ width: '100%', height: 450, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
        <ResponsiveContainer>
          <ComposedChart data={data.dataPoints}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="period" />
            <YAxis tickFormatter={value => value === 0 ? '0 min' : moment.duration(value, 'minutes').humanize()} />

            {data.responders.map(responder => (
              <Bar dataKey={responder} fill={colorForString(responder)} stackId="a" barSize={30} key={responder} />
            ))}

            <Tooltip content={<DurationTooltip />} />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </InfoCard>
  );
};
