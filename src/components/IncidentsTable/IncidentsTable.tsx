import React, { FC } from 'react';
import { Table, TableColumn, useApi } from '@backstage/core';
import { Chip } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { opsgenieApiRef } from '../../api';
import { Incident } from '../../types';
import { PriorityChip } from './PriorityChip';

export const IncidentsTable: FC<{incidents: Incident[]}> = ({ incidents }) => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const smallColumnStyle = {
        width: '5%',
        maxWidth: '5%',
    };
    const mediumColumnStyle = {
        width: '10%',
        maxWidth: '10%',
    };

    const columns: TableColumn[] = [
        {
            title: 'ID',
            field: 'tinyId',
            highlight: true,
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <Link href={opsgenieApi.getIncidentDetailsURL(rowData as Incident)}>#{(rowData as Incident).tinyId}</Link>
        },
        {
            title: 'Priority',
            field: 'priority',
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <PriorityChip incident={rowData as Incident} />
        },
        {
            title: 'Status',
            field: 'status',
            cellStyle: smallColumnStyle,
            headerStyle: smallColumnStyle,
            render: rowData => <Chip  label={(rowData as Incident).status} color={(rowData as Incident).status === 'open' ? 'secondary' : 'default'} size="small" />
        },
        {
            title: 'Description',
            field: 'message',
        },
        {
            title: 'Tags',
            field: 'tags',
            render: rowData => <>{(rowData as Incident).tags.map((tag) => <Chip label={tag} size="small" />)}</>
        },
        {
            title: 'Updated At',
            field: 'updatedAt',
            type: 'datetime',
            dateSetting: {locale: 'en-UK'},
            cellStyle: mediumColumnStyle,
            headerStyle: mediumColumnStyle,
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
            data={incidents}
        />
    );
};
