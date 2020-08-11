import React, { useCallback, useEffect, useState } from 'react';
import Table  from '@material-ui/core/Table';
import TableHead  from '@material-ui/core/TableHead';
import TableBody  from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'


const TransactionsTable = ({transactions}) => {

    // console.log(transactions)

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell align='right'>Amount</TableCell>
                    <TableCell align='right'>Merchant</TableCell>
                    <TableCell align='right'>Date</TableCell>
                </TableRow>
            </TableHead>
                {transactions.map((transaction) => (
                    <TableRow>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell align='right'>{transaction.amount}</TableCell>
                        <TableCell align='right'>{transaction.merchant_name}</TableCell>
                        <TableCell align='right'>{transaction.date}</TableCell>
                    </TableRow>
                ))}
            <TableBody>
            </TableBody>
        </Table>
    )


}

export default TransactionsTable