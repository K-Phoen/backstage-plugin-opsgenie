import React from 'react';
import { AlertsList } from '../AlertsTable';
import { IncidentsList } from '../IncidentsTable';
import { OnCallList } from '../OnCallList';
import { Analytics } from '../Analytics';
import { Layout } from './Layout';
import { OpsgeniePageProps } from "./OpsgeniePage";

export const DefaultOpsgeniePage = ({ onCallListCardsCount }: OpsgeniePageProps) => {
  return (
    <Layout>
      <Layout.Route path="who-is-on-call" title="Who is on-call">
        <OnCallList cardsPerPage={onCallListCardsCount} />
      </Layout.Route>
      <Layout.Route path="alerts" title="Alerts">
        <AlertsList />
      </Layout.Route>
      <Layout.Route path="incidents" title="Incidents">
        <IncidentsList />
      </Layout.Route>
      <Layout.Route path="analytics" title="Analytics">
        <Analytics />
      </Layout.Route>
    </Layout>
  );
};
