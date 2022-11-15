import React from 'react';
import { useAsync } from "react-use";
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import Alert from "@material-ui/lab/Alert";
import { AlertsTable } from './AlertsTable';
import { opsgenieApiRef } from '../../api';

export const AlertsList = () => {
  const opsgenieApi = useApi(opsgenieApiRef);

  const { value, loading, error } = useAsync(async () => await opsgenieApi.getAlerts());

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert data-testid="error-message" severity="error">
        {error.message}
      </Alert>
    );
  }

  return <AlertsTable alerts={value!} />;
};
