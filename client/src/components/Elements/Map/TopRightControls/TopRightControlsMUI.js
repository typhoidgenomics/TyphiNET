import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  topRightControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    right: 0,

    '&$bp700': {
      position: 'relative'
    }
  },
  card: { borderRadius: '6px !important' },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px'
  },
  label: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px'
  },
  labelTooltipIcon: {
    cursor: 'pointer'
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
  legendWrapper: {
    marginTop: '8px',
    maxHeight: '250px',
    overflowY: 'auto'
  },
  legend: {
    display: 'flex',
    alignItems: 'center'
  },
  legendColorBox: {
    width: '10px',
    height: '10px',
    marginRight: '4px'
  },
  legendText: {
    fontSize: '10px'
  },
  bp700: {}
}));

export { useStyles };
