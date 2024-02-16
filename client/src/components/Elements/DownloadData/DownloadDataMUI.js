import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  downloadDataWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0px',
    gridColumn: 'span 12',
    columnGap: '20px',

    '@media (max-width: 750px)': {
      flexDirection: 'column',
      rowGap: '8px'
    }
  },
  button: {
    color: '#fff !important',
    textTransform: 'none !important',
    paddingTop: '8px !important',
    paddingBottom: '8px !important',
    borderRadius: '100px !important',
    fontSize: '10px',

    '@media (max-width: 750px)': {
      width: '100%',
      fontSize: '12px !important'
    }
  }
}));

export { useStyles };
