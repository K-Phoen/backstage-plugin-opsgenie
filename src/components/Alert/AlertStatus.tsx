import React from 'react';
import { makeStyles, Tooltip } from "@material-ui/core";
import { Alert } from "../../types";
import { StatusError, StatusOK } from '@backstage/core-components';

const useStyles = makeStyles({
    denseListIcon: {
        marginRight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export const AlertStatus = ({ alert }: { alert: Alert }) => {
    const classes = useStyles();

    return (
        <Tooltip title={alert.status} placement="top">
            <div className={classes.denseListIcon}>
                {alert.status === 'open' ? <StatusError /> : <StatusOK />}
            </div>
        </Tooltip>
    );
};
