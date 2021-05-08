import React from 'react';
import { Card, CardContent, CardHeader, Divider } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { AlertsSummary } from './AlertsSummary';


type AlertsCardProps = {
    title?: string;
};

export const AlertsCard = ({ title }: AlertsCardProps) => {
    const { entity } = useEntity();

    return (
        <Card>
            <CardHeader title={title || "Opsgenie — Alerts"} />
            <Divider />
            <CardContent>
                <AlertsSummary entity={entity} />
            </CardContent>
        </Card>
      );
};
