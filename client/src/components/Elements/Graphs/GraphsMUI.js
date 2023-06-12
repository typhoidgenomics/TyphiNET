import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  graphsCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    overflow: 'visible !important',

    '@media (max-width: 500px)': {
      rowGap: '8px',
      padding: '8px'
    },

    '&.MuiCard-root': {
      borderRadius: '16px'
    }
  },
  card: {
    gridColumn: 'span 6',
    overflow: 'visible !important',
    display: 'flex',
    flexDirection: 'column',

    '&.MuiCard-root': {
      borderRadius: '16px'
    },

    '@media (max-width: 1000px)': {
      gridColumn: 'span 12'
    }
  },
  cardActions: {
    display: 'flex',
    columnGap: '8px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px 16px 0px !important'
  },
  cardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '16px',
    textAlign: 'center'
  },
  downloadWrapper: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px'
  }
}));

export { useStyles };
