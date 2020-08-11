import React, {useEffect, useState} from 'react'
import { usePlaidLink } from 'react-plaid-link';
import Button from '@material-ui/core/Button'
import {withStyles} from '@material-ui/core/styles'


import isEqual from 'lodash/isEqual'
import clsx from 'clsx';
import axios from 'axios';

import { styles} from '../styles';

import { withFirebase } from './Firebase';


const PlaidComponent = (props) => {

    const [linkToken, setLinkToken] = useState('')





    useEffect(() => {
        props.firebase
            .getPlaidFirebaseDoc(props.user.email)
            .then(doc => {
                const data = doc.data()
                if (data !== undefined && 'accessToken' in data){
                    console.log(data.accessToken)
                    props.setAccessToken(data.accessToken)
                    props.setItemId(data.itemId)
                }
                else{
                    const params = new URLSearchParams()
                    params.append('client_user_id', props.user.email)
                    axios({
                        method: 'post',
                        url:'https://us-central1-runway-manager.cloudfunctions.net/app/api/create_link_token',
                        data: params
                    }).then(res => {
                        setLinkToken(res.data.link_token)
                    })
                }
            })
        

    }, [])



    const onLinkSuccess = (token, metadata) => {
        const params = new URLSearchParams()
        params.append('public_token', token)
        axios({
            method: 'post',
            url: 'https://us-central1-runway-manager.cloudfunctions.net/app/api/set_access_token',
            data: params
        }).then(res => {
            if (!error){
                props.setAccessToken(res.data.access_token)
                props.setItemId(res.data.item_id)
                props.firebase.setPlaidFirebaseDoc(res.data.access_token, res.data.item_id, props.user.email)

            }
        })
    };

    const plaidConfig = {
        token: linkToken,
        onSuccess: onLinkSuccess,
        env:'sandbox'
    }

    const {open, ready, error} = usePlaidLink(plaidConfig)

    return(
        <Button onClick={() => open()} disabled={!ready} className={clsx(props.classes.coolButton, props.classes.absoluteCenter)}>
            Connect Bank
        </Button>
    )
}

export default withFirebase(withStyles(styles)(PlaidComponent))