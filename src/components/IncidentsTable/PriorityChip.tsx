import React from 'react';
import { Chip, withStyles } from '@material-ui/core';
import { Incident } from '../../types';

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

export const PriorityChip = ({ incident }: {incident: Incident}) => {
    const label = `${incident.priority} — ${priorityLabels[incident.priority]}`;

    switch (incident.priority) {
        case 'P5':
            return <P5Chip label={label} size="small" />;
        case 'P4':
            return <P4Chip label={label} size="small" />;
        case 'P3':
            return <P3Chip label={label} size="small" />;
        case 'P2':
            return <P2Chip label={label} size="small" />;
        case 'P1':
            return <P1Chip label={label} size="small" />;
        default:
            return <Chip label={label} size="small" />;
    }
};
