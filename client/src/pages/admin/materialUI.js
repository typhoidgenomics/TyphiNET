import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import CircularProgress from '@material-ui/core/CircularProgress';

// CircularProgress for 'Submit data' and 'Look for changes' dialogs
const CustomCircularProgress = withStyles({
  root: {
      color: "rgb(31, 187, 211)"
  }
})(CircularProgress);

// CSS like classes
const useStyles = makeStyles({
    cellON: {
        backgroundColor: '#e9f9fc'
    },
    off: {},
    tableID : {
        position: 'sticky',
        right: 0
    },
    tablePadding: {
        marginTop: '16px'
    },
    actionsCell:{
      borderLeft: '1px solid rgba(224, 224, 224, 1)',
      backgroundColor: 'white'
    },
    stickyCell: {
        position: 'sticky',
        right: 0,
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
        backgroundColor: 'white'
    },
    actionsHeaderCell: {
      backgroundColor: 'black',
      color: 'white',
      borderLeft: '1px solid rgba(224, 224, 224, 1)'
    },
    stickyHeaderCell: {
        position: 'sticky',
        right: 0,
        backgroundColor: 'black',
        color: 'white',
        borderLeft: '1px solid rgba(224, 224, 224, 1)'
    },
    changesTable: {
        maxHeight: '400px',
        marginBottom: 32
    },
    viewButton: {
        width: 80
    },
    resetButton: {
        width: 150,
        height: 40,
        marginRight: 16,
        marginLeft: 16
    },
    uploadButton: {
        width: 150,
        height: 40
    },
    checkChangesButton: {
      width: 100,
      height: 40
    }, 
    dialog: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    input: {
        marginBottom: 16
    },
    input2: {
        marginBottom: 16
    },
    currentData: {
      backgroundColor: 'black',
      color: 'white',
      whiteSpace: 'nowrap',
      paddingRight: 8
    },
    toolbar: {
      backgroundColor: 'black',
      borderBottom: '1px solid white',
      justifyContent: 'space-between'
    },
    deleteSelected: {
      color: 'red'
    },
    checkboxCell: {
      backgroundColor: 'black'
    },
    checkbox: {
      color: 'white'
    },
    tableRowRoot: {
      "&$tableRowSelected, &$tableRowSelected:hover": {
        backgroundColor: '#e9f9fc'
      }
    },
    tableRowSelected: {
      backgroundColor: '#e9f9fc'
    },
    box: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 16
    },
    select: {
      textAlign: 'right',
      paddingLeft: 8,
      textAlignLast: 'right',
      minWidth: 50,
      userSelect: 'none',
      borderRadius: 0,
      font: 'inherit',
      letterSpacing: 'inherit',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
      marginRight: 12,
    },
    choosePage: {
      opacity: 0.87,
      whiteSpace: 'nowrap',
      paddingLeft: 8
    },
    selectFilter: {
      backgroundColor: 'white',
      textAlign: 'start'
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch'
    },
    headerTitle:{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start'
    },
    rowHeader: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    deleteChangeButton: {
      backgroundColor: 'grey',
      width: 35,
      borderRadius: 5,
      color: 'white',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      '&:hover': {
        color: 'white',
        backgroundColor: '#4F4F4F'
      },
    },
    // dialogTransition: {
    //   transition: 'none'
    // }
  });

// Load button from the changes table
const ColorButton = withStyles((theme) => ({
    root: {
      backgroundColor: 'grey',
      color: 'white',
      '&:hover': {
        color: 'white',
        backgroundColor: '#4F4F4F'
      },
      marginRight: '16px'
    },
}))(Button);

// 'Reset changes' and 'Add new entry' buttons
const ColorButton3 = withStyles((theme) => ({
    root: {
      backgroundColor: 'white',
      color: '#1FBBD3',
      '&:hover': {
        color: 'black',
        backgroundColor: '#CFCFCF'
      },
      borderColor: '#1FBBD3'
    },
}))(Button);

// Submit changes button
const ColorButton4 = withStyles((theme) => ({
    root: {
      backgroundColor: '#1FBBD3',
      color: 'white',
      '&:hover': {
        color: 'white',
        backgroundColor: '#188C9E'
      }
    },
}))(Button);

// Refresh button
const ColorButton5 = withStyles((theme) => ({
  root: {
    color: 'black',
    borderColor: 'black',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: '#CFCFCF'
    },
    fontWeight: 'bold'
  },
}))(Button);

// Header cell for both tables
const StyledHeaderCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

// Wrapper for data table
const CustomTableContainer = withStyles((theme) => ({
    root: {
        maxHeight: '600px'
    }
}))(TableContainer);

// Label for header cells from the data table with order buttons
const CustomTableSortLabel = withStyles((theme) => ({
    root: {
        color: 'white',
        "&:hover": {
        color: 'white',
      },
      '&$active': {
        color: 'white',
      },
    },
    active: {},
    icon: {
        color: 'inherit !important'
    },
}))(TableSortLabel);


export { useStyles, ColorButton, ColorButton3, ColorButton4, ColorButton5, StyledHeaderCell, CustomTableContainer, CustomTableSortLabel, CustomCircularProgress};