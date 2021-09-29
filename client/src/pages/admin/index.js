import './index.css';
import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'
import { useStyles, ColorButton, ColorButton3, ColorButton4, StyledHeaderCell, CustomTableContainer, CustomTableSortLabel } from './materialUI'
import { API_ENDPOINT } from '../../constants';
import axios from 'axios';

function createData(id, date, changes) {
  return { id, date, changes };
}

const AdminPage = () => {

    const classes = useStyles();

    const [rows, setRows] = useState([])
    const [data, setData] = useState([])
    const [originalData, setOriginalData] = useState([])
    const [currentData, setCurrentData] = useState(0)
    const [tableKeys, setTableKeys] = useState([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(50);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('NAME');
    const [currentRow, setCurrentRow] = useState({})
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);

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

    function changeView (id) {
        setData(originalData)
        const aux = JSON.parse(JSON.stringify(data))
        if (id > 0) {
            for (let index = 0; index < id; index++) {
                Object.keys(rows[index].changes.added).forEach(element => {
                    const genome = rows[index].changes.added[element]
                    const gIndex = aux.findIndex(x => x.NAME === genome.NAME)
                    aux.splice(gIndex, 1)
                });

                Object.keys(rows[index].changes.deleted).forEach(element => {
                    const genome = rows[index].changes.deleted[element]
                    aux.push(genome)
                    aux.sort((a, b) => a.NAME < b.NAME ? -1 : 1)
                });

                Object.keys(rows[index].changes.updated).forEach(element => {
                    const keys = rows[index].changes.updated[element]
                    for (const key in keys) {
                        const genome = aux.filter(x => x.NAME === element)
                        if (genome.length > 0) {
                            genome[0][key] = keys[key].old
                        }
                    }
                });
            }
            setData(aux)
        }
        setCurrentData(id)
    }

    function betterChanges (changes) {
        const aux = JSON.parse(JSON.stringify(changes))
        const added = Object.keys(aux.added).length > 0 ? "[ " + Object.keys(aux.added) + " ]" : ""
        const deleted = (Object.keys(aux.deleted).length > 0 ? ('[ ' + Object.keys(aux.deleted) + " ]") : "")
        const updated = (Object.keys(aux.updated).length > 0 ? (JSON.stringify(aux.updated).replaceAll('\"','').replaceAll(',', ', ').replaceAll(':', ': ').replaceAll('{', '{ ').replaceAll('}', ' }')) : "")
        const text = []
        if (added !== "") text.push(["ADDED: ", added])
        if (deleted !== "") text.push(["DELETED: ", deleted])
        if (updated !== "") text.push(["UPDATED: ", updated])
        return text
    }

    function handleDelete (row) {
        setCurrentRow(row)
        setOpen(true)
    }

    function handleEdit (row) {
        setCurrentRow(row)
        setOpen2(true)
    }

    function deleteRow () {
        const index = data.findIndex(x => x.NAME === currentRow.NAME)
        data.splice(index, 1)
        setOpen(false)
    }

    function editRow () {
        const row = {}
        const aux = JSON.parse(JSON.stringify(data))

        const rowIndex = aux.findIndex(x => x.NAME === currentRow.NAME)

        const inputs = document.getElementsByClassName('MuiOutlinedInput-input')
        Object.values(inputs).forEach(input => {
            row[input.id] = input.value
        });
        
        aux[rowIndex] = row
        setData(aux)
        setOpen2(false)
    }

    function addRow () {
        const row = {}
        const aux = JSON.parse(JSON.stringify(data))

        const inputs = document.getElementsByClassName('MuiOutlinedInput-input')
        Object.values(inputs).forEach(input => {
            row[input.id] = input.value
        });
        
        aux.push(row)
        aux.sort((a, b) => a.NAME < b.NAME ? -1 : 1)
        setData(aux)
        setOpen3(false)
    }

    function resetChanges () {
        setCurrentData(0)
        setData(originalData)
    }

    function lzw_encode(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = 256;
        for (var i=1; i<data.length; i++) {
            currChar=data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            }
            else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase=currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (var i=0; i<out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join("");
    }

    function uploadChanges () {
        const times = Math.ceil(data.length / 1000)
        const parts = []
        for (let index = 0; index < times; index++) {
            if (times === 0) {
                break
            }
            if (times === index - 1) {
                if (times === 1) {
                    parts.push([data])
                } else {
                    parts.push([data.slice((times - 1) * 1000)])
                }
            } else {
                parts.push([data.slice(index * 1000, (index * 1000) + 1000)])
            }
            axios.post(`${API_ENDPOINT}mongo/upload/admin`, {
                data: lzw_encode(JSON.stringify(parts[parts.length - 1])),
                parts: times,
                current: index + 1
            })
              .then((res) => {
              })
        }
        
    }


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
            setOriginalData(JSON.parse(JSON.stringify(aux2)))
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
                    <div className="actions">ACTIONS</div>
                </TableCell>
            </TableRow>
            </TableHead>
        );
    }

    return (
        <div className="mainDiv">
            <div className="mainDiv-padding">
                <div className="titleActions">
                    <h2 className="title">MongoDB Admin Page</h2>
                    <div>
                        <ColorButton4 onClick={() => {uploadChanges()}} variant="outlined" size="small" className={classes.uploadButton} >Submit changes</ColorButton4>
                    </div>
                </div>
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
                                    <TableCell align="left">{betterChanges(row.changes).map((text) => (
                                        <div key={text[1] + 'change'}>
                                            {text[0]}
                                            {text[1]}
                                        </div>
                                    ))}</TableCell>
                                    <TableCell align="left">
                                        <ColorButton onClick={() => changeView(row.id)} variant="outlined" size="small" className={classes.viewButton} >View</ColorButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className="addButton">
                    <ColorButton3 onClick={() => {resetChanges()}} variant="outlined" size="small" className={classes.resetButton} >Reset changes</ColorButton3>
                    <ColorButton3 onClick={() => {setOpen3(true)}} variant="outlined" size="small" className={classes.uploadButton} >Add new entry</ColorButton3>
                </div>
                <Paper className={classes.tablePadding}>
                    <div className="currentData"><b>DATA ID:</b> {currentData}</div>
                    <CustomTableContainer>
                        <Table stickyHeader size="small" aria-label="a dense table">
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
                                            <TableCell key={Math.random() + 'cell'} align="center">{cell}</TableCell>
                                        ))}
                                        <TableCell align="center" className={classes.stickyCell}>
                                            <div className="tableActions">
                                                <IconButton aria-label="edit" size="small" onClick={() => handleEdit(JSON.parse(JSON.stringify(row)))}>
                                                    <FontAwesomeIcon icon={faEdit} className="editIcon" />
                                                </IconButton>
                                                <IconButton aria-label="delete" size="small" onClick={() => handleDelete(JSON.parse(JSON.stringify(row)))}>
                                                    <FontAwesomeIcon icon={faTrashAlt} className="trashIcon"/>
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
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"Delete"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete {currentRow.NAME} ?
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => deleteRow()} autoFocus>
                    Ok
                </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={open2}
                onClose={() => setOpen2(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Edit"}
                </DialogTitle>
                <DialogContent className={classes.dialog}>
                    {Object.entries(currentRow).map(item => (
                        <TextField key={item[0] + 'input'} id={item[0]} className={classes.input} label={item[0]} variant="outlined" defaultValue={item[1]} />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen2(false)}>Cancel</Button>
                    <Button onClick={() => editRow()} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={open3}
                onClose={() => setOpen3(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Add"}
                </DialogTitle>
                <DialogContent className={classes.dialog}>
                    {data.length > 0 && Object.keys(data[0]).map(item => (
                        <TextField key={item + 'input2'} id={item} className={classes.input2} label={item} variant="outlined" />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen3(false)}>Cancel</Button>
                    <Button onClick={() => addRow()} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default AdminPage