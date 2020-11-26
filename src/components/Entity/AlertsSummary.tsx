import React, { FC } from 'react';
import { Progress, StatusError, StatusOK, useApi } from '@backstage/core';
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, makeStyles, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { useAsync } from 'react-use';
import { Alert as AlertUI } from '@material-ui/lab';
import { Entity } from '@backstage/catalog-model';
import moment from "moment";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';

const useStyles = makeStyles({
    denseListIcon: {
        marginRight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItemPrimary: {
        fontWeight: 'bold',
    },
    listItemIcon: {
        minWidth: '1em',
    },
});

const AlertActionsMenu = ({ alert }: { alert: Alert }) => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id={`actions-menu-${alert.id}`}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {maxHeight: 48 * 4.5,},
                }}
            >
                {!alert.acknowledged && alert.status !== 'closed' &&
                    (<MenuItem key="ack" onClick={handleClose}>
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Acknowledge
                        </Typography>
                    </MenuItem>)
                }

                {alert.status !== 'closed' &&
                    (<MenuItem key="close" onClick={handleClose}>
                        <ListItemIcon>
                            <CheckCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="inherit" noWrap>
                            Close
                        </Typography>
                    </MenuItem>)
                }

                <MenuItem key="details" onClick={handleClose}>
                    <ListItemIcon>
                        <OpenInNewIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                        <Link href={opsgenieApi.getAlertDetailsURL(alert)}>View in OpsGenie</Link>
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

const AlertStatus = ({ alert }: { alert: Alert }) => {
    const classes = useStyles();

    return (
        <Tooltip title={alert.status} placement="top">
            <div className={classes.denseListIcon}>
                {alert.status === 'open' ? <StatusError /> : <StatusOK />}
            </div>
        </Tooltip>
    );
};

const AlertListItem = ({ alert }: { alert: Alert }) => {
    const classes = useStyles();
    const createdAt = moment(alert.createdAt).fromNow();

    return (
        <ListItem dense key={alert.id}>
            <ListItemIcon className={classes.listItemIcon}>
                <AlertStatus alert={alert} />
            </ListItemIcon>
            <ListItemText
                primary={alert.message}
                primaryTypographyProps={{
                    variant: 'body1',
                    className: classes.listItemPrimary,
                }}
                secondary={
                    <Typography noWrap variant="body2" color="textSecondary">
                        Created {createdAt}
                    </Typography>
                }
            />
            <ListItemSecondaryAction>
                <AlertActionsMenu alert={alert} />
            </ListItemSecondaryAction>
        </ListItem>
    );
};

const AlertsSummaryTable: FC<{ alerts: Alert[] }> = ({ alerts }) => {
    return (
        <List dense>
            {alerts.map((alert, index) => (<AlertListItem key={alert.id + index} alert={alert} />))}
            {alerts.length === 0 && <>No recent alerts</>}
        </List>
    );
};

export const AlertsSummary: FC<{ entity: Entity }> = ({ entity }) => {
    const opsgenieApi = useApi(opsgenieApiRef);

    const { value, loading, error } = useAsync(async () => await opsgenieApi.getAlertsForEntity(entity, {limit: 3}));

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <AlertUI data-testid="error-message" severity="error">
                {error.message}
            </AlertUI>
        );
    }

    return (
        <AlertsSummaryTable alerts={value!} />
    );
};
