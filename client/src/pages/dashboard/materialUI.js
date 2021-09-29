import { makeStyles, withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import CircularProgress from '@material-ui/core/CircularProgress';
import ToggleButton from '@material-ui/lab/ToggleButton';
import styled from "@emotion/styled";

const useStyles = makeStyles((theme) => ({
    formControlSelect: {
        marginBottom: 12,
        marginTop: 2,
        minWidth: 120,
        '&.label.Mui-focused': {
            color: "rgb(31, 187, 211)",
        },
        '&:not(.Mui-error).MuiInput-underline:after': {
            borderBottomColor: "rgb(31, 187, 211)",
        }
    },
    formControlSelectCountryRegionH: {
        marginBottom: 16,
        alignItems: "flex-start"
    },
    formControlSelectCountryRegionV: {
        marginBottom: 16,
        alignItems: "flex-start",
    },
    select: {
        fontWeight: 600,
        fontFamily: "Montserrat",
        fontSize: 14
    },
    selectYear: {
        fontWeight: 600,
        fontFamily: "Montserrat",
        fontSize: 14,
        width: '85px',
        '&:before': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
        }
    },
    selectCountry: {
        fontWeight: 600,
        fontFamily: "Montserrat",
        width: 200,
        textAlign: "left"
    },
    selectCountryValues: {
        fontWeight: 600,
        fontFamily: "Montserrat"
    },
    typography: {
        fontWeight: 500,
        fontFamily: "Montserrat",
        color: "rgb(117,117,117)",
        fontSize: 12
    },
    typographyEndYear: {
        fontWeight: 500,
        fontFamily: "Montserrat",
        color: "rgb(117,117,117)",
        fontSize: 12
    },
    tbg: {
        marginTop: 5
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "Montserrat",
        paddingBottom: 5
    }
}));

const CustomSlider = withStyles({
    root: {
        color: "rgb(31, 187, 211)"
    },
    thumb: {
        "&.MuiSlider-thumb": {
            "&:not(.MuiSlider-active):focus": {
                boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
            },
            "&:not(.MuiSlider-active):hover": {
                boxShadow: "0px 0px 0px 8px rgba(31, 187, 211, 0.16)"
            },
            "&.MuiSlider-active": {
                boxShadow: "0px 0px 0px 14px rgba(31, 187, 211, 0.16)"
            },
        },
    },
    valueLabel: {
        fontFamily: "Montserrat",
        fontWeight: 500
    }
})(Slider);

const CustomCircularProgress = withStyles({
    root: {
        color: "rgb(31, 187, 211)",
        position: "absolute",
        top: -5,
        left: -6
    }
})(CircularProgress);

const CustomToggleButton = withStyles({
    root: {
        padding: "2px 8px",
        fontFamily: "Montserrat",
        fontWeight: 600
    },
    selected: {
        backgroundColor: 'rgb(31, 187, 211) !important',
        color: "white !important"
    }
})(ToggleButton);

const Buttons = styled.div`
  display: flex;

  & div {
    margin: 0 0 0 10px;
    font-weight: 600;
  }
`;

const ButtonClearSelect = styled.button`
  background: none;
  border: 1px solid #555;
  color: #555;
  border-radius: 3px;
  margin: 0 10px 0;
  padding: 3px 5px;
  font-size: 10px;
  text-transform: uppercase;
  cursor: pointer;
  outline: none;

  &.clear {
    color: tomato;
    border: 1px solid tomato;
  }

  :hover {
    border: 1px solid deepskyblue;
    color: deepskyblue;
  }
`;

export { useStyles, CustomSlider, CustomCircularProgress, CustomToggleButton, Buttons, ButtonClearSelect };