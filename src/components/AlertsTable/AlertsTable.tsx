import React, { FC } from 'react';
import { Table, TableColumn } from '@backstage/core';
import { Alert } from '../../types';
import { Chip } from '@material-ui/core';


export const AlertsTable: FC<{alerts: Alert[]}> = ({ alerts }) => {
    const columns: TableColumn[] = [
        {
            title: 'ID',
            field: 'tinyId',
            highlight: true,
        },
        { title: 'Message', field: 'message' },
        { title: 'Status', field: 'status' },
        { title: 'Acknowledged', field: 'acknowledged', type: 'boolean' },
        {
            title: 'Tags',
            field: 'tags',
            render: rowData => <>{(rowData as Alert).tags.map((tag) => <Chip label={tag} />)}</>
        },
        { title: 'Updated At', field: 'updatedAt', type: 'datetime', dateSetting: {locale: 'en-UK'} },
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
            }}
            localization={{ header: { actions: undefined } }}
            columns={columns}
            data={alerts}
        />
    );
};
