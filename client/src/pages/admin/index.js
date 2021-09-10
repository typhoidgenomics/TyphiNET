import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'
import { API_ENDPOINT } from '../../constants';
import axios from 'axios';

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
        marginTop: '32px'
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
        maxHeight: '400px'
    },
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

const ColorButton2 = withStyles((theme) => ({
    root: {
      backgroundColor: '#1FBBD3',
      color: 'white',
      '&:hover': {
        color: 'black',
      },
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

function createData(id, date, changes) {
  return { id, date, changes };
}

const AdminPage = () => {

    const classes = useStyles();

    const [rows, setRows] = useState([])
    const [data, setData] = useState([])
    const [currentData, setCurrentData] = useState(0)
    const [tableKeys, setTableKeys] = useState([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(50);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('NAME');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
          return -1;
        }
        if (b[orderBy] > a[orderBy]) {
          return 1;
        }
        return 0;
    }

    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
          const order = comparator(a[0], b[0]);
          if (order !== 0) return order;
          return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    //STYLES----------------------------------------------------------------------

    useEffect(() => {
        axios.get(`${API_ENDPOINT}file/databaseLog`)
          .then((res) => {
            let data = res.data
            let aux = []
            for (let index = 0; index < data.length - 1; index++) {
                const date = new Date(data[index].updatedAt)
                aux.push(
                    createData(index, date.toLocaleString(), data[index].changes)
                )
            }
            setRows(aux)
            
            let aux2 = Object.values(data[data.length - 1].data)
            setData(aux2)
            setTableKeys(Object.keys(aux2[0]))
          })
      }, [])

    function EnhancedTableHead(props) {
        const { classes, order, orderBy, onRequestSort } = props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };
        
        return (
            <TableHead>
            <TableRow>
                {tableKeys.map((headCell) => (
                <StyledHeaderCell
                    key={headCell + 'table'}
                    align={'center'}
                    sortDirection={orderBy === headCell ? order : false}
                >
                    <CustomTableSortLabel
                        active={orderBy === headCell}
                        direction={orderBy === headCell ? order : 'asc'}
                        onClick={createSortHandler(headCell)}
                    >
                        {headCell}
                    </CustomTableSortLabel>
                </StyledHeaderCell>
                ))}
                <TableCell className={classes.stickyHeaderCell}>
                    <div style={{border: '1px solid white', padding: '2px 6px'}}>ACTIONS</div>
                </TableCell>
            </TableRow>
            </TableHead>
        );
    }

    return (
        <div style={{backgroundColor: '#E5E5E5', width: '100vw', height: '100vh', overflow: 'scroll'}}>
            <div style={{padding: '32px'}}>
                <h2 style={{margin: '0px', paddingBottom: '16px'}}>MongoDB Admin Page</h2>
                <TableContainer component={Paper} className={classes.changesTable}>
                    <Table size="small" aria-label="a dense table">
                        <TableHead>
                        <TableRow>
                            <StyledHeaderCell>ID</StyledHeaderCell>
                            <StyledHeaderCell>Date</StyledHeaderCell>
                            <StyledHeaderCell align="left">Changes</StyledHeaderCell>
                            <StyledHeaderCell align="left">Actions</StyledHeaderCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id + 'changes'} className={row.id === currentData ? classes.cellON : classes.off}>
                                    <TableCell align="left">{row.id}</TableCell>
                                    <TableCell align="left">{row.date}</TableCell>
                                    <TableCell align="left">{JSON.stringify(row.changes)}</TableCell>
                                    <TableCell align="left">
                                        <ColorButton variant="outlined" size="small">View</ColorButton>
                                        <ColorButton2 variant="outlined" size="small">Update</ColorButton2>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Paper className={classes.tablePadding}>
                    <div style={{backgroundColor: 'black', color: 'white', paddingTop: '16px', paddingLeft: '16px', width: '120px'}}><b>DATA ID:</b> {currentData}</div>
                    <CustomTableContainer>
                        <Table stickyHeader size="small" aria-label="a dense table">
                            {/* <TableHead onRequestSort={handleRequestSort}>
                                <TableRow>
                                    {tableKeys.map((key) => (
                                        <StyledHeaderCell key={key + 'key'}>{key}</StyledHeaderCell>
                                    ))}
                                    <TableCell className={classes.stickyHeaderCell}>
                                        <div style={{border: '1px solid white', padding: '2px 6px'}}>ACTIONS</div>
                                    </TableCell>
                                </TableRow>
                            </TableHead> */}
                            <EnhancedTableHead
                                classes={classes}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                            />
                            <TableBody>
                                {stableSort(data, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.NAME} className={classes.dataRow}>
                                        {Object.values(row).map((cell) => (
                                            <TableCell align="center">{cell}</TableCell>
                                        ))}
                                        <TableCell align="center" className={classes.stickyCell}>
                                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                                                <IconButton aria-label="edit" size="small">
                                                    <FontAwesomeIcon icon={faEdit} style={{color: '#1FBBD3'}} />
                                                </IconButton>
                                                <IconButton aria-label="delete" size="small">
                                                    <FontAwesomeIcon icon={faTrashAlt} style={{color: 'red'}}/>
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CustomTableContainer>
                    <TablePagination
                        rowsPerPageOptions={[50, 100, 500, 1000]}
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            
            </div>
        </div>
    )
}

export default AdminPage