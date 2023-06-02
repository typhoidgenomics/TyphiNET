import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  resetButton: {
    position: 'fixed',
    right: 16,
    bottom: 0,
    padding: '16px',

    '@media (max-width: 500px)': {
      right: 8,
      padding: '8px'
    }
  }
}));

export { useStyles };
