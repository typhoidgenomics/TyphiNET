import { RestartAlt } from '@mui/icons-material';
import { useStyles } from './ResetButtonMUI';
import { Fab, Tooltip, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { setActualTimeFinal, setActualTimeInitial, setCanGetData } from '../../../stores/slices/dashboardSlice';
import { setDataset, setMapView, setPosition } from '../../../stores/slices/mapSlice';
import { setActualCountry } from '../../../stores/slices/dashboardSlice';
import {
  setDeterminantsGraphDrugClass,
  setDeterminantsGraphView,
  setDistributionGraphView,
  setDrugResistanceGraphView,
  setFrequenciesGraphView
} from '../../../stores/slices/graphSlice';
import { defaultDrugsForDrugResistanceGraph } from '../../../util/drugs';

export const ResetButton = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width: 500px)');

  const dispatch = useAppDispatch();
  const timeInitial = useAppSelector((state) => state.dashboard.timeInitial);
  const timeFinal = useAppSelector((state) => state.dashboard.timeFinal);

  function handleClick() {
    dispatch(setCanGetData(false));
    dispatch(setDataset('All'));
    dispatch(setActualTimeInitial(timeInitial));
    dispatch(setActualTimeFinal(timeFinal));
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
    dispatch(setActualCountry('All'));

    dispatch(setMapView('CipNS'));
    dispatch(setDrugResistanceGraphView(defaultDrugsForDrugResistanceGraph));
    dispatch(setDeterminantsGraphDrugClass('Ciprofloxacin NS'));

    dispatch(setFrequenciesGraphView('percentage'));
    dispatch(setDeterminantsGraphView('percentage'));
    dispatch(setDistributionGraphView('number'));
    dispatch(setCanGetData(true));
  }

  return (
    <div className={classes.resetButton}>
      <Tooltip title="Reset Configurations" placement="left">
        <span>
          <Fab color="primary" size={matches500 ? 'medium' : 'large'} onClick={handleClick}>
            <RestartAlt sx={{ color: '#fff' }} />
          </Fab>
        </span>
      </Tooltip>
    </div>
  );
};
