import React from 'react';
import { useApi } from '@backstage/core';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';


export const AlertActionsMenu = ({ alert }: { alert: Alert }) => {
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