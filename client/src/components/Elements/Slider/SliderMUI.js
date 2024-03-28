import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  sliderLabel: {
    display: 'flex',
    fontSize: '12px',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sliderSize: {
   width: '100%', // Default width
      '@supports (-webkit-appearance:none)': {
        // Safari and Chrome
        width: '100%',
      },
      '@supports (-moz-appearance:none)': {
        // Firefox
        width: '100%',
      },
    margin: '0px 10px',
  },
}));

export { useStyles };
