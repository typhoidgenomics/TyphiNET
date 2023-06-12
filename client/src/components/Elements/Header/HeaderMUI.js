import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    justifyContent: 'space-between',
    minHeight: 'unset !important',
    padding: '0px !important',

    '@media (max-width: 700px)': {
      flexDirection: 'column'
    }
  },
  logoWrapper: {
    width: '30%',
    display: 'flex',
    justifyContent: 'center',

    '@media (max-width: 700px)': {
      width: '-webkit-fill-available',
      backgroundColor: '#fff',
      position: 'fixed',
      top: 0,
      zIndex: 1,
      boxShadow: '3px 0 10px 0 rgba(0,0,0,.25)'
    }
  },
  logo: {
    height: '90px',

    '@media (max-width: 700px)': {
      height: '60px'
    }
  },
  informationCards: {
    width: '70%',
    display: 'flex',
    gap: '16px',

    '@media (max-width: 700px)': {
      width: '100%',
      paddingTop: '60px'
    }
  },
  card: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '16px !important'
  },
  cardContent: {
    padding: '12px 10px !important'
  },
  actualAndTotalValues: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end'
  }
}));

export { useStyles };
