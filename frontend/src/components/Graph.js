import React, {useEffect, useState} from 'react'
import { withAuthorization, AuthUserContext } from './Session';
import {compose} from 'recompose'
import moment from 'moment'
import { withFirebase } from './Firebase';
import {  
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    VerticalRectSeries,
    LineSeries,
} from 'react-vis'
import "../../node_modules/react-vis/dist/style.css";



const Graph = (props) => {
    const [transactions, setTransactions] = useState([])
    const [balance, setBalance] = useState([])
    const [curBalance, setCurBalance] = useState(0)

    const initialize = async () => {
        let bal = await props.firebase
                        .getAccount('test@gmail.com', 'VBkaygL5DLHLqlnA9lDvImv8ZRyMGBUWErjBe')
                        .then(doc => {
                            setCurBalance(doc.data().balances.current)
                            return doc.data().balances.current
                        })
        props.firebase
            .getPlaidTransactions('test@gmail.com', 'VBkaygL5DLHLqlnA9lDvImv8ZRyMGBUWErjBe')
            .then(res => {
                const unixDay = 86400000
                const timeNow = (new Date).getTime()
                let barData = []
                let lineData = [{x: timeNow, y: bal}]
                //sort by date descending, cut off search when hit boundarh (maybe 30 days), each consecutive day, sub or add transaction amount

                for(const doc of res.docs){
                    const time = moment(doc.data().date)
                    if (time < timeNow - unixDay * 60){
                        break
                    }
                    barData.push({
                        x0: time,
                        x: time + unixDay,
                        y: doc.data().amount
                    })
                    bal -= doc.data().amount
                    lineData.push({
                        x: time,
                        y: bal,
                    })
                }
                setTransactions(barData)
                setBalance(lineData)
            })
    }

    useEffect(() => {
        initialize()
    }, [])


    return(
        <div>
            <h2>
                Graph
            </h2>
            <XYPlot
                xType="time"
                width={1000}
                height={300}            

            >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <VerticalRectSeries data={transactions} style={{stroke: '#fff'}} />
            </XYPlot>
            <XYPlot
                xType="time"
                width={1000}
                height={300}            

            >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <LineSeries data={balance} />
            </XYPlot>
        </div>
    )
}



const condition = authUser => !!authUser;


export default compose(withFirebase, withAuthorization(condition))(Graph);