import React from 'react';
import { Card, CardContent, CardHeader, Divider } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { AlertsSummary } from './AlertsSummary';


type AlertsCardProps = {
    entity: Entity
    title?: string;
};

export const AlertsCard = ({ entity, title }: AlertsCardProps) => {
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
