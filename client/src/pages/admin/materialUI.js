import { makeStyles, withStyles } from '@material-ui/core/styles';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';


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
    stickyCell: {
        position: 'sticky',
        right: 0,
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
        backgroundColor: 'white'
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
        width: 100
    },
    resetButton: {
        width: 150,
        height: 40,
        marginRight: 16
    },
    uploadButton: {
        width: 150,
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
    }
  });

const ColorButton = withStyles((theme) => ({
    root: {
      backgroundColor: 'grey',
      color: 'white',
      '&:hover': {
        color: 'black',
      },
      marginRight: '16px'
    },
}))(Button);

const ColorButton3 = withStyles((theme) => ({
    root: {
      backgroundColor: 'white',
      color: '#1FBBD3',
      '&:hover': {
        color: 'black',
      },
      borderColor: '#1FBBD3'
    },
}))(Button);

const ColorButton4 = withStyles((theme) => ({
    root: {
      backgroundColor: '#1FBBD3',
      color: 'white',
      '&:hover': {
        color: 'black',
      }
    },
}))(Button);

const StyledHeaderCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

const CustomTableContainer = withStyles((theme) => ({
    root: {
        maxHeight: '600px'
    }
}))(TableContainer);

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

export { useStyles, ColorButton, ColorButton3, ColorButton4, StyledHeaderCell, CustomTableContainer, CustomTableSortLabel};