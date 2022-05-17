import {Avatar, Box, Button, Dialog, Divider, Grid, IconButton, TextField, Typography,} from '@mui/material';
import {Close, HealthAndSafety} from "@mui/icons-material";
import React, {useEffect, useState} from 'react';
import axios from 'axios';

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/;
const max10DigitRegex = /[0-9]{10}/;

export const apiGatewayEndpoint: any = process.env.REACT_APP_AWS_API_GATEWAY_ENDPOINT;

/**
 * Registration form using material ui design
 *
 * @constructor default constructor
 */
export const RegistrationForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [npi, setNpi] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [zip, setZip] = useState("");
    const [registerButtonDisabled, setRegisterButtonDisabled] = useState(true);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [npiError, setNpiError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [address1Error, setAddress1Error] = useState(false);
    const [countryError, setCountryError] = useState(false);
    const [zipError, setZipError] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [requestId, setRequestId] = useState("");

    // Need to use this to get changed state of all states for dynamic form validation
    useEffect(() => {
        /**
         * Validates all the error to see if registration button can be enable or not
         */
        const checkRegisterButton = () => {
            let beDisable = firstNameError || lastNameError || npiError || emailError
                || phoneError || address1Error || countryError || zipError;
            if (!beDisable) {
                beDisable = isEmpty(firstName) || isEmpty(lastName) ||
                    isInvalidMatchedRegex(npi, max10DigitRegex) || isInvalidMatchedRegex(email, emailRegex) ||
                    isInvalidMatchedRegex(phone, max10DigitRegex) || isEmpty(address1) || isEmpty(country) ||
                    isInvalidMatchedRegex(zip, zipRegex);
            }

            setRegisterButtonDisabled(beDisable);
        };
        checkRegisterButton()
    }, [firstName, lastName, email, phone, address1, country, npi, zip, emailError, firstNameError, lastNameError,
        npiError, phoneError, address1Error, countryError, zipError])

    /**
     * Checks if the given string is empty or not
     * @param value a value to be checked
     *
     * @returns true if the string is empty otherwise false
     */
    const isEmpty = (value: String) => {
        return value.trim().length === 0
    }

    /**
     * Checks if the given string value can set given error state to true if string is
     * empty
     * @param value a value to checked
     * @param setValue a set state dispatch
     */
    const isEmptyError = (value: string, setValue: React.Dispatch<React.SetStateAction<boolean>>) => {
        setValue(isEmpty(value))
    };

    /**
     * Checks if the given string matches the given regex pattern
     *
     * @param value a value to be checked
     * @param regex a regex pattern to be validated with
     *
     * @returns true if it matches the given regex pattern otherwise false
     */
    const isInvalidMatchedRegex = (value: String, regex: RegExp) => {
        return !String(value).toLowerCase().match(regex);
    }

    /**
     * Checks if the given string value can set given error state if it doesn't matched
     * matches the given regex pattern
     *
     * @param value a value to be checked
     * @param setValue a set state dispatch
     * @param regex a regex pattern to match
     */
    const isInvalidMatchedRegexError = (value: string, setValue: React.Dispatch<React.SetStateAction<boolean>>, regex: RegExp) => {
        setValue(isInvalidMatchedRegex(value, regex));
    };

    /**
     * A model close callback. This will set all the states to be empty or true
     * and disable the registration button
     */
    const handleModalClose = () => {
        setModalOpen(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setNpi("");
        setPhone("");
        setCountry("");
        setZip("");
        setAddress1("");
        setAddress2("");
        setCity("");
        setState("");
        setRegisterButtonDisabled(true);
    };

    /**
     * A submit button callback action
     */
    const submitRegistration = async () => {
        const requestBody = {
            firstName: firstName,
            lastname: lastName,
            npi: npi,
            email: email,
            phone: phone,
            address1: address1,
            address2: address2,
            city: city,
            state: state,
            country: country,
            zip: zip
        };

        let modelValue: any
        try {
            const apiGatewayResult = await axios.post(apiGatewayEndpoint, requestBody)
            modelValue = apiGatewayResult.data.requestId;
        } catch (error) {
            modelValue = "Unable to post registration"
        }
        setRequestId(modelValue);
        setModalOpen(true);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%'
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <HealthAndSafety />
                </Avatar>
                <Typography component="h1" variant="h5" id="register">
                    Register
                </Typography>
                <Box sx={{
                    m: 3,
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    '@media (min-width: 1000px)' : {
                        flexDirection: 'row',
                        justifyContents: 'center',
                    },
                    gap: 2
                }}>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="InfoText" id="personalInformation">Personal Information</Typography>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="given-name"
                                name="firstName"
                                value={firstName}
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                onChange={(event) => setFirstName(event.target.value)}
                                onBlur={() => isEmptyError(firstName, setFirstNameError)}
                                onSelect={() => setFirstNameError(false)}
                                error={firstNameError}
                                helperText={firstNameError && "First name must not be empty."}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={lastName}
                                autoComplete="family-name"
                                onChange={(event) => setLastName(event.target.value)}
                                onSelect={(_) => setLastNameError(false)}
                                onBlur={() => isEmptyError(lastName, setLastNameError)}
                                error={lastNameError}
                                helperText={lastNameError && "Last name must not be empty."}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="npi"
                                label="NPI Number"
                                name="npi"
                                value={npi}
                                onChange={(event) => setNpi(event.target.value)}
                                onBlur={() => isInvalidMatchedRegexError(npi, setNpiError, max10DigitRegex)}
                                onSelect={() => setNpiError(false)}
                                error={npiError}
                                inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
                                helperText={npiError && "Enter a valid 10 digit NPI number"}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="InfoText" id="contactInformation">Contact Information</Typography>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={email}
                                autoComplete="email"
                                onChange={(event) => setEmail(event.target.value)}
                                onSelect={() => { setEmailError(false); }}
                                error={emailError}
                                helperText={emailError && "Enter a valid email address"}
                                onBlur={() => isInvalidMatchedRegexError(email, setEmailError, emailRegex)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="phone"
                                label="Phone Number"
                                name="phone"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                onBlur={() => isInvalidMatchedRegexError(phone, setPhoneError, max10DigitRegex)}
                                onSelect={(_) => setPhoneError(false)}
                                error={phoneError}
                                inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
                                helperText={phoneError && "Enter a valid phone number"}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        '@media (min-width: 1000px)' : {
                            justifyContent: 'flex-end',
                        },
                    }}>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="InfoText" id="address">Address</Typography>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} sx={{
                            '@media (min-width: 1000px)' : {
                                mt: '0.5%',
                            },
                        }}>
                            <TextField
                                required
                                fullWidth
                                id="address1"
                                label="Address Line 1"
                                name="address1"
                                value={address1}
                                onChange={(event) => setAddress1(event.target.value)}
                                onSelect={(_) => setAddress1Error(false)}
                                onBlur={() => isEmptyError(address1, setAddress1Error)}
                                error={address1Error}
                                helperText={address1Error && "Address line 1 must not be empty."}
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="address2"
                                label="Address Line 2"
                                name="address2"
                                value={address2}
                                onChange={(event) => setAddress2(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="city"
                                name="city"
                                value={city}
                                fullWidth
                                id="city"
                                label="City"
                                onChange={(event) => setCity(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="state"
                                name="state"
                                value={state}
                                fullWidth
                                id="state"
                                label="State"
                                onChange={(event) => setState(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="country"
                                name="country"
                                value={country}
                                required
                                fullWidth
                                id="country"
                                label="Country"
                                onChange={(event) => setCountry(event.target.value)}
                                onSelect={(_) => setCountryError(false)}
                                onBlur={() => isEmptyError(country, setCountryError)}
                                error={countryError}
                                helperText={countryError && "Country must not be empty."}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete="zip"
                                name="zip"
                                value={zip}
                                required
                                fullWidth
                                id="zip"
                                label="Zip Code"
                                onChange={(event) => setZip(event.target.value)}
                                onBlur={() => isInvalidMatchedRegexError(zip, setZipError, zipRegex)}
                                onSelect={() => setZipError(false)}
                                error={zipError}
                                helperText={zipError && "Enter a valid zip"}
                                inputProps={{ maxLength: 5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                id="submitRegistration"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={registerButtonDisabled}
                                onClick={() => submitRegistration()}
                            >
                                Register
                            </Button>
                        </Grid>
                    </Grid>

                </Box>

                <Dialog
                    open={modalOpen}
                    aria-labelledby="api-gateway-request-dialog-title"
                    aria-describedby="api-gateway-request-dialog-description"
                    id='apigateway-request-dialog'
                >
                    <Grid id="api-gateway-request-dialog-title" container sx={{
                        pl: 1, pt: 0, pr: 0,
                        display: 'flex',
                        direction: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Typography variant="h6" component="h2">API Gateway Request Id</Typography>
                        <IconButton id='apigateway-request-dialog-close' size={'small'} onClick={handleModalClose}>
                            <Close/>
                        </IconButton>
                    </Grid>

                    <Typography id="api-gateway-request-dialog-description" sx={{ m: 6, textAlign: 'center'}}>
                        {requestId}
                    </Typography>
                </Dialog>
            </Box>
        </Box>
    );
};