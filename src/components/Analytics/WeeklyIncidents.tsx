import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { FilterZeroTooltip } from './FilterZeroTooltip';

const Graph = ({ context }: { context: Context }) => {
  const analyticsApi = useApi(analyticsApiRef);
  const dataPoints = analyticsApi.incidentsByWeekAndHours(context);

  return (
    <div id="weekly-incidents" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
      <ResponsiveContainer>
        <ComposedChart
          data={dataPoints}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Bar dataKey="businessHours" fill="#82ca9d" name="Business hours" stackId="a" barSize={30} />
          <Bar dataKey="onCallHours" fill="#8884d8" name="On-call hours" stackId="a" barSize={30} />
          <Line type="monotone" dataKey="total" name="Total" stroke="#ff7300" />
          <Tooltip content={<FilterZeroTooltip />} />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeeklyIncidents = ({ context }: { context: Context }) => {
  return (
    <InfoCard title="Incidents by week" action={<SaveAction targetRef="weekly-incidents" />}>
      <Graph context={context} />
    </InfoCard>
  );
};
