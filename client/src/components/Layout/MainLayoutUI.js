import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  mainLayout: {
    width: '100%',
    backgroundColor: '#E5E5E5',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',

    '& .MuiAppBar-root': {
      boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
    }
  },
  childrenWrapper: {
    width: '100%'
  },
  children: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    rowGap: '16px',
    backgroundColor: '#E5E5E5',

    '@media (max-width: 500px)': {
      padding: '8px',
      rowGap: '8px'
    }
  },
  loading: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 9999
  },
  logo: {
    height: '100px',
    alignSelf: 'center',
    paddingLeft: '20px'
  }
}));

export { useStyles };
