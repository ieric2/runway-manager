import React, {useState, useEffect} from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import Navigation from './Navigation';
import SignUp from './SignUp'
import SignIn from './SignIn'
import Home from './Home'
import Landing from './Landing'

import * as ROUTES from '../constants/routes';
import { withFirebase } from './Firebase';
import {AuthUserContext} from './Session'


 
const App = (props) => {
    const [authUser, setAuthUser] = useState(null)

    useEffect(() => {
        const listener = props.firebase.auth.onAuthStateChanged(user => {
            setAuthUser(user)
        })
        return () => {
            listener();
        }
    }, [])

    return(
        <AuthUserContext.Provider value={authUser}>
            <BrowserRouter>
                <Navigation/>
                <Route exact path={ROUTES.LANDING}/>
                <Route path={ROUTES.SIGN_UP} component={SignUp} />
                <Route path={ROUTES.SIGN_IN} component={SignIn} />
                <Route path={ROUTES.HOME} component={Home} />
            </BrowserRouter>
        </AuthUserContext.Provider>
    )

};
 
export default withFirebase(App);