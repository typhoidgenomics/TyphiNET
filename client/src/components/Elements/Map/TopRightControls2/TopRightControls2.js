/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, CardContent, Checkbox, ListItemText, MenuItem, Select, Tooltip, Typography, InputAdornment, FormControl, ListSubheader} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setCustomDropdownMapView } from '../../../../stores/slices/graphSlice';
import { useStyles } from './TopRightControls2MUI';
import TextField from '@mui/material/TextField';
import { InfoOutlined } from '@mui/icons-material';


export const TopRightControls2 = () => {
  const classes = useStyles();
  const [, setCurrentTooltip] = useState(null);
  const [searchValue2, setSearchValue2] = useState("")
  const dispatch = useAppDispatch();
  const organism = useAppSelector((state) => state.dashboard.organism);
  const genotypesDrugsData2 = useAppSelector((state) => state.graph.genotypesDrugsData2);
  const genotypesDrugsData = useAppSelector((state) => state.graph.genotypesDrugsData);
  const customDropdownMapView = useAppSelector((state) => state.graph.customDropdownMapView);

  // useEffect(() => {
  //   setCurrentTooltip(null);
  // }, [genotypesDrugsData, customDropdownMapView]);
  function getSelectGenotypeLabel(genotype) {
    const matchingGenotype = genotypesDrugsData.find(g => g.name === genotype.name);
    const totalCount = matchingGenotype?.totalCount ?? 0;
    const susceptiblePercentage = (matchingGenotype?.Susceptible / totalCount || 0) * 100;

    return `${genotype.name} (total N=${totalCount}, ${susceptiblePercentage.toFixed(2)}% Susceptible)`;
}

  

  function handleChangeSelectedGenotypes({ event = null, all = false }) {
    if (all) {
      dispatch(setCustomDropdownMapView([]));
      setCurrentTooltip(null);
      return;
    }

    const {
      target: { value }
    } = event;

    if (customDropdownMapView.length === 10 && value.length > 10) {
      return;
    }

    if (value.length === 0) {
      setCurrentTooltip(null);
    }
    dispatch(setCustomDropdownMapView(value));
  }

 function setSearchValue(event){
  event.preventDefault()
  setSearchValue2(event.target.value)
 }

const filteredData = genotypesDrugsData2
    .filter((genotype) => genotype.name.includes(searchValue2.toLowerCase()) || genotype.name.includes(searchValue2.toUpperCase()))
    // .filter(x => x.totalCount >= 20)
  ;

  return (
    <div className={`${classes.topRightControls}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.frequenciesGraph}>
          <div className={classes.label}>
            <Typography variant="caption">Select genotype</Typography>
            <Tooltip
              title="Select up to 10 Genotypes"
              placement="top"
            >
              <InfoOutlined color="action" fontSize="small" className={classes.labelTooltipIcon} />
            </Tooltip>
          </div>
          <FormControl fullWidth>
            <Select
              multiple
              // labelId="search-select-label"
              id="search-select"
              MenuProps={{ autoFocus: false }}
              value={customDropdownMapView}
              onChange={(event) => handleChangeSelectedGenotypes({ event })}
              disabled={organism === 'none'}
              displayEmpty
              onClose={(e) => setSearchValue2("")}
              // endAdornment={
              //   <Button
              //   size="small"
              //   variant="outlined"
              //   className={classes.genotypesSelectButton}
              //   onClick={() => handleChangeSelectedGenotypes({ all: true })}
              //   disabled={customDropdownMapView.length === 0}
              //   color="error"
              // >
              //   Clear
              // </Button>
              // }
              inputProps={{ className: classes.genotypesSelectInput }}
              MenuProps={{ classes: { paper: classes.genotypesMenuPaper, list: classes.genotypesSelectMenu } }}
              renderValue={(selected) => (
                selected.length === 1 ? (
                  <Typography variant="caption">{selected}</Typography>
                ) : (
                  <Typography variant="caption">{`${selected.length} genotypes`}</Typography>
                ))
              }
            >
              <ListSubheader>
              <TextField 
                size="small"
                autoFocus
                placeholder="Type to search..."
                label="Search genotype" 
                variant="standard" 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        variant="outlined"
                        className={classes.genotypesSelectButton}
                        onClick={(e) => {
                          handleChangeSelectedGenotypes({ all: true });
                        }}
                        disabled={customDropdownMapView.length === 0}
                        color="error"
                      >
                        Clear
                      </Button>
                    </InputAdornment>
                  )
                }}
                sx={{ width:'100%'}}
                onChange={e => setSearchValue(e)}
                onKeyDown={(e) => e.stopPropagation()}
              />
              </ListSubheader>
              {console.log("customDropdownMapView", customDropdownMapView)}
              {filteredData.map((genotype, index) => 
                <MenuItem key={`frequencies-option-${index}`} value={genotype.name} className={classes.dropdown}>
                  <Checkbox disableRipple sx={{padding: '0px', marginRight:'5px'}} checked={customDropdownMapView.indexOf(genotype.name) > -1} />
                  <ListItemText primary={getSelectGenotypeLabel(genotype)}   />
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </CardContent>
     </Card>
    </div>
  );
};
