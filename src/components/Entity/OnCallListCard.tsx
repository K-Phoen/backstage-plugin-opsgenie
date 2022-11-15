import React from 'react';
import { useAsync } from "react-use";
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, InfoCardVariants, MissingAnnotationEmptyState } from '@backstage/core-components';
import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Alert from "@material-ui/lab/Alert";
import { OPSGENIE_TEAM_ANNOTATION } from '../../integration';
import { opsgenieApiRef } from '../../api';
import { OnCallForScheduleList } from '../OnCallList/OnCallList';

type OnCallListCardProps = {
  title?: string;
  variant?: InfoCardVariants;
};

type OnCallListContentProps = {
  teamName: string;
}

const OnCallListCardContent = ({ teamName }: OnCallListContentProps) => {
  const opsgenieApi = useApi(opsgenieApiRef);
  const { value, loading, error } = useAsync(async () => await opsgenieApi.getSchedulesForTeam(teamName));

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert data-testid="error-message" severity="error">
        {error.message}
      </Alert>
    );
  }

  return (
    <div>
      {value!.filter(schedule => schedule.enabled).map(schedule => <OnCallForScheduleList key={schedule.id} schedule={schedule} />)}
    </div>
  );
}

export const OnCallListCard = ({ title, variant }: OnCallListCardProps) => {
  const { entity } = useEntity();
  const teamName = entity.metadata.annotations?.[OPSGENIE_TEAM_ANNOTATION];

  if (!teamName) {
    return <MissingAnnotationEmptyState annotation={OPSGENIE_TEAM_ANNOTATION} />;
  }

  return (
    <InfoCard title={title || "Opsgenie – Who is on-call?"} variant={variant || "gridItem"}>
      <OnCallListCardContent teamName={teamName} />
    </InfoCard>
  )
};
