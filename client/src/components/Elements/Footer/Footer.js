import { Button, Typography } from '@mui/material';
import { useStyles } from './FooterMUI';
import { Email, GitHub, Twitter } from '@mui/icons-material';

export const Footer = () => {
  const classes = useStyles();

  function handleClickContact() {
    window.open('mailto:dashboard@typhi.net', '_blank');
  }

  function handleClickDocumentation() {
    window.open('https://github.com/zadyson/TyphiNET/wiki', '_blank');
  }

  function handleClickGitHub() {
    window.open('https://github.com/zadyson/TyphiNET', '_blank');
  }

  function handleClickTwitter() {
    window.open('https://twitter.com/typhinet', '_blank');
  }

  return (
    <div className={classes.footer}>
      <div className={classes.actions}>
        <Button className={classes.button} variant="contained" onClick={handleClickContact} startIcon={<Email />}>
          Contact
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          onClick={handleClickDocumentation}
          startIcon={<GitHub />}
        >
          Documentation
        </Button>
        <Button className={classes.button} variant="contained" onClick={handleClickGitHub} startIcon={<GitHub />}>
          GitHub
        </Button>
        <Button className={classes.button} variant="contained" onClick={handleClickTwitter} startIcon={<Twitter />}>
          Twitter
        </Button>
      </div>
      <Typography className={classes.text}>
        Data obtained from:{' '}
        <a href="https://pathogen.watch" rel="noreferrer" target="_blank">
          pathogen watch project
        </a>{' '}
        on 12/09/2023.{' '}
        <a href="https://holtlab.net" rel="noreferrer" target="_blank">
          Holt Lab
        </a>
      </Typography>
    </div>
  );
};
