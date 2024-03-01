import React, { useEffect } from 'react';
import { useAsync } from "react-use";
import { useApi } from '@backstage/core-plugin-api';
import { Progress, ItemCardGrid, StatusOK, StatusAborted } from '@backstage/core-components';
import Alert from "@material-ui/lab/Alert";
import { Card, CardContent, CardHeader, createStyles, TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText, makeStyles, Tooltip } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { Pagination } from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import { OnCallParticipantRef, Schedule } from '../../types';
import { opsgenieApiRef } from '../../api';

const useStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginTop: theme.spacing(2),
    },
    search: {
      marginBottom: theme.spacing(2),
    },
    onCallItemGrid: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(32em, 1fr))',
    }
  }),
);

type ResponderTitleFormatter = (responder: OnCallParticipantRef, schedule: Schedule) => string;

const defaultResponderTitle = (responder: OnCallParticipantRef, _: Schedule) => {
  return responder.name;
};

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

export type OnCallForScheduleListProps = {
  schedule: Schedule;
  responderFormatter?: ResponderTitleFormatter,
};

export const OnCallForScheduleList = ({ schedule, responderFormatter }: OnCallForScheduleListProps) => {
  const opsgenieApi = useApi(opsgenieApiRef);
  const { value, loading, error } = useAsync(async () => await opsgenieApi.getOnCall(schedule.id));

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert data-testid="error-message" severity="error">
        {error.message}
      </Alert>
    );
  }

  const titleFormatter = responderFormatter || defaultResponderTitle;

  return (
    <List>
      {value!.map((responder, i) => (
        <ListItem key={i} button component="a" href={opsgenieApi.getUserDetailsURL(responder.id)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          
          <ListItemText primary={titleFormatter(responder, schedule)} />
        </ListItem>
      ))}

      {value!.length === 0 && (
        <ListItem>
          <ListItemText primary="⚠️ No one on-call for this schedule." />
        </ListItem>
      )}
    </List>
  );
};

export const OnCallForScheduleCard = ({ schedule, responderFormatter }: { schedule: Schedule, responderFormatter?: ResponderTitleFormatter }) => {
  const title = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Tooltip title={schedule.enabled ? 'Enabled' : 'Disabled'}>
        <div>{schedule.enabled ? <StatusOK /> : <StatusAborted />}</div>
      </Tooltip>
      {schedule.ownerTeam.name}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontSize: '70%',
          marginLeft: '1.25rem',
        }}
      >
        {schedule.name}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <OnCallForScheduleList schedule={schedule} responderFormatter={responderFormatter} />
      </CardContent>
    </Card>
  );
};

const SchedulesGrid = ({ schedules, cardsPerPage, responderFormatter }: { schedules: Schedule[], cardsPerPage: number, responderFormatter?: ResponderTitleFormatter }) => {
  const classes = useStyles();
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

      <ItemCardGrid classes={{ root: classes.onCallItemGrid }}>
        {results.filter((_, i) => i >= offset && i < offset + cardsPerPage).map(schedule => <OnCallForScheduleCard key={schedule.id} schedule={schedule} responderFormatter={responderFormatter} />)}
      </ItemCardGrid>

      <Pagination
        className={classes.pagination}
        count={Math.ceil(results.length / cardsPerPage)}
        page={page}
        onChange={handleChange}
        showFirstButton
        showLastButton
      />
    </div>
  );
};

export type OnCallListProps = {
  cardsPerPage?: number;
  responderFormatter?: ResponderTitleFormatter;
};

export const OnCallList = ({ cardsPerPage, responderFormatter }: OnCallListProps) => {
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

  return <SchedulesGrid schedules={value!.filter(schedule => schedule.enabled)} cardsPerPage={cardsPerPage || 6} responderFormatter={responderFormatter} />;
};
