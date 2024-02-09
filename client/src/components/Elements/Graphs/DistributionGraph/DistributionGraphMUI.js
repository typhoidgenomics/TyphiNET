import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  distributionGraph: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    maxWidth: '920px',
    width: '100%', // Default width
    '@supports (-webkit-appearance:none)': {
      // Safari and Chrome
      width: '100%',
    },
    '@supports (-moz-appearance:none)': {
      // Firefox
      width: '100%',
    },
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
  selectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important'
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px'
    }
  },
  selectLabel: {
    paddingBottom: '4px',
    width: '100%'
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
    gridTemplateColumns: 'repeat(10, 1fr)',
    width: '540px',

    '@media (max-width: 1400px)': {
      gridTemplateColumns: 'repeat(12, 1fr)',
      width: '450px'
    },

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
    gridColumn: 'span 2',
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px',

    '@media (max-width: 1400px)': {
      gridColumn: 'span 3'
    },

    '@media (max-width: 1200px)': {
      gridColumn: 'span 4'
    },

    '@media (max-width: 1000px)': {
      gridColumn: 'span 3'
    },

    '@media (max-width: 650px)': {
      gridColumn: 'span 4'
    }
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
