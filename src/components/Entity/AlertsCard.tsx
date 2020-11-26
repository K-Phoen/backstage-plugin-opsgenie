import React, { FC } from 'react';
import { Card, CardContent, CardHeader, Divider } from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { AlertsSummary } from './AlertsSummary';


export const AlertsCard: FC<{ entity: Entity }> = ({ entity }) => {
    return (
        <Card>
            <CardHeader title="OpsGenie — Alerts" />
            <Divider />
            <CardContent>
                <AlertsSummary entity={entity} />
            </CardContent>
        </Card>
      );
};
