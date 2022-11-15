import React, { useState } from 'react';
import { Chip } from '@material-ui/core';
import { Link, Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AlertActionsMenu } from '../Alert/AlertActionsMenu';
import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';
import { StatusChip } from './StatusChip';
import { PriorityChip } from '../UI/PriorityChip';

export const AlertsTable = ({ alerts }: { alerts: Alert[] }) => {
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

  const columns: TableColumn<Alert>[] = [
    {
      title: 'ID',
      field: 'tinyId',
      highlight: true,
      cellStyle: smallColumnStyle,
      headerStyle: smallColumnStyle,
      render: rowData => <Link to={opsgenieApi.getAlertDetailsURL(rowData)}>#{rowData.tinyId}</Link>
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
      render: rowData => <StatusChip alert={rowData} />,
    },
    {
      title: 'Alert',
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
    {
      title: 'Actions',
      field: '',
      cellStyle: smallColumnStyle,
      headerStyle: smallColumnStyle,
      render: rowData => <AlertActionsMenu alert={rowData} onAlertChanged={onAlertChanged} />
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
