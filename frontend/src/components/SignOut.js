import React from 'react'

import Button from '@material-ui/core/Button';

import {withFirebase} from './Firebase'

const SignOut = (props) => (
    <Button onClick={props.firebase.signOut} color='inherit'>
        Sign Out
    </Button>
)

export default withFirebase(SignOut)