import { AddCircle, FilterCenterFocus, RemoveCircle } from '@mui/icons-material';
import { IconButton, Tooltip, Zoom } from '@mui/material';
import { useStyles } from './BottomLeftControlsMUI';
import { useAppDispatch, useAppSelector } from '../../../../stores/hooks';
import { setPosition } from '../../../../stores/slices/mapSlice';

export const BottomLeftControls = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const position = useAppSelector((state) => state.map.position);

  function handleRecenter() {
    dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
  }

  function handleZoomIn() {
    if (position.zoom >= 4) return;

    dispatch(setPosition({ ...position, zoom: position.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    if (position.zoom / 2 === 1) {
      dispatch(setPosition({ coordinates: [0, 0], zoom: 1 }));
    } else {
      dispatch(setPosition({ ...position, coordinates: [0, 0], zoom: position.zoom / 2 }));
    }
  }

  return (
    <div className={classes.bottomLeftControls}>
      <Zoom in={position.zoom !== 1 || position.coordinates.some((coordinate) => coordinate !== 0)}>
        <Tooltip title="Recenter" placement="right">
          <IconButton onClick={handleRecenter}>
            <FilterCenterFocus fontSize="large" color="primary" />
          </IconButton>
        </Tooltip>
      </Zoom>
      <Tooltip title="Zoom In" placement="right">
        <span>
          <IconButton color="primary" onClick={handleZoomIn}>
            <AddCircle fontSize="large" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Zoom Out" placement="right">
        <span>
          <IconButton color="primary" onClick={handleZoomOut}>
            <RemoveCircle fontSize="large" />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
