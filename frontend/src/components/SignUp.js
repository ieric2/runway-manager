import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import  AirplaneTakeoff  from 'mdi-material-ui/AirplaneTakeoff';

import {compose} from 'recompose'
import { withFirebase } from './Firebase';
import {withRouter} from 'react-router-dom'

import * as ROUTES from './../constants/routes'

import * as firebase from 'firebase/app'
import 'firebase/auth'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/ieric2/">
        Eric Liu
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));


const SignUp = (props) => {

    const [error, setError] = useState(null)

    const classes = useStyles();

    const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';

    const ERROR_MSG_ACCOUNT_EXISTS = `
    An account with this E-Mail address already exists.
    Try to login with this account instead. If you think the
    account is already used from one of the social logins, try
    to sign in with one of them. Afterward, associate your accounts
    on your personal account page.
    `;


    const handleSignUp = (e) => {

        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const password2 = document.getElementById('password2').value

        if (password !== password2){
            console.log('passwords dont match')
            setError('Passwords do not match')
        }
        else{
            props.firebase
                .createUserWithEmail(email, password)
                .then(authUser => {
                    setError(null)
                    props.history.push(ROUTES.HOME)
                })
                // .then(() => {
                //     return props.firebase.sendEmailVerification
                // })
                .catch(error => {
                    if (error.code === ERROR_CODE_ACCOUNT_EXISTS){
                        setError(ERROR_MSG_ACCOUNT_EXISTS)
                    }
                    else{
                        setError(error.message)
                    }

                })
        }
    }

    return (
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <AirplaneTakeoff />
            </Avatar>
            <Typography component="h1" variant="h4">
            Runway Manager
            </Typography>
            <form className={classes.form} onSubmit={handleSignUp}>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="confirm_password"
                label="Confirm Password"
                type="password"
                id="password2"
            />
            {error && <p style={{color: 'red'}}> {error} </p>}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Sign Up
            </Button>
            </form>
        </div>
        <Box mt={8}>
            <Copyright />
        </Box>
        </Container>
    );
}

export default compose(withRouter,withFirebase)(SignUp)