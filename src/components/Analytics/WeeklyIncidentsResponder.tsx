import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { analyticsApiRef, Context } from '../../analytics';
import { SaveAction } from './SaveAction';
import { PeriodByResponderGraph } from './PeriodByResponderGraph';

export const WeeklyIncidentsResponders = ({context}: {context: Context}) => {
    const graphId = "weekly-incidents-responders";
    const analyticsApi = useApi(analyticsApiRef);
    const data = analyticsApi.incidentsByWeekAndResponder(context);

    return (
        <InfoCard title="Incidents by week and responder" action={<SaveAction targetRef={graphId} />}>
        <div id={graphId} style={{ width: '100%', height: 450, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <PeriodByResponderGraph data={data!} />
        </div>
    </InfoCard>
    );
};
