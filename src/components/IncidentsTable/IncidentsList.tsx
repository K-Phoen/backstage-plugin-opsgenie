import React from 'react';
import { useAsync } from "react-use";
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import Alert from "@material-ui/lab/Alert";
import { IncidentsTable } from './IncidentsTable';
import { Opsgenie, opsgenieApiRef } from '../../api';
import { ApiRef } from '@backstage/core-plugin-api';

export const IncidentsList = ({ref = opsgenieApiRef}: {ref?: ApiRef<Opsgenie> }) => {
  const opsgenieApi = useApi(ref);
  const { value, loading, error } = useAsync(async () => await opsgenieApi.getIncidents());

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert data-testid="error-message" severity="error">
        {error.message}
      </Alert>
    );
  }

  return (
    <IncidentsTable incidents={value!} />
  );
};
