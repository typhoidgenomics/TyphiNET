import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import {
  setCurrentSliderValue,
  setMaxSliderValue,
} from '../../../stores/slices/graphSlice';
import { useStyles } from './SliderMUI';
import { graphCards } from './../../../util/graphCards';

export const SliderSizes = (props) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentSliderValue = useAppSelector((state) => state.graph.currentSliderValue);
  const genotypesForFilter = useAppSelector((state) => state.dashboard.genotypesForFilter);
  const maxSliderValue = useAppSelector((state) => state.graph.maxSliderValue);
  // const [currentSliderValue, setCurrentSliderValue] = useState(20);

  const [heading, setHeading] = useState('');
  const [sliderValueMax, setSliderValueMax] = useState();

  const handleDefaultSliderChange = (event, newValue) => {
    // dispatch(setCurrentSliderValue(newValue));
    // callBackValue(newValue);
      dispatch(setCurrentSliderValue(newValue));
  };
  

  useEffect(() => {
      setSliderValueMax(maxSliderValue);
      setHeading(`Individual genotype to colour:`);
  });
  

  return (
    <div className={classes.sliderSize}>
      <Box>
        {/* Display the values of the sliders */}
        <div className={classes.sliderLabel}>
          <p>{heading}</p>
          <p>{currentSliderValue}
          </p>
        </div>
        <Slider
          value={currentSliderValue}
          onChange={handleDefaultSliderChange}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={genotypesForFilter.length}
        />
      </Box>
    </div>
  );
};
