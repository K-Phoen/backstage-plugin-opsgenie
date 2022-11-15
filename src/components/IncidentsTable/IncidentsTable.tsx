import React from 'react';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Chip } from '@material-ui/core';
import { PriorityChip } from '../UI/PriorityChip';
import { opsgenieApiRef } from '../../api';
import { Incident } from '../../types';

export const IncidentsTable = ({ incidents }: { incidents: Incident[] }) => {
  const opsgenieApi = useApi(opsgenieApiRef);
  const smallColumnStyle = {
    width: '5%',
    maxWidth: '5%',
  };
  const mediumColumnStyle = {
    width: '10%',
    maxWidth: '10%',
  };

  const columns: TableColumn<Incident>[] = [
    {
      title: 'ID',
      field: 'tinyId',
      highlight: true,
      cellStyle: smallColumnStyle,
      headerStyle: smallColumnStyle,
      render: rowData => <Link to={opsgenieApi.getIncidentDetailsURL(rowData)}>#{(rowData).tinyId}</Link>
    },
    {
      title: 'Priority',
      field: 'priority',
      cellStyle: smallColumnStyle,
      headerStyle: smallColumnStyle,
      render: rowData => <PriorityChip priority={rowData.priority} />
    },
    {
      title: 'Status',
      field: 'status',
      cellStyle: smallColumnStyle,
      headerStyle: smallColumnStyle,
      render: rowData => <Chip label={rowData.status} color={rowData.status === 'open' ? 'secondary' : 'default'} size="small" />
    },
    {
      title: 'Description',
      field: 'message',
    },
    {
      title: 'Tags',
      field: 'tags',
      render: rowData => <>{rowData.tags.map((tag, i) => <Chip label={tag} key={i} size="small" />)}</>
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-UK' },
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
