import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as firebase from 'firebase/app';

const styles = (theme) =>
    createStyles({
        coolButton: {
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            border: 0,
            borderRadius: 3,
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            color: 'white',
            height: 48,
            padding: '0 30px',
          },
          absoluteCenter: {
            position: 'absolute', 
            top: "50%",
            left: '50%',
            transform: "translate(-50%,-50%)",
          },
          accountsGrid: {
            alignContent: 'center'
          },
          accountCard: {
            alignContent: 'center'
          },
          accountCardActions: {
            justifyContent: 'center'
          },
          accountCardContent: {
            textAlign: 'center'
          }
        });


export { styles };