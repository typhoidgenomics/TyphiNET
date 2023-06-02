import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0px 0px',
    columnGap: '20px',
    rowGap: '24px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    justifyContent: 'space-around',

    '@media (max-width: 750px)': {
      flexDirection: 'column'
    }
  },
  button: {
    color: '#fff !important',
    textTransform: 'none !important',
    paddingTop: '8px !important',
    paddingBottom: '8px !important',
    borderRadius: '100px !important',
    fontSize: '20px !important',
    fontWeight: '600 !important',
    height: '40px',

    '@media (max-width: 750px)': {
      width: '100%'
    }
  },
  text: {
    textAlign: 'center'
  }
}));

export { useStyles };
