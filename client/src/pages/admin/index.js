import './index.css';
import React, { useEffect, useState } from 'react';
import Table from '@material-ui/core/Table';
import SearchBar from "material-ui-search-bar";
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Tooltip, Toolbar, Typography, Checkbox, Box, IconButton, Select, MenuItem, FormControl } from '@material-ui/core';
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { useStyles, ColorButton, ColorButton3, ColorButton4, ColorButton5, StyledHeaderCell, CustomTableContainer, CustomTableSortLabel, CustomCircularProgress } from './materialUI'
import { API_ENDPOINT } from '../../constants';
import axios from 'axios';
import LZString from 'lz-string';
import Loader from "react-loader-spinner";
import PropTypes from 'prop-types';
import { useTheme } from '@material-ui/core/styles';

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
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('NAME');
    const [currentRow, setCurrentRow] = useState({})
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);
    const [open4, setOpen4] = React.useState(false);
    const [open5, setOpen5] = React.useState(false);
    const [open6, setOpen6] = React.useState(false);
    const [open7, setOpen7] = React.useState(false);
    const [open8, setOpen8] = React.useState(false);
    const [resultMessage, setResultMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState([]);
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({});
    const [filterOptions, setFilterOptions] = React.useState({});
    const [filteredData, setFilteredData] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [startProgress, setStartProgress] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState("");
    const [currentChange, setCurrentChange] = React.useState(null);

    const [exceptions] = React.useState(["NAME", "ACCESION", "Genome ID", "LATITUDE", "LONGITUDE", "LOCATION", "Mash Distance", "Matching Hashes", "SANGER LANE", "STRAIN"]);

    // Change table page
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Change number of rows per page and return to first page
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Sort table by selected column in asc or desc
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Helper function for getComparator
    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    // Main function to return data ordered to table
    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    // Comparator to order table for stableSort
    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    // Change current view of the table to another ID, this also resets all changes made on the table
    function changeView(id) {
        resetChanges()
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

    // Beautify text for changes
    function betterChanges(changes) {
        const aux = JSON.parse(JSON.stringify(changes))
        const added = Object.keys(aux.added).length > 0 ? Object.keys(aux.added).join(", ") + "." : ""
        const deleted = (Object.keys(aux.deleted).length > 0 ? (Object.keys(aux.deleted).join(", ")) + "." : "")
        let updated = ""

        if (Object.keys(aux.updated).length > 0) {
            updated = Object.entries(aux.updated).map(x => {
                const updates = Object.entries(x[1])
                const changes = updates.map((y, i) => {
                    const point = i === updates.length - 1 ? "." : ""
                    return y[0] + " (new: " + y[1].new + ", old: " + y[1].old + ")" + point
                });
                return x[0] + ": " + changes.join(", ");
            })
        }

        const text = []
        if (added !== "") text.push(["ADDED", added])
        if (deleted !== "") text.push(["DELETED", deleted])
        if (updated !== "") text.push(["UPDATED", updated])
        return text
    }

    // The five handlers below are mediators between the button and the dialog. They set specific informations before opening the dialogs.
    function handleDelete(row) {
        setCurrentRow(row)
        setOpen(true)
    }
    function handleDeleteChange(id) {
        setCurrentChange(id)
        setOpen8(true)
    }
    function handleEdit(row) {
        setCurrentRow(row)
        setOpen2(true)
    }
    function handleUpload() {
        setOpen4(true)
    }
    function handleCheckChanges(message) {
        setResultMessage(message);
        setOpen5(true);
    }

    // Delete chosen change
    async function deleteChange() {
        axios.post(`${API_ENDPOINT}mongo/deleteChange`, { id: currentChange - 1 })
            .then((res) => {
                getChangeData(res.data)
                setCurrentData(0)
            })
            .finally(() => {
                setOpen8(false)
            })
    }

    // Check if there were any new changes on the database and updates the table
    async function checkChanges(showPopup = true) {
        setStartProgress(true);
        setLoading(true);
        return await axios.get(`${API_ENDPOINT}mongo/checkForChanges`)
            .then(async (res) => {
                if (res.data.Status === "Changes") {
                    await resetChanges();
                    await getData();
                    if (showPopup) {
                        handleCheckChanges('Changes were found. Tables updated.');
                    }
                    return true
                } else if (res.data.Status === "No Changes") {
                    if (showPopup) {
                        handleCheckChanges('No changes found.');
                    }
                    return false
                }
            })
            .catch((error) => {
                if (showPopup) {
                    handleCheckChanges('Could not check for changes. Try again later.');
                }
                return false
            })
            .finally(() => {
                setOpen7(false)
                setLoading(false);
                setStartProgress(false);
            })
    }

    // Handler for select all rows button
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = filteredData.map((n) => n.NAME);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    // Handler for selecting specific row
    const handleClick = (name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    // Delete selected row
    function deleteRow() {
        const index = data.findIndex(x => x.NAME === currentRow.NAME)
        const aux = JSON.parse(JSON.stringify(data))
        aux.splice(index, 1)
        setData(aux)
        setOpen(false)
    }

    // If more than one row is selected than delete all of them
    function deleteRows() {
        const aux = JSON.parse(JSON.stringify(filteredData))
        const aux2 = JSON.parse(JSON.stringify(data))
        selected.forEach(row => {
            const index = aux.findIndex(x => x.NAME === row);
            if (index !== -1) {
                aux.splice(index, 1)
            }
            const index2 = aux2.findIndex(x => x.NAME === row);
            if (index2 !== -1) {
                aux2.splice(index2, 1)
            }
        })
        setData(aux2)
        setFilteredData(aux)
        setSelected([])
        setOpen6(false)
    }

    // Edit selected row
    function editRow() {
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
        setResultMessage(`Row ${currentRow.NAME} edited with success!`)
        setOpen5(true)
    }

    // Add new row
    function addRow() {
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
        setResultMessage(`Row ${row.NAME} added with success!`)
        setOpen5(true)
    }

    // Reset all changes made on the table
    async function resetChanges() {
        setSearch("")
        let aux = JSON.parse(JSON.stringify(filters))
        for (const key in aux) {
            aux[key] = ""
        }
        setFilters(aux)
        setPage(0)
        setRowsPerPage(10)
        setCurrentData(0)
        setData(originalData)
    }

    // Upload changes on the current table to the database
    function uploadChanges() {
        setLoading(true)
        setStartProgress(true);
        setResultMessage("")
        const times = Math.ceil(data.length / 1500)
        const parts = []
        for (let index = 0; index < times; index++) {
            if (times === 0) {
                break
            }
            if (times === index - 1) {
                if (times === 1) {
                    parts.push([data])
                } else {
                    parts.push([data.slice((times - 1) * 1500)])
                }
            } else {
                parts.push([data.slice(index * 1500, (index * 1500) + 1500)])
            }
            axios.post(`${API_ENDPOINT}mongo/upload/admin`, {
                data: LZString.compress(JSON.stringify(parts[parts.length - 1])),
                parts: times,
                current: index + 1
            })
                .then((res) => {
                    if (res.data !== '' && res.data.Status === 'Uploaded') {
                        axios.get(`${API_ENDPOINT}mongo/download`)
                            .then(async () => {
                                await checkChanges()
                                setResultMessage("Upload and download completed!")
                            })
                            .catch(() => {
                                setResultMessage("Something went wrong with the download, please try again later!")
                            })
                            .finally(() => {
                                setStartProgress(false)
                                setLoading(false)
                                setOpen4(false)
                                setOpen5(true)
                            })
                    }
                })
                .catch(() => {
                    setStartProgress(false)
                    setLoading(false)
                    setOpen4(false)
                    setResultMessage("Something went wrong with the upload, please try again later!")
                    setOpen5(true)
                })
        }

    }

    // Helper for function getData to get only the changes
    function getChangeData(changeData) {
        let aux = []
        for (let index = 0; index < changeData.length - 1; index++) {
            const date = new Date(changeData[index].updatedAt)
            aux.push(
                createData(index + 1, date.toLocaleString(), changeData[index].changes)
            )
        }
        setRows(aux)
    }

    // Main function to get data for all the admin page
    async function getData() {
        await axios.get(`${API_ENDPOINT}file/databaseLog`)
            .then((res) => {
                let data = res.data

                getChangeData(data)

                let aux2 = Object.values(data[data.length - 1].data)
                let aux4 = {}
                let aux5 = {}

                Object.keys(aux2[0]).forEach(key => {
                    if (!exceptions.includes(key)) {
                        aux4[key] = ""
                        aux5[key] = []
                        let options = aux2.map(value => value[key]);
                        options.forEach(x => {
                            if (!aux5[key].includes(x)) {
                                aux5[key].push(x)
                            }
                        })
                        aux5[key].sort()
                    }
                });

                setData(aux2)
                setFilters(aux4)
                setFilterOptions(aux5)
                setFilteredData(JSON.parse(JSON.stringify(aux2)))
                setOriginalData(JSON.parse(JSON.stringify(aux2)))
                setTableKeys(Object.keys(aux2[0]))
            })
    }

    // Check for changes when admin page is opened and get data
    useEffect(() => {
        setLoadingMessage("Checking for changes...")
        checkChanges(false).then((response) => {
            if (!response) {
                getData().finally(() => {
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        }).finally(() => {
            setLoadingMessage("")
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Watcher for filtering columns and search
    useEffect(() => {
        let aux = JSON.parse(JSON.stringify(data))
        if (search === "" && Object.values(filters).join("") === "") {
            setFilteredData(aux)
        } else {
            let s = search.toLowerCase()

            aux = aux.filter(x => {
                let pass = true
                Object.keys(x).forEach(y => {
                    if (!exceptions.includes(y) && filters[y] !== "" && x[y] !== filters[y]) {
                        pass = false
                    }
                    if (search !== "" && !Object.values(x).join(" ").toLowerCase().includes(s)) {
                        pass = false
                    }
                })
                return pass
            })

            setFilteredData(aux)
        }
    }, [search, data, filters, exceptions])

    // Component table toolbar (Above table header)
    const EnhancedTableToolbar = (props) => {
        const { numSelected } = props;

        return (
            <Toolbar className={classes.toolbar}>
                {numSelected > 0 ? (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                        className={classes.currentData}
                    >
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                        className={classes.currentData}
                    >
                        <b>DATA ID:</b> {currentData}
                    </Typography>
                )}

                <SearchBar
                    value={search}
                    placeholder={"Search and press enter..."}
                    onCancelSearch={() => {
                        setSearch("")
                        setPage(0)
                    }}
                    onRequestSearch={(value) => {
                        setSearch(value)
                        setPage(0)
                    }}
                />

                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton onClick={() => setOpen6(true)}>
                            <FontAwesomeIcon icon={faTrashAlt} className={classes.deleteSelected} />
                        </IconButton>
                    </Tooltip>
                ) : null}


            </Toolbar>
        );
    };

    // Component table header
    function EnhancedTableHead(props) {
        const { classes, order, orderBy, onRequestSort, onSelectAllClick, numSelected, rowCount } = props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };

        return data.length > 0 && (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox" className={classes.checkboxCell}>
                        <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            className={classes.checkbox}
                        />
                    </TableCell>
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
                                className={classes.rowHeader}
                            >
                                <div className={classes.header}>
                                    <div className={classes.headerTitle}>{headCell}</div>
                                    {!exceptions.includes(headCell) && (
                                        <FormControl>
                                            <Select
                                                value={filters[headCell]}
                                                onChange={(event) => {
                                                    setPage(0)
                                                    let aux = JSON.parse(JSON.stringify(filters))
                                                    aux[headCell] = event.target.value
                                                    setFilters(aux)
                                                    event.stopPropagation()
                                                }}
                                                displayEmpty
                                                className={classes.selectFilter}
                                                onOpen={(event) => event.stopPropagation()}
                                                onClose={(event) => event.stopPropagation()}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                {filterOptions[headCell].map((option, i) => (<MenuItem key={i + option} value={option}>{option}</MenuItem>))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </div>
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

    // Get number of pages for the table
    function NumberOfPages() {
        return Math.ceil(filteredData.length / rowsPerPage)
    }

    // Component TablePaginationActions
    function TablePaginationActions(props) {
        const theme = useTheme();
        const { count, page, rowsPerPage, onPageChange } = props;

        const handleFirstPageButtonClick = (event) => {
            onPageChange(event, 0);
        };

        const handleBackButtonClick = (event) => {
            onPageChange(event, page - 1);
        };

        const handleNextButtonClick = (event) => {
            onPageChange(event, page + 1);
        };

        const handleLastPageButtonClick = (event) => {
            onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
        };

        return (
            <Box sx={{ flexShrink: 0, ml: 2.5 }} className={classes.box}>
                <IconButton
                    onClick={handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="first page"
                >
                    {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
                </IconButton>
                <IconButton
                    onClick={handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="previous page"
                >
                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                </IconButton>
                <IconButton
                    onClick={handleNextButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="next page"
                >
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                </IconButton>
                <IconButton
                    onClick={handleLastPageButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="last page"
                >
                    {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
                </IconButton>
            </Box>
        );
    }

    TablePaginationActions.propTypes = {
        count: PropTypes.number.isRequired,
        onPageChange: PropTypes.func.isRequired,
        page: PropTypes.number.isRequired,
        rowsPerPage: PropTypes.number.isRequired,
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    return (
        <div className="mainDiv">
            <div className="mainDiv-padding">
                <div className="titleActions">
                    <div className="titleButtonRow">
                        <h2 className="title">MongoDB Admin Page</h2>
                    </div>
                    <div className="tooltipSubmitRow">
                        <ColorButton5 onClick={() => { setOpen7(true) }} variant="outlined" size="small" className={classes.checkChangesButton} >Refresh</ColorButton5>
                        <Tooltip
                            title={<div className="tooltipTitle">Changes are only saved by pressing the <b className="boldTooltipText">SUBMIT CHANGES</b> button</div>}
                            placement="left"
                        >
                            <IconButton>
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </IconButton>
                        </Tooltip>
                        <ColorButton4 onClick={() => { handleUpload() }} variant="outlined" size="small" className={classes.uploadButton} >Submit changes</ColorButton4>
                    </div>
                </div>
                <TableContainer component={Paper} className={classes.changesTable}>
                    <Table stickyHeader size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <StyledHeaderCell>ID</StyledHeaderCell>
                                <StyledHeaderCell>Date</StyledHeaderCell>
                                <StyledHeaderCell align="left">Changes</StyledHeaderCell>
                                <StyledHeaderCell className={classes.actionsHeaderCell} align="left">Actions</StyledHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key={'00changes'} className={currentData === 0 ? classes.cellON : classes.off}>
                                <TableCell align="left">{0}</TableCell>
                                <TableCell align="left"></TableCell>
                                <TableCell align="left" width="70%">{'CURRENT DATA'}</TableCell>
                                <TableCell align="left" className={classes.actionsCell}>
                                    <div className="tableActions">
                                        <ColorButton onClick={() => changeView(0)} variant="outlined" size="small" className={classes.viewButton} >Load</ColorButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {rows.map((row, r) => (
                                <TableRow key={row.id + 'changes'} className={row.id === currentData ? classes.cellON : classes.off}>
                                    <TableCell align="left">{row.id}</TableCell>
                                    <TableCell align="left">{row.date}</TableCell>
                                    <TableCell align="left" width="70%">{betterChanges(row.changes).map((text, t) => (
                                        <div key={`${r}${t}change`} className="changesText">
                                            <div>{text[0]}</div>
                                            &nbsp;{"entries with name:"}&nbsp;
                                            {text[0] !== "UPDATED"
                                                ? (<div>{text[1]}</div>)
                                                : (
                                                    <div>
                                                        {Object.values(text[1]).map((x, i) => (<div key={x + i}>{x}</div>))}
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ))}</TableCell>
                                    <TableCell align="left" className={classes.actionsCell}>
                                        <div className="tableActions">
                                            <ColorButton onClick={() => changeView(row.id)} variant="outlined" size="small" className={classes.viewButton} >Load</ColorButton>
                                            <IconButton aria-label="deleteChange" size="small" className={classes.deleteChangeButton} onClick={() => handleDeleteChange(row.id)}>
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className="addButton">
                    <ColorButton4 onClick={() => { handleUpload() }} variant="outlined" size="small" className={classes.uploadButton} >Submit changes</ColorButton4>
                    <ColorButton3
                        onClick={() => {
                            resetChanges()
                        }}
                        variant="outlined"
                        size="small"
                        className={classes.resetButton}
                    >
                        Reset changes
                    </ColorButton3>
                    <ColorButton3 onClick={() => { setOpen3(true) }} variant="outlined" size="small" className={classes.uploadButton} >Add new entry</ColorButton3>
                </div>
                <Paper className={classes.tablePadding}>
                    <EnhancedTableToolbar numSelected={selected.length} />
                    <CustomTableContainer>
                        <Table stickyHeader size="small" aria-label="a dense table">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                classes={classes}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                onSelectAllClick={handleSelectAllClick}
                                rowCount={filteredData.length}
                            />
                            <TableBody>
                                {stableSort(filteredData, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                    const isItemSelected = isSelected(row.NAME);
                                    return (
                                        <TableRow
                                            key={row.NAME + index}
                                            className={classes.dataRow}
                                            role="checkbox"
                                            hover
                                            aria-checked={isItemSelected}
                                            selected={isItemSelected}
                                            classes={{ selected: classes.tableRowSelected, root: classes.tableRowRoot }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    onClick={() => handleClick(row.NAME)}
                                                />
                                            </TableCell>
                                            {Object.values(row).map((cell) => (
                                                <TableCell key={Math.random() + 'cell'} align="center">{cell}</TableCell>
                                            ))}
                                            <TableCell align="center" className={classes.stickyCell}>
                                                <div className="tableActions">
                                                    <IconButton aria-label="edit" size="small" onClick={() => handleEdit(JSON.parse(JSON.stringify(row)))}>
                                                        <FontAwesomeIcon icon={faEdit} className="editIcon" />
                                                    </IconButton>
                                                    <IconButton aria-label="delete" size="small" onClick={() => handleDelete(JSON.parse(JSON.stringify(row)))}>
                                                        <FontAwesomeIcon icon={faTrashAlt} className="trashIcon" />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CustomTableContainer>
                    <div className="pagination">
                        <Typography className={classes.choosePage} variant="body2">Choose Page: </Typography>
                        {filteredData.length > 0 && (<Select
                            value={page}
                            onChange={(event) => { setPage(event.target.value) }}
                            className={classes.select}
                            disableUnderline
                        >
                            {[...Array(NumberOfPages())].map((x, i) => <MenuItem key={x + 'nPage'} value={i}>{i}</MenuItem>)}
                        </Select>)}
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </div>
                </Paper>
            </div>
            {isLoading && (<div className="div-loader">
                <Loader
                    type="Circles"
                    color="white"
                    height={70}
                    width={70}
                />
                <p className="div-loader-msg">{loadingMessage}</p>
            </div>)}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                style={classes.dialogTransition}
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
                style={classes.dialogTransition}
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
                style={classes.dialogTransition}
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
            <Dialog
                open={open4}
                onClose={() => setOpen4(false)}
                style={classes.dialogTransition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Submit data"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Would you like to submit changes to the database and download the new version to TyphiNET ?
                    </DialogContentText>
                    {loading && (<div className="spinner">
                        <CustomCircularProgress></CustomCircularProgress>
                    </div>)}
                </DialogContent>
                <DialogActions>
                    {!startProgress && (<Button onClick={() => setOpen4(false)}>Cancel</Button>)}
                    {!startProgress && (<Button onClick={() => uploadChanges()} autoFocus>
                        Ok
                    </Button>)}
                </DialogActions>
            </Dialog>
            <Dialog
                open={open5}
                onClose={() => setOpen5(false)}
                style={classes.dialogTransition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Result"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {resultMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen5(false)} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={open6}
                onClose={() => setOpen6(false)}
                style={classes.dialogTransition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete many"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete {selected.length} row(s) ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen6(false)}>Cancel</Button>
                    <Button onClick={() => deleteRows()} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={open7}
                onClose={() => setOpen7(false)}
                style={classes.dialogTransition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Look for changes"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Look for changes in the database? If there are, your current changes in the table below will be reseted.
                    </DialogContentText>
                    {loading && (<div className="spinner">
                        <CustomCircularProgress></CustomCircularProgress>
                    </div>)}
                </DialogContent>
                <DialogActions>
                    {!startProgress && (<Button onClick={() => setOpen7(false)}>Cancel</Button>)}
                    {!startProgress && (<Button onClick={() => { checkChanges() }} autoFocus>
                        Ok
                    </Button>)}
                </DialogActions>
            </Dialog>
            <Dialog
                open={open8}
                onClose={() => setOpen8(false)}
                style={classes.dialogTransition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete changes"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete change nº {currentChange} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen8(false)}>Cancel</Button>
                    <Button onClick={() => deleteChange()} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default AdminPage