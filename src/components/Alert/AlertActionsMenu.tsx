import React from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DoneAll from '@material-ui/icons/DoneAll';
import { opsgenieApiRef } from '../../api';
import { Alert } from '../../types';
import { Link } from '@backstage/core-components';

export const AlertActionsMenu = ({ alert, onAlertChanged }: { alert: Alert, onAlertChanged?: (alert: Alert) => void }) => {
  const opsgenieApi = useApi(opsgenieApiRef);
  const alertApi = useApi(alertApiRef);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const callback = onAlertChanged || ((_: Alert): void => { });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAcknowledge = async (): Promise<void> => {
    try {
      await opsgenieApi.acknowledgeAlert(alert);
      handleCloseMenu();
      alertApi.post({ message: 'Alert acknowledged.' });

      alert.acknowledged = true;
      callback(alert);
    } catch (err) {
      alertApi.post({ message: `Could not acknowledge alert: ${err}`, severity: 'error' });
    }
  };

  const handleCloseAlert = async (): Promise<void> => {
    try {
      await opsgenieApi.closeAlert(alert);
      handleCloseMenu();
      alertApi.post({ message: 'Alert closed.' });

      alert.status = 'closed';
      callback(alert);
    } catch (err) {
      alertApi.post({ message: `Could not close alert: ${err}`, severity: 'error' });
    }
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
        onClose={handleCloseMenu}
        PaperProps={{
          style: { maxHeight: 48 * 4.5, },
        }}
      >
        {!alert.acknowledged && alert.status !== 'closed' && !opsgenieApi.isReadOnly() &&
          (<MenuItem key="ack" onClick={handleAcknowledge}>
            <ListItemIcon>
              <DoneAll fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Acknowledge
            </Typography>
          </MenuItem>)
        }

        {alert.status !== 'closed' && !opsgenieApi.isReadOnly() &&
          (<MenuItem key="close" onClick={handleCloseAlert}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>
              Close
            </Typography>
          </MenuItem>)
        }

        <MenuItem key="details" onClick={handleCloseMenu}>
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit" noWrap>
            <Link to={opsgenieApi.getAlertDetailsURL(alert)}>View in Opsgenie</Link>
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
