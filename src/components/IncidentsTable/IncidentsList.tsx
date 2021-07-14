import React from 'react';
import {opsgenieApiRef} from '../../api';
import {useAsync} from "react-use";
import Alert from "@material-ui/lab/Alert";
import { IncidentsTable } from './IncidentsTable';


import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';


export const IncidentsList = () => {
    const opsgenieApi = useApi(opsgenieApiRef);

    const {value, loading, error} = useAsync(async () => await opsgenieApi.getIncidents());

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
