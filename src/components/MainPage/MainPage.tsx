import React from 'react';
import { Page, Header, Content, Tabs } from "@backstage/core";
import { AlertsList } from '../AlertsTable';
import { IncidentsList } from '../IncidentsTable';
import { OnCallList } from '../OnCallList';

const MainPage = () => {
    return (
        <Page themeId="tool">
            <Header title="Opsgenie" type="tool" />

            <Content>
                <Tabs
                    tabs={[
                        {
                            label: 'Who is on-call',
                            content: <OnCallList />,
                        },
                        {
                            label: 'Alerts',
                            content: <AlertsList />,
                        },
                        {
                            label: 'Incidents',
                            content: <IncidentsList />,
                        },
                    ]}
                />
            </Content>
        </Page>
    );
};

export default MainPage;