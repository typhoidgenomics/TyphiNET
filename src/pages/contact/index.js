import './index.css'
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const ContactPage = () => {
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

  const submit = () => {

  }

  return (
    <div className="contact">
      <div className="row">
        <TextField
          value={form.company}
          onChange={(evt) => {
            setForm({ ...form, company: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Company</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
        <div style={{ width: 16 }} />
        <TextField
          value={form.email}
          onChange={(evt) => {
            setForm({ ...form, email: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Email address</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
      </div>
      <div className="row">
        <TextField
          value={form.firstName}
          onChange={(evt) => {
            setForm({ ...form, firstName: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>First name</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
        <div style={{ width: 16 }} />
        <TextField
          value={form.lastName}
          onChange={(evt) => {
            setForm({ ...form, lastName: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Last name</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
      </div>
      <TextField
        value={form.address}
        onChange={(evt) => {
          setForm({ ...form, address: evt.target.value })
        }}
        fullWidth
        style={{ marginBottom: 16 }}
        label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Address</span>}
        InputProps={{ style: { fontFamily: "Montserrat" } }}
      />
      <div className="row">
        <TextField
          value={form.city}
          onChange={(evt) => {
            setForm({ ...form, city: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>City</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
        <div style={{ width: 18 }} />
        <TextField
          value={form.country}
          onChange={(evt) => {
            setForm({ ...form, country: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Country</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
        <div style={{ width: 18 }} />
        <TextField
          value={form.postalCode}
          onChange={(evt) => {
            setForm({ ...form, postalCode: evt.target.value })
          }}
          fullWidth
          label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Postal code</span>}
          InputProps={{ style: { fontFamily: "Montserrat" } }}
        />
      </div>
      <TextField
        value={form.additionalInformation}
        onChange={(evt) => {
          setForm({ ...form, additionalInformation: evt.target.value })
        }}
        fullWidth
        multiline
        style={{ marginBottom: 16 }}
        label={<span style={{ fontFamily: "Montserrat", fontWeight: 600 }}>Additional information</span>}
        InputProps={{ style: { fontFamily: "Montserrat" } }}
      />
      <Button variant="contained" color="primary" style={{ fontFamily: "Montserrat" }} onClick={submit}>
        Submit
      </Button>
    </div>
  );
};

export default ContactPage;