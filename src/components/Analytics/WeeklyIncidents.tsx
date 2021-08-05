import React from 'react';
import moment from "moment"
import { IconButton } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { opsgenieApiRef } from '../../api';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';
import { Incident } from '../../types';
import domtoimage from "dom-to-image";
import fileDownload from "js-file-download";

const isBusinessHours = (incidentStartedAt: moment.Moment): boolean  => {
    return incidentStartedAt.hour() >= 9 && incidentStartedAt.hour() < 18;
};

const WeeklyIncidentsGraph = ({ incidents }: { incidents: Incident[] }) => {
    const incidentsBuckets: Record<string, { businessHours: number, onCallHours: number, total: number, date: moment.Moment }> = {};

    let minDate: moment.Moment = moment().startOf('isoWeek');
    let maxDate: moment.Moment = moment().startOf('isoWeek');

    incidents.forEach((incident) => {
        const incidentDate = moment(incident.impactStartDate);
        const week = `w${incidentDate.isoWeek()} - ${incidentDate.year()}`;

        if (!incidentsBuckets[week]) {
            incidentsBuckets[week] = {
                businessHours: 0,
                onCallHours: 0,
                total: 0,
                date: incidentDate,
            };
        }

        incidentsBuckets[week].total += 1;
        if (isBusinessHours(incidentDate)) {
            incidentsBuckets[week].businessHours += 1;
        } else {
            incidentsBuckets[week].onCallHours += 1;
        }

        if (incidentDate < minDate) {
            minDate = incidentDate.clone().startOf('isoWeek');
        }
    });

    // add empty buckets for weeks with no incident
    while (minDate <= maxDate) {
        const week = `w${minDate.isoWeek()} - ${minDate.year()}`;
        console.log(week);
        if (!incidentsBuckets[week]) {
            incidentsBuckets[week] = {
                businessHours: 0,
                onCallHours: 0,
                total: 0,
                date: minDate.clone(),
            };
        }

        minDate.add(1, 'weeks');
    }

    const data = Object.keys(incidentsBuckets).map(week => (
        {
            week: week,
            businessHours: incidentsBuckets[week].businessHours,
            onCallHours: incidentsBuckets[week].onCallHours,
            total: incidentsBuckets[week].total,
            date: incidentsBuckets[week].date,
        }
    ));

    data.sort((a, b) => {
        if (a.date < b.date) {
            return -1;
        }
        if (a.date > b.date) {
            return 1;
        }

        return 0;
    });

    return (
        <div id="weekly-incidents" style={{ width: '100%', height: 300, paddingTop: '1.2rem', paddingRight: '1.2rem' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Bar dataKey="businessHours" fill="#82ca9d" name="Business hours" stackId="a" barSize={30} />
                    <Bar dataKey="onCallHours" fill="#8884d8" name="On-call hours" stackId="a" barSize={30} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#ff7300" />
                    <Tooltip />
                    <Legend />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

const exportGraph = (domNodeId: string) => {
    const node = document.getElementById(domNodeId);
    if (!node) {
        return;
    }

    domtoimage.toBlob(node, {bgcolor: 'white'})
        .then(function (blob: Blob) {
            fileDownload(blob, domNodeId+'.png');
        });
}

export const WeeklyIncidents = () => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => await opsgenieApi.getIncidents({ limit: 100 }));

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    }

    const onExport = () => {
        exportGraph("weekly-incidents");
    };

    const action = (
        <IconButton aria-label="save" title="Save as image" onClick={onExport}>
            <SaveAltIcon />
        </IconButton>
    );
    return (
        <InfoCard title="Incidents by week" action={action}>
            <WeeklyIncidentsGraph incidents={value!} />
        </InfoCard>
    );
};
