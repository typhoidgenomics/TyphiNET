import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  topLeftControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,

    '&$bp700': {
      position: 'relative',

      '& $yearWrapper': {
        width: '100%'
      },
      '& $datasetWrapper .MuiToggleButton-root': {
        width: '100%'
      }
    }
  },
  card: { borderRadius: '6px !important' },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    textAlign: 'start'
  },
  datasetWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    textAlign: 'start'
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px'
    }
  },
  yearsWrapper: {
    display: 'flex',
    columnGap: '4px',
    paddingTop: '8px'
  },
  yearWrapper: {
    width: '78px'
  },
  menuPaper: {
    maxHeight: '350px !important'
  },
  bp700: {}
}));

export { useStyles };
