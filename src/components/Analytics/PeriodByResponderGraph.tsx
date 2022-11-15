import React from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Line
} from 'recharts';
import { IncidentsByResponders } from '../../analytics';
import { FilterZeroTooltip } from './FilterZeroTooltip';
import { colorForString } from './utils';

export const PeriodByResponderGraph = ({ data }: { data: IncidentsByResponders }) => {
  return (
    <ResponsiveContainer>
      <ComposedChart data={data.dataPoints}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        {data.responders.map(responder => (
          <Bar dataKey={responder} fill={colorForString(responder)} stackId="a" barSize={30} key={responder} />
        ))}
        <Line type="monotone" dataKey="total" name="Total" stroke="#ff7300" />
        <Tooltip content={<FilterZeroTooltip />} />
        <Legend />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
