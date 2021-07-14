import React, { useState } from 'react';
import { Chip } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { AlertActionsMenu } from '../Alert/AlertActionsMenu';
import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';
import { StatusChip } from './StatusChip';
import { PriorityChip } from '../UI/PriorityChip';

import { Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const AlertsTable = ({ alerts }: {alerts: Alert[]}) => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const smallColumnStyle = {
        width: '5%',
        maxWidth: '5%',
    };
    const mediumColumnStyle = {
        width: '10%',
        maxWidth: '10%',
    };

    const [alertsList, setAlertsList] = useState(alerts);

    const onAlertChanged = (newAlert: Alert) => {
        setAlertsList(alertsList.map((alert: Alert): Alert => {
            if (newAlert.id === alert.id) {
                return newAlert;
            }

            return alert;
        }));
    };

    const columns: TableColumn[] = [
        {
            title: 'ID',
            field: 'tinyId',
            highlight: true,
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <Link href={opsgenieApi.getAlertDetailsURL(rowData as Alert)}>#{(rowData as Alert).tinyId}</Link>
        },
        {
            title: 'Priority',
            field: 'priority',
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <PriorityChip priority={(rowData as Alert).priority} />
        },
        {
            title: 'Status',
            field: 'status',
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <StatusChip alert={rowData as Alert} />,
        },
        {
            title: 'Alert',
            field: 'message',
        },
        {
            title: 'Tags',
            field: 'tags',
            render: rowData => <>{(rowData as Alert).tags.map((tag) => <Chip label={tag} size="small" />)}</>
        },
        {
            title: 'Updated At',
            field: 'updatedAt',
            type: 'datetime',
            dateSetting: {locale: 'en-UK'},
            cellStyle: mediumColumnStyle,
            headerStyle: mediumColumnStyle,
        },
        {
            title: 'Actions',
            field: '',
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <AlertActionsMenu alert={rowData as Alert} onAlertChanged={onAlertChanged} />
        },
    ];

    return (
        <Table
            options={{
                sorting: true,
                search: true,
                paging: true,
                actionsColumnIndex: -1,
                pageSize: 25,
                pageSizeOptions: [25, 50, 100, 150, 200],
                padding: 'dense',
            }}
            localization={{ header: { actions: undefined } }}
            columns={columns}
            data={alertsList}
        />
    );
};
