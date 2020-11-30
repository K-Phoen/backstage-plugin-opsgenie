import React, { FC } from 'react';
import { Card, CardContent, CardHeader, Divider } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { AlertsSummary } from './AlertsSummary';


type AlertsCardProps = {
    entity: Entity
    title?: string;
};

export const AlertsCard: FC<AlertsCardProps> = ({ entity, title }) => {
    return (
        <Card>
            <CardHeader title={title || "OpsGenie — Alerts"} />
            <Divider />
            <CardContent>
                <AlertsSummary entity={entity} />
            </CardContent>
        </Card>
      );
};
