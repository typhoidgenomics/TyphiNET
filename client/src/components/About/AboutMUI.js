import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    }
  },
  cardContent: {
    padding: '24px !important',
    display: 'flex',
    flexDirection: 'column',

    '@media (max-width: 500px)': {
      padding: '16px !important'
    }
  },
  paragraph: {
    textAlign: 'justify',
    margin: '16px 0px'
  }
}));

export { useStyles };
