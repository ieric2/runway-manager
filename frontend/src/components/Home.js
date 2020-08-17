import { compose } from 'recompose';
import { withAuthorization, AuthUserContext } from './Session';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import TransactionsTable from './TransactionsTable.js'
import * as ROUTES from '../constants/routes';

import {styles} from '../styles';


import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import CardActions from '@material-ui/core/CardActions'

import isEqual from 'lodash/isEqual'
import clsx from 'clsx';
import axios from 'axios';

import { withFirebase } from './Firebase';
import PlaidComponent from './PlaidComponent'

  
const Home = (props) => {


    const [accessToken, setAccessToken] = useState(undefined)
    const [itemId, setItemId] = useState(undefined)
    const [userAccounts, setUserAccounts] = useState(null)
    const [transactions, setTransactions] = useState([])
    const currentUser = useContext(AuthUserContext)


    useEffect(() => {
        props.firebase
            .getPlaidFirebaseDoc(currentUser.email)
            .then(doc => {
                const data = doc.data()
                if (data !== undefined && 'accessToken' in data){
                    setAccessToken(data.accessToken)
                    setItemId(data.itemId)
                }
                else{
                    setAccessToken(null)
                    setItemId(null)
                }
            })
    }, [])


    const getUserAccounts = async () => {
        const collection = await props.firebase
            .getPlaidAccounts(currentUser.email)

        if (collection == undefined || collection.docs.length == 0){
            const params = new URLSearchParams()
            params.append('access_token', accessToken)
            axios.post(ROUTES.BACKEND + '/api/accounts', params).then(res => {
            for (const account of res.data.accounts){
                props.firebase.setPlaidAccount(currentUser.email, account)
            }
            setUserAccounts(res.data.accounts)
            })    
        }
        else{
            let userAccounts = []
            for (const doc of collection.docs){
                userAccounts.push(doc.data())
            }
            setUserAccounts(userAccounts)
        }
    }

    const selectUserAccount = (accountId) => async (e) => {
        const transactionCollection = await props.firebase.getPlaidTransactions(currentUser.email, accountId)
        if (transactionCollection == undefined || transactionCollection.docs.length == 0){
            const params = new URLSearchParams()
            params.append('account_id', accountId)
            params.append('access_token', accessToken)
            axios.post(ROUTES.BACKEND + '/api/transactions', params). then(res => {
                props.firebase.setPlaidTransactions(currentUser.email, accountId, res.data.transactions)
                setTransactions(res.data.transactions)
            })
        }
        else{
            let transactions = []
            for (const transaction of transactionCollection.docs){
                transactions.push(transaction.data())
            }
        
            setTransactions(transactions)
        }
    }
    return(
        <div>
            {accessToken === undefined &&
                null
            }
            {accessToken === null &&
                <AuthUserContext.Consumer>
                    {authUser => 
                        <PlaidComponent user={authUser} setAccessToken={setAccessToken} setItemId={setItemId}/>
                    }
                </AuthUserContext.Consumer>
            }
            {accessToken && !userAccounts &&
                <Button className={clsx(props.classes.coolButton, props.classes.absoluteCenter)} onClick={getUserAccounts}>
                Show Accounts
                </Button>
            }
            {
                userAccounts && isEqual(transactions, []) && (
                <Grid container direction="column" className={props.classes.accountsGrid}>
                    {userAccounts.map((account) => (
                        <Card key={account.account_id} variant={'outlined'} className={props.classes.accountCard}>
                        <CardContent className={props.classes.accountCardContent}>
                            <Typography variant="h5">
                            {account.name}
                            </Typography>
                            <Typography>
                            {account.balances.available}
                            </Typography>
                        </CardContent>
                        <CardActions className={props.classes.accountCardActions}>
                            <Button className={props.classes.coolButton} onClick={selectUserAccount(account.account_id)}>
                            Select
                            </Button>
                        </CardActions>
                        </Card>
                    ))}
                </Grid>
                )
            }
            {
                !isEqual(transactions, []) && (

                    <TransactionsTable transactions={transactions}/>
                )
            }
        </div>
    )
}

const condition = authUser => !!authUser;


export default compose(withStyles(styles), withFirebase, withAuthorization(condition))(Home);