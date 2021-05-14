import React, { useEffect } from 'react';
import { opsgenieApiRef } from '../../api';
import { useApi, Progress, ItemCardGrid, StatusOK, StatusAborted } from "@backstage/core";
import { useAsync } from "react-use";
import Alert from "@material-ui/lab/Alert";
import { Card, CardContent, CardHeader, createStyles, TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { Schedule } from '../../types';
import { Pagination } from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginTop: theme.spacing(2),
    },
    search: {
      marginBottom: theme.spacing(2),
    },
  }),
);

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler);
        };
      },
      [value, delay] // Only re-call effect if value or delay changes
    );

    return debouncedValue;
  }

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

    const [results, setResults] = React.useState(schedules);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [offset, setOffset] = React.useState(0);
    const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setOffset((value - 1) * cardsPerPage);
        setPage(value);
    };
    const debouncedSearch = useDebounce(search, 300);

    // debounced search
    useEffect(
        () => {
            if (!debouncedSearch) {
                setResults(schedules);
                return;
            }

            const filtered = schedules.filter(schedule => {
                return schedule.name.toLowerCase().includes(debouncedSearch.toLowerCase());
            });
            setResults(filtered);
        },
        [debouncedSearch, schedules]
      );

    return (
        <div>
            <TextField
                fullWidth
                variant="outlined"
                className={classes.search}
                placeholder="Team…"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
                onChange={e => setSearch(e.target.value)}
            />

            <ItemCardGrid>
                {results.filter((_, i) => i >= offset && i < offset + cardsPerPage).map(schedule => <OnCallForScheduleCard key={schedule.id} schedule={schedule} />)}
            </ItemCardGrid>

            <Pagination className={classes.pagination} count={Math.ceil(results.length / cardsPerPage)} page={page} onChange={handleChange} showFirstButton showLastButton />
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
