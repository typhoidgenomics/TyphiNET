import { useStyles } from './SelectCountryMUI';
import { Card, CardContent, Typography } from '@mui/material'; 
// Select and MenuItem was removed from statement above
import { useAppSelector } from '../../../stores/hooks';
// useAppDispatch removed from statement above 
// import { setActualCountry } from '../../../stores/slices/dashboardSlice';

export const SelectCountry = () => {
  const classes = useStyles();
  // const dispatch = useAppDispatch();
  const actualCountry = useAppSelector((state) => state.dashboard.actualCountry);
  // const countriesForFilter = useAppSelector((state) => state.graph.countriesForFilter);
  const dataset = useAppSelector((state) => state.map.dataset);
  // const actualTimeInitial = useAppSelector((state) => state.dashboard.actualTimeInitial);
  // const actualTimeFinal = useAppSelector((state) => state.dashboard.actualTimeFinal);

  // function handleChange(event) {
  //   dispatch(setActualCountry(event.target.value));
  // }

  return (
    <Card className={classes.card} elevation={0}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" fontWeight={700} textAlign="center">
          {`Detailed plots for selected data: ${dataset} from ${actualCountry === 'All' ? 'all countries' : actualCountry}`}
        </Typography>
        <Typography className={classes.selectLabel} variant="subtitle1" fontWeight={500}>
          Select a focus country by clicking on the map above.
        </Typography>
        <Typography>
          Select travel and temporal filters in the panel above.
        </Typography>
        {/*
        <Select
          variant="standard"
          value={actualCountry}
          onChange={handleChange}
          inputProps={{ className: classes.selectInput }}
          MenuProps={{ classes: { paper: classes.menuPaper, list: classes.selectMenu } }}
        >
          <MenuItem value="All">All</MenuItem>
          {countriesForFilter.map((country, index) => {
            return (
              <MenuItem key={index + 'mapview'} value={country}>
                {country}
              </MenuItem>
            );
          })}
        </Select> */}
      </CardContent>
    </Card>
  );
};
