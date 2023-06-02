import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  bottomRightControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    right: 0
  }
}));

export { useStyles };
