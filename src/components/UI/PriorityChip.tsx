import React from 'react';
import { Chip, Tooltip, withStyles } from '@material-ui/core';

const P5Chip = withStyles({
  root: {
    backgroundColor: '#00857A',
    color: 'white',
  }
})(Chip);
const P4Chip = withStyles({
  root: {
    backgroundColor: '#36b37e',
    color: 'white',
  }
})(Chip);
const P3Chip = withStyles({
  root: {
    backgroundColor: '#ffab00',
    color: 'white',
  }
})(Chip);
const P2Chip = withStyles({
  root: {
    backgroundColor: '#ff7452',
    color: 'white',
  }
})(Chip);
const P1Chip = withStyles({
  root: {
    backgroundColor: '#bf2600',
    color: 'white',
  }
})(Chip);

const priorityLabels = {
  'P5': 'Informational',
  'P4': 'Low',
  'P3': 'Moderate',
  'P2': 'High',
  'P1': 'Critical',
} as Record<string, string>;

export const PriorityChip = ({ priority }: { priority: string }) => {
  let chip = <></>;
  switch (priority) {
    case 'P5':
      chip = <P5Chip label={priority} size="small" />;
      break;
    case 'P4':
      chip = <P4Chip label={priority} size="small" />;
      break;
    case 'P3':
      chip = <P3Chip label={priority} size="small" />;
      break;
    case 'P2':
      chip = <P2Chip label={priority} size="small" />;
      break;
    case 'P1':
      chip = <P1Chip label={priority} size="small" />;
      break;
    default:
      chip = <Chip label={priority} size="small" />;
  }

  return (
    <Tooltip title={priorityLabels[priority]}>
      <div>{chip}</div>
    </Tooltip>
  )
};
