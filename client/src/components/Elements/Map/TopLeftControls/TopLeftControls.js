import { useStyles } from './TopLeftControlsMUI';
import {
  Card,
  CardContent,
  Divider,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setDataset } from '../../../../stores/slices/mapSlice.ts';
import { setActualTimeFinal, setActualTimeInitial } from '../../../../stores/slices/dashboardSlice';

const datasetOptions = ['All', 'Local', 'Travel'];

export const TopLeftControls = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  const dispatch = useAppDispatch();
  const dataset = useAppSelector((state) => state.map.dataset);
  const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);
  const years = useAppSelector((state) => state.dashboard.years);

  function handleChange(_event, newValue) {
    if (newValue !== null) {
      dispatch(setDataset(newValue));
    }
  }

  function handleChangeInitial(_event, child) {
    dispatch(setActualTimeInitial(child.props.value));
  }

  function handleChangeFinal(_event, child) {
    dispatch(setActualTimeFinal(child.props.value));
  }

  return (
    <div className={`${classes.topLeftControls} ${matches ? classes.bp700 : ''}`}>
      <Card elevation={3} className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="h6">Filters</Typography>
          <Typography variant="caption">Applied to all plots</Typography>
        <div className={classes.mapWrapper}></div>
          <div className={classes.datasetWrapper}>
            <Typography gutterBottom variant="caption">
              Select dataset
            </Typography>
            <ToggleButtonGroup value={dataset} exclusive size="small" onChange={handleChange}>
              {datasetOptions.map((option, index) => (
                <ToggleButton key={`dataset-${index}`} value={option} color="primary">
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className={classes.yearsWrapper}>
            <div className={classes.yearWrapper}>
              <Typography gutterBottom variant="caption">
                Start year
              </Typography>
              <Select
                variant="standard"
                inputProps={{ className: classes.selectInput }}
                MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
                value={actualTimeInitial}
                onChange={handleChangeInitial}
                fullWidth
              >
                {years
                  .filter((year) => year <= actualTimeFinal)
                  .map((year, index) => {
                    return (
                      <MenuItem key={`initial-year-${index}`} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
            <Divider orientation="vertical" flexItem />
            <div className={classes.yearWrapper}>
              <Typography gutterBottom variant="caption">
                End year
              </Typography>
              <Select
                variant="standard"
                inputProps={{ className: classes.selectInput }}
                MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
                value={actualTimeFinal}
                onChange={handleChangeFinal}
                fullWidth
              >
                {years
                  .filter((year) => year >= actualTimeInitial)
                  .map((year, index) => {
                    return (
                      <MenuItem key={`final-year-${index}`} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
