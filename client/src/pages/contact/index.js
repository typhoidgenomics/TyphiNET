import './index.css'
import React from 'react';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { API_ENDPOINT } from '../../constants';
import { makeStyles, fade } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  textField: {
    '& label.Mui-focused': {
      color: "rgb(31, 187, 211)",
    },
    '& :not(.Mui-error).MuiInput-underline:after': {
      borderBottomColor: "rgb(31, 187, 211)",
    }
  },
  button: {
    backgroundColor: "rgb(31, 187, 211)",
    '&:hover': {
      backgroundColor: fade("rgb(31, 187, 211)", .6)
    }
  }
}));

const ContactPage = () => {
  const classes = useStyles();

  const [form, setForm] = React.useState({
    company: '',
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    additionalInformation: ''
  })
  const [formErrors, setFormErrors] = React.useState({
    company: '',
    email: '',
    firstName: '',
    lastName: '',
    city: '',
    country: '',
  })
  const [loading, setLoading] = React.useState(false)

  const isDesktop = window.innerWidth > 767

  const submit = () => {
    let error = false;
    let _formErrors = {
      company: '',
      email: '',
      firstName: '',
      lastName: '',
      city: '',
      country: '',
    }

    if (form.company === '') {
      _formErrors = { ..._formErrors, company: 'This field is required.' }
      error = true
    }

    if (form.email === '') {
      _formErrors = { ..._formErrors, email: 'This field is required.' }
      error = true
    }

    if (form.firstName === '') {
      _formErrors = { ..._formErrors, firstName: 'This field is required.' }
      error = true
    }

    if (form.lastName === '') {
      _formErrors = { ..._formErrors, lastName: 'This field is required.' }
      error = true
    }

    if (form.city === '') {
      _formErrors = { ..._formErrors, city: 'This field is required.' }
      error = true
    }

    if (form.country === '') {
      _formErrors = { ..._formErrors, country: 'This field is required.' }
      error = true
    }

    if (!error) {
      setLoading(true)
      axios.post(`${API_ENDPOINT}email`, form)
        .then((res) => {
          setLoading(false)
          window.alert('Message successfully sent!')
        })
        .catch((res) => {
          setLoading(false)
          window.alert('Error while sending message. Please try again.')
        })
    } else {
      setFormErrors(_formErrors)
    }
  }

  return (
    <div className="contact">
      <div className="row">
        <TextField
          className={classes.textField}
          value={form.company}
          onChange={(evt) => {
            setForm({ ...form, company: evt.target.value })
            setFormErrors({ ...formErrors, company: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Company</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.company !== ''}
          helperText={formErrors.company}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
        {isDesktop && (
          <div style={{ width: 16 }} />
        )}
        <TextField
          className={classes.textField}
          value={form.email}
          onChange={(evt) => {
            setForm({ ...form, email: evt.target.value })
            setFormErrors({ ...formErrors, email: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Email address</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.email !== ''}
          helperText={formErrors.email}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
      </div>
      <div className="row">
        <TextField
          className={classes.textField}
          value={form.firstName}
          onChange={(evt) => {
            setForm({ ...form, firstName: evt.target.value })
            setFormErrors({ ...formErrors, firstName: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>First name</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.firstName !== ''}
          helperText={formErrors.firstName}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
        {isDesktop && (
          <div style={{ width: 16 }} />
        )}
        <TextField
          className={classes.textField}
          value={form.lastName}
          onChange={(evt) => {
            setForm({ ...form, lastName: evt.target.value })
            setFormErrors({ ...formErrors, lastName: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Last name</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.lastName !== ''}
          helperText={formErrors.lastName}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
      </div>
      <div className="row">
        <TextField
          className={classes.textField}
          value={form.address}
          onChange={(evt) => {
            setForm({ ...form, address: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Address</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
        />
      </div>
      <div className="row">
        <TextField
          className={classes.textField}
          value={form.city}
          onChange={(evt) => {
            setForm({ ...form, city: evt.target.value })
            setFormErrors({ ...formErrors, city: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>City</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.city !== ''}
          helperText={formErrors.city}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
        {isDesktop && (
          <div style={{ width: 16 }} />
        )}
        <TextField
          className={classes.textField}
          value={form.country}
          onChange={(evt) => {
            setForm({ ...form, country: evt.target.value })
            setFormErrors({ ...formErrors, country: '' })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Country</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
          error={formErrors.country !== ''}
          helperText={formErrors.country}
          FormHelperTextProps={{
            style: { fontFamily: "Montserrat", fontWeight: 400 }
          }}
        />
        {isDesktop && (
          <div style={{ width: 16 }} />
        )}
        <TextField
          className={classes.textField}
          value={form.postalCode}
          onChange={(evt) => {
            setForm({ ...form, postalCode: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Postal code</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
        />
      </div>
      <div className="row">
        <TextField
          className={classes.textField}
          value={form.additionalInformation}
          onChange={(evt) => {
            setForm({ ...form, additionalInformation: evt.target.value })
          }}
          fullWidth
          multiline
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Additional information</span>}
          InputProps={{ style: { fontFamily: "Montserrat", fontWeight: 600 } }}
        />
      </div>
      {!loading ? (
        <Button variant="contained" color="primary" className={classes.button} style={{ fontFamily: "Montserrat", marginTop: 16 }} onClick={submit}>
          Submit
        </Button>
      ) : (
          <div style={{ marginTop: 16 }}>
            <LinearProgress />
          </div>
        )}
    </div>
  );
};

export default ContactPage;