import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { PeriodByResponderGraph } from './PeriodByResponderGraph';

export const MonthlyIncidentsResponders = ({ context }: { context: Context }) => {
  const graphId = "monthly-incidents-responders";
  const analyticsApi = useApi(analyticsApiRef);
  const data = analyticsApi.incidentsByMonthAndResponder(context);

  return (
    <InfoCard title="Incidents by month and responder" action={<SaveAction targetRef={graphId} />}>
      <div id={graphId} style={{ width: '100%', height: 450, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
        <PeriodByResponderGraph data={data!} />
      </div>
    </InfoCard>
  );
};
