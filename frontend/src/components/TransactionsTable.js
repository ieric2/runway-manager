import React, { useCallback, useEffect, useState } from 'react';
import Table  from '@material-ui/core/Table';
import TableHead  from '@material-ui/core/TableHead';
import TableBody  from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'


const TransactionsTable = ({transactions}) => {

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell align='right'>Amount</TableCell>
                    <TableCell align='right'>Merchant</TableCell>
                    <TableCell align='right'>Date</TableCell>
                    <TableCell align='right'>Category</TableCell>
                    <TableCell align='right'>SubCategory</TableCell>
                    <TableCell align='right'>SubCategory2</TableCell>
                </TableRow>
            </TableHead>
                {transactions.map((transaction) => (
                    <TableRow>
                        <TableCell>{transaction.name}</TableCell>
                        <TableCell align='right'>{transaction.amount}</TableCell>
                        <TableCell align='right'>{transaction.merchant_name}</TableCell>
                        <TableCell align='right'>{transaction.date}</TableCell>
                        {transaction.category.length >= 1 &&
                            <TableCell align='right'>{transaction.category[0]}</TableCell>
                        }
                        {transaction.category.length >= 2 &&
                            <TableCell align='right'>{transaction.category[1]}</TableCell>
                        }
                        {transaction.category.length >= 3 &&
                            <TableCell align='right'>{transaction.category[2]}</TableCell>
                        }
                    </TableRow>
                ))}
            <TableBody>
            </TableBody>
        </Table>
    )


}

export default TransactionsTable