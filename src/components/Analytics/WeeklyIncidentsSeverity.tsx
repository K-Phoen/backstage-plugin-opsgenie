import React from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { FilterZeroTooltip } from './FilterZeroTooltip';

const Graph = ({ context }: { context: Context }) => {
  const analyticsApi = useApi(analyticsApiRef);
  const dataPoints = analyticsApi.incidentsByWeekAndSeverity(context);

  return (
    <div id="weekly-incidents-severity" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
      <ResponsiveContainer>
        <ComposedChart data={dataPoints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Bar dataKey="p1" fill="#bf2600" name="P1 - Critical" stackId="a" barSize={30} />
          <Bar dataKey="p2" fill="#ff7452" name="P2 - High" stackId="a" barSize={30} />
          <Bar dataKey="p3" fill="#ffab00" name="P3 - Moderate" stackId="a" barSize={30} />
          <Bar dataKey="p4" fill="#36b37e" name="P4 - Low" stackId="a" barSize={30} />
          <Bar dataKey="p5" fill="#00857A" name="P5 - Informational" stackId="a" barSize={30} />
          <Tooltip content={<FilterZeroTooltip />} />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WeeklyIncidentsSeverity = ({ context }: { context: Context }) => {
  return (
    <InfoCard title="Incidents by week and severity" action={<SaveAction targetRef="weekly-incidents-severity" />}>
      <Graph context={context} />
    </InfoCard>
  );
};
