import React, { FC } from 'react';
import { Page, Header, Content, Tabs } from "@backstage/core";
import { AlertsList } from '../AlertsTable';
import { IncidentsList } from '../IncidentsTable';


const MainPage: FC<{}> = () => {
    return (
        <Page themeId="tool">
            <Header title="OpsGenie" type="tool" />

            <Content>
                <Tabs
                    tabs={[
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