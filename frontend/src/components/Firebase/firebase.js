import app from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  };

class Firebase {
    constructor() {
        app.initializeApp(firebaseConfig);

        this.auth = app.auth();
        this.db = app.firestore()
    }

    createUserWithEmail = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    signInWithEmail = (email, password) => 
        this.auth.signInWithEmailAndPassword(email, password);

    signOut = () =>
        this.auth.signOut()

    resetPassword = (email) =>
        this.auth.sendPasswordResetEmail(email)

    updatePassword = (password) =>
        this.auth.currentUser.updatePassword(password)

    sendEmailVerification = () =>
        this.auth.currentUser.sendEmailVerification({
        url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
        });
    
    getPlaidFirebaseDoc = (userId) => 
        this.db.collection('plaid').doc(userId).get();

    
    setPlaidFirebaseDoc = (accessToken, itemId, userId) => {
        const newDoc = {
            accessToken: accessToken,
            itemId: itemId
        }
        this.db.collection('plaid').doc(userId).set(newDoc)
    }

    getPlaidAccounts = (userId) =>
        this.db.collection('plaid').doc(userId).collection('accounts').get()

    setPlaidAccount = (userId, account) => {
        this.db.collection('plaid').doc(userId).collection('accounts').doc(account.account_id).set(account)
    }
    getPlaidTransactions = (userId, accountId) =>
        this.db.collection('plaid').doc(userId).collection('accounts').doc(accountId).collection('transactions').orderBy('date', 'desc').get()

    setPlaidTransactions = (userId, accountId, transactions) => {
        const batch = this.db.batch()
        for (const transaction of transactions){
            const docRef = this.db.collection('plaid').doc(userId).collection('accounts').doc(accountId).collection('transactions').doc(transaction.transaction_id)
            batch.set(docRef, transaction)

        }
        batch.commit()
    }

    getAccount = (userId, accountId) => 
        this.db.collection('plaid').doc(userId).collection('accounts').doc(accountId).get();



}

export default Firebase