import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  drugResistanceGraph: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    maxWidth: '920px',
    width: '-webkit-fill-available'
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '70%',
    alignItems: 'center',

    '@media (max-width: 1000px)': {
      width: '100%'
    }
  },
  select: {
    width: '100%'
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px',
    paddingBottom: '4px',
    width: '100%'
  },
  labelTooltipIcon: {
    cursor: 'pointer'
  },
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important',
    marginRight: '-80px !important'
  },
  selectButton: {
    height: '20px',
    fontSize: '10px !important',
    padding: '3px 5px !important',
    whiteSpace: 'nowrap',
    position: 'absolute',
    right: '18px'
  },
  menuPaper: {
    maxHeight: '350px !important'
  },
  selectMenu: {
    '& .MuiCheckbox-root': {
      padding: '0px 8px 0px 0px'
    },
    '& .MuiTypography-root': {
      fontSize: '14px'
    }
  },
  graphWrapper: {
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    height: '560px',
    width: '100%',

    '@media (max-width: 500px)': {
      height: '460px'
    }
  },
  graph: {
    height: '100%',
    width: '100%'
  },
  graphLabel: {
    textAnchor: 'middle'
  },
  legendWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'auto',
    flexWrap: 'wrap',
    height: '110px',
    gap: '4px',
    padding: '8px 0px 4px',
    marginLeft: '60px'
  },
  legendItemWrapper: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    paddingRight: '8px'
  },
  colorCircle: {
    height: '10px',
    width: '10px',
    borderRadius: '50%',
    minWidth: '10px'
  },
  tooltip: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: '16px',
    border: 'solid rgba(0, 0, 0, 0.25) 1px',
    rowGap: '16px'
  },
  tooltipTitle: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px',
    alignItems: 'flex-end'
  },
  tooltipContent: {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(12, 1fr)',
    width: '450px',

    '@media (max-width: 1200px)': {
      width: '320px'
    },

    '@media (max-width: 1000px)': {
      width: '450px'
    },

    '@media (max-width: 650px)': {
      width: '320px'
    },

    '@media (max-width: 400px)': {
      width: '275px'
    }
  },
  tooltipItemWrapper: {
    gridColumn: 'span 6',
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px'
  },
  tooltipItemBox: {
    height: '18px',
    width: '18px',
    border: 'solid rgb(0, 0, 0, 0.75) 0.5px',
    flex: 'none'
  },
  tooltipItemStats: {
    display: 'flex',
    flexDirection: 'column',

    '& .MuiTypography-body2': {
      overflowWrap: 'anywhere'
    }
  }
}));

export { useStyles };
