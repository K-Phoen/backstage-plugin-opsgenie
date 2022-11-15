import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter
} from 'recharts';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { FilterZeroTooltip } from './FilterZeroTooltip';

const Graph = ({ context }: { context: Context }) => {
  const analyticsApi = useApi(analyticsApiRef);
  const dataPoints = analyticsApi.incidentsByDay(context);

  return (
    <div id="daily-incidents" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
      <ResponsiveContainer>
        <ScatterChart data={dataPoints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" name="Day" />
          <YAxis dataKey="total" name="Total" />
          <Tooltip content={<FilterZeroTooltip />} />
          <Scatter name="day" data={dataPoints} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DailyIncidents = ({ context }: { context: Context }) => {
  return (
    <InfoCard title="Incidents by day" action={<SaveAction targetRef="daily-incidents" />}>
      <Graph context={context} />
    </InfoCard>
  );
};
