import React, { FC } from 'react';
import { Page, Header, Content } from "@backstage/core";
import { AlertsList } from '../AlertsTable/AlertsList';


const AlertsPage: FC<{}> = () => {
    return (
        <Page themeId="tool">
            <Header title="OpsGenie" type="tool" />

            <Content>
                <AlertsList />
            </Content>
        </Page>
    );
};

export default AlertsPage;