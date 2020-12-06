import React, {FC} from 'react';
import {opsgenieApiRef} from '../../api';
import {useApi, Progress} from "@backstage/core";
import {useAsync} from "react-use";
import Alert from "@material-ui/lab/Alert";
import { IncidentsTable } from './IncidentsTable';


export const IncidentsList: FC<{}> = () => {
    const opsgenieApi = useApi(opsgenieApiRef);

    const {value, loading, error } = useAsync(async () => await opsgenieApi.getIncidents());

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
