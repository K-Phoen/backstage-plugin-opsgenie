import React from 'react';
import { BackstageTheme } from '@backstage/theme';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useErrorOutlineStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    marginRight: theme.spacing(1),
    fill: theme.palette.infoText,
  },
}));

const ErrorOutlineStyled = () => {
  const classes = useErrorOutlineStyles();
  return <ErrorOutline classes={classes} />;
};
const ExpandMoreIconStyled = () => {
  const classes = useErrorOutlineStyles();
  return <ExpandMoreIcon classes={classes} />;
};

const useStyles = makeStyles<BackstageTheme>(theme => ({
  panel: {
    backgroundColor: theme.palette.infoBackground,
    color: theme.palette.infoText,
    verticalAlign: 'middle',
    marginBottom: '1rem',
  },
  summary: {
    display: 'flex',
    flexDirection: 'row',
  },
  summaryText: {
    color: theme.palette.infoText,
    fontWeight: 'bold',
  },
  message: {
    width: '100%',
    display: 'block',
    color: theme.palette.infoText,
    backgroundColor: theme.palette.infoBackground,
    '& > a': {
      textDecoration: 'underline'
    }
  },
  details: {
    width: '100%',
    display: 'block',
    color: theme.palette.textContrast,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.border}`,
    padding: theme.spacing(2.0),
    fontFamily: 'sans-serif',
  },
}));

type Props = {
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * InfoPanel. Show a user friendly message to a user.
 *
 * @param {string} [title] A title for the info panel.
 * @param {Object} [message] Optional more detailed user-friendly message elaborating on the cause of the error.
 * @param {Object} [children] Objects to provide context, such as a stack trace or detailed error reporting.
 *  Will be available inside an unfolded accordion.
 */
export const InfoPanel = (props: Props) => {
  const classes = useStyles(props);
  const { title, message, children } = props;

  return (
    <Accordion className={classes.panel}>
      <AccordionSummary
        expandIcon={<ExpandMoreIconStyled />}
        className={classes.summary}
      >
        <ErrorOutlineStyled />
        <Typography className={classes.summaryText} variant="subtitle1">
          {title}
        </Typography>
      </AccordionSummary>
      {(message || children) && (
        <AccordionDetails>
          <Grid container>
            {message && (
              <Grid item xs={12}>
                <Typography className={classes.message} variant="body1">
                  {message}
                </Typography>
              </Grid>
            )}
            {children && (
              <Grid item xs={12} className={classes.details}>
                {children}
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      )}
    </Accordion>
  );
};
