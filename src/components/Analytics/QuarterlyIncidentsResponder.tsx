import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { SaveAction } from './SaveAction';
import { analyticsApiRef, Context } from '../../analytics';
import { PeriodByResponderGraph } from './PeriodByResponderGraph';

export const QuarterlyIncidentsResponders = ({ context }: { context: Context }) => {
  const graphId = "quarterly-incidents-responders";
  const analyticsApi = useApi(analyticsApiRef);
  const data = analyticsApi.incidentsByQuarterAndResponder(context);

  return (
    <InfoCard title="Incidents by quarter and responder" action={<SaveAction targetRef={graphId} />}>
      <div id={graphId} style={{ width: '100%', height: 450, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
        <PeriodByResponderGraph data={data!} />
      </div>
    </InfoCard>
  );
};
