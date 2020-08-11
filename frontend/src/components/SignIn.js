import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import  AirplaneTakeoff  from 'mdi-material-ui/AirplaneTakeoff';

import * as ROUTES from '../constants/routes';
import { withFirebase } from './Firebase';


import {withRouter} from 'react-router-dom'
import {compose} from 'recompose'
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

const SignIn = (props) => {
    const [error, setError] = useState('')

    const classes = useStyles();

    const handleSignIn = (e) => {

        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        props.firebase
            .signInWithEmail(email, password)
            .then(authUser => {
                setError(null)
                props.history.push(ROUTES.HOME)
            })
            // .then(() => {
            //     return props.firebase.sendEmailVerification
            // })
            .catch(error => {
                console.log(error)
                setError(error.message)
            })
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
            <form className={classes.form} onSubmit={handleSignIn}>
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
            {error && <p style={{color: 'red'}}> {error} </p>}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Sign In
            </Button>
            <Grid container>
                <Grid item xs>
                <Link href='' variant="body2">
                    Forgot password?
                </Link>
                </Grid>
                <Grid item>
                <Link href={ROUTES.SIGN_UP} variant="body2">
                    {"Don't have an account? Sign Up"}
                </Link>
                </Grid>
            </Grid>
            </form>
        </div>
        <Box mt={8}>
            <Copyright />
        </Box>
        </Container>
    );
}

export default compose(withRouter, withFirebase)(SignIn)