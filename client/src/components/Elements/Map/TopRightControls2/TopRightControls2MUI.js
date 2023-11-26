import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  topRightControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: '200px',
    width:'450px',
    maxHeight:'300px',
    alignItems:"normal",
    // overflowY: 'auto',
    // width:'25%',
    '@media (max-width: 1000px)': {
      // width: 
    },
    '@media (max-width: 700px)': {
      position: 'relative',
      marginTop: '0px',
      width:'100%',
    },
    // '&$bp700': {
    //   position: 'relative'
    // }
    
  },

  dropdown:{
    '& .MuiTypography-root': {
      fontSize: '14px',
      height:'20px',
      padding:'0px'
      // width:'20px',
    }
  },
  checkbox:{
    '& .MuiCheckbox-root': {
      backgroundColor:'blue',
      color:'red',
      padding:'0px'
      // width:'20px',
    }
  },
  card: { borderRadius: '6px !important' },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px'
  },
  frequenciesGraph: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    textAlign: 'justify',
  },
  selectsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px'
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px'
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px'
  },
  labelTooltipIcon: {
    cursor: 'pointer'
  },
   label: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: '8px'
  },
  dataViewSelectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 32px 8px 8px !important'
  },
  dataViewSelectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '14px'
    }
  },
  genotypesSelectInput: {
    fontSize: '14px !important',
    fontWeight: '600 !important',
    padding: '8px 110px 8px 15px !important',
    marginRight: '-80px !important'
  },
  genotypesSelectButton: {
    height: '20px',
    fontSize: '8px !important',
    padding: '3px 5px !important',
    whiteSpace: 'nowrap',
    position: 'absolute',
    right: '18px'
  },
  genotypesMenuPaper: {
    maxHeight: '350px !important'
  },
  genotypesSelectMenu: {
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

    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      height: '100%'
    }
  },
  graph: {
    height: '100%',
    width: '70%',

    '@media (max-width: 1000px)': {
      width: '100%'
    },

    '@media (max-width: 500px)': {
      width: '100%',
      height: '460px'
    }
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
  chartTooltipLabel: {
    backgroundColor: '#fff',
    padding: '8px',
    border: 'solid rgba(0, 0, 0, 0.25) 1px'
  },
  tooltipWrapper: {
    width: '30%',
    borderRadius: '6px',
    backgroundColor: '#E5E5E5',
    overflowY: 'auto',

    '@media (max-width: 1000px)': {
      width: '100%',
      height: '250px'
    }
  },
  tooltip: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  tooltipTitle: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px',
    alignItems: 'flex-end',
    padding: '16px 16px 8px',
    borderBottom: '1px solid #fff'
  },
  tooltipContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px',
    overflowY: 'auto'
  },
  tooltipItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: '8px',
    gridColumn: 'span 6'
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
  },
  noGenotypeSelected: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
}));

export { useStyles };
