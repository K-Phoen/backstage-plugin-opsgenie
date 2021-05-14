import React from 'react';
import { opsgenieApiRef } from '../../api';
import { useApi, Progress, ItemCardGrid, StatusOK, StatusAborted } from "@backstage/core";
import { useAsync } from "react-use";
import Alert from "@material-ui/lab/Alert";
import { Card, CardContent, CardHeader, createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { Schedule } from '../../types';
import { Pagination } from '@material-ui/lab';

const useStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginTop: theme.spacing(2),
    },
  }),
);

const OnCallForScheduleCard = ({ schedule }: { schedule: Schedule }) => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => await opsgenieApi.getOnCall(schedule.id));

    let content: React.ReactFragment;
    if (loading) {
        content = <Progress />
    } else if (error) {
        content = (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    } else {
        content = (
            <List>
                {value!.map((responder, i) => (
                    <ListItem key={i} button component="a" href={opsgenieApi.getUserDetailsURL(responder.id)}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>

                        <ListItemText primary={responder.name} />
                    </ListItem>
                ))}

                {value!.length === 0 && <ListItem><ListItemText primary="⚠️ No one on-call." /></ListItem>}
            </List>
        );
    }

    const title = (
        <div style={ {display: "flex"} }>
            {schedule.enabled ? <StatusOK /> : <StatusAborted />}
            {schedule.ownerTeam.name}
        </div>
    );

    return (
        <Card>
            <CardHeader title={title} titleTypographyProps={{variant: 'h6'}} />

            <CardContent>{content}</CardContent>
        </Card>
    );
};

const SchedulesGrid = ({ schedules }: { schedules: Schedule[] }) => {
    const classes = useStyles();
    const cardsPerPage = 5;

    const [page, setPage] = React.useState(1);
    const [offset, setOffset] = React.useState(0);
    const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setOffset((value - 1) * cardsPerPage);
        setPage(value);
    };

    return (
        <div>
            <ItemCardGrid>
                {schedules.filter((_, i) => i >= offset && i < offset + cardsPerPage).map((schedule, i) => <OnCallForScheduleCard key={i} schedule={schedule} />)}
            </ItemCardGrid>

            <Pagination className={classes.pagination} count={Math.ceil(schedules.length / cardsPerPage)} page={page} onChange={handleChange} showFirstButton showLastButton />
        </div>
    );
};

export const OnCallList = () => {
    const opsgenieApi = useApi(opsgenieApiRef);
    const { value, loading, error } = useAsync(async () => await opsgenieApi.getSchedules());

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert data-testid="error-message" severity="error">
                {error.message}
            </Alert>
        );
    }

    return <SchedulesGrid schedules={value!} />;
};
