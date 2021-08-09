import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AlertsSummary } from './AlertsSummary';
import { InfoCard, InfoCardVariants } from '@backstage/core-components';

type AlertsCardProps = {
    title?: string;
    variant?: InfoCardVariants;
};

export const AlertsCard = ({ title, variant }: AlertsCardProps) => {
    const { entity } = useEntity();

    return (
        <InfoCard title={title || "Opsgenie — Alerts"} variant={variant || "gridItem"}>
            <AlertsSummary entity={entity} />
        </InfoCard>
    );
};
