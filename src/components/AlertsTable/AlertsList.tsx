import React from 'react';
import { useAsync } from "react-use";
import { ApiRef, useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import Alert from "@material-ui/lab/Alert";
import { AlertsTable } from './AlertsTable';
import { Opsgenie, opsgenieApiRef } from '../../api';

export const AlertsList = ({ref = opsgenieApiRef}: {ref?: ApiRef<Opsgenie> }) => {
  const opsgenieApi = useApi(ref);
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
