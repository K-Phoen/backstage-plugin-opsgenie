import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, InfoCardVariants, MissingAnnotationEmptyState } from '@backstage/core-components';
import { OPSGENIE_ANNOTATION } from '../../integration';
import { AlertsSummary } from '../AlertsSummary';

type AlertsCardProps = {
  title?: string;
  variant?: InfoCardVariants;
};

export const AlertsCard = ({ title, variant }: AlertsCardProps) => {
  const { entity } = useEntity();
  const query = entity.metadata.annotations?.[OPSGENIE_ANNOTATION];

  if (!query) {
    return (
      <MissingAnnotationEmptyState annotation={OPSGENIE_ANNOTATION} />
    );
  }

  return (
    <InfoCard title={title || "Opsgenie — Alerts"} variant={variant || "gridItem"}>
      <AlertsSummary query={query} />
    </InfoCard>
  );
};
