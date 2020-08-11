import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


import AppBar from '@material-ui/core/AppBar'
import ToolBar from '@material-ui/core/ToolBar'
import Typography from '@material-ui/core/ToolBar'
import Button from '@material-ui/core/Button'

import {AuthUserContext} from './Session'
 
import * as ROUTES from '../constants/routes';
import SignOut from './SignOut'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    title: {
      flexGrow: 1,
      fontSize: 'x-large'
    },
  }),
);
 
const Navigation = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position='static'>
                <ToolBar>
                    <Typography className={classes.title}>
                        Runway Manager
                    </Typography>
                    <Button href={ROUTES.HOME} color='inherit'>
                        Home
                    </Button>
                    <Button href={ROUTES.SIGN_IN} color='inherit'>
                        Sign In
                    </Button>
                    <AuthUserContext.Consumer>
                        {authUser =>
                            authUser ? <SignOut/> : null
                        }
                    </AuthUserContext.Consumer>
                </ToolBar>
                
            </AppBar>
        </div>
    )
};
 
export default Navigation;