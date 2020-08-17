import React, {useState, useEffect} from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import Navigation from './Navigation';
import SignUp from './SignUp'
import SignIn from './SignIn'
import Home from './Home'
import Landing from './LandingPage'
import Graph from './Graph'

import * as ROUTES from '../constants/routes';
import { withFirebase } from './Firebase';
import {AuthUserContext, withAuthorization, withAuthentication} from './Session'


 
const App = (props) => (
    <BrowserRouter>
        <Navigation/>
        <Route exact path={ROUTES.LANDING} component={Landing}/>
        <Route path={ROUTES.SIGN_UP} component={SignUp} />
        <Route path={ROUTES.SIGN_IN} component={SignIn} />
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.GRAPH} component={Graph} />
    </BrowserRouter>
);
 
export default withAuthentication(App);