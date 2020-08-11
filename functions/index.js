'use strict';

require('dotenv').config()
const util = require('util');
const functions = require('firebase-functions')
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');
const cors = require('cors')

const APP_PORT = process.env.APP_PORT
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV;
// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = ['transactions'];

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = ['US'];

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:8000/oauth-response.html'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = '';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;
// The payment_id is only relevant for the UK Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store
var PAYMENT_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
var client = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments[PLAID_ENV],
  options: {
    version: '2019-05-29',
  }
});

const app = express();
app.use(cors({origin: true}))

//middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.get('/', (request, response, next) => {
  response.sendFile('./views/index.html', { root: __dirname });
});

// This is an endpoint defined for the OAuth flow to redirect to.
app.get('/oauth-response.html', (request, response, next) => {
  response.sendFile('./views/oauth-response.html', { root: __dirname });
});

app.post('/api/info', (request, response, next) => {
  response.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    products: PLAID_PRODUCTS
  })
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
app.post('/api/create_link_token', (request, response, next) => {
    const configs = {
        'user': {
        'client_user_id': request.body.client_user_id,
        },
        'client_name': "Plaid Quickstart",
        'products': PLAID_PRODUCTS,
        'country_codes': PLAID_COUNTRY_CODES,
        'language': "en",
    }

    if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI;
    }
    
    client.createLinkToken(configs, (error, createTokenResponse) => {
        if (error !== null) {
            prettyPrintResponse(error);
            return response.json({
            error: error,
            });
        }
        response.json(createTokenResponse);
    })
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#payment-initiation-create-link-token-request
app.post('/api/create_link_token_for_payment', (request, response, next) => {
    client.createPaymentRecipient(
      'Harry Potter',
      'GB33BUKB20201555555555',
      {
        'street':      ['4 Privet Drive'],
        'city':        'Little Whinging',
        'postal_code': '11111',
        'country':     'GB'
      },
      (error, createRecipientResponse) => {
        var recipientId = createRecipientResponse.recipient_id

        client.createPayment(
          recipientId,
          'payment_ref',
          {
            'value': 12.34,
            'currency': 'GBP'
          },
          (error, createPaymentResponse) => {
            prettyPrintResponse(createPaymentResponse)
            var paymentId = createPaymentResponse.payment_id
            PAYMENT_ID = paymentId;
            const configs = {
              'user': {
                // This should correspond to a unique id for the current user.
                'client_user_id': 'user-id',
              },
              'client_name': "Plaid Quickstart",
              'products': PLAID_PRODUCTS,
              'country_codes': PLAID_COUNTRY_CODES,
              'language': "en",
              'payment_initiation': {
                 'payment_id': paymentId
              }
            };
            if (PLAID_REDIRECT_URI !== '') {
              configs.redirect_uri = PLAID_REDIRECT_URI;
            }
            client.createLinkToken(
            {
               'user': {
                 // This should correspond to a unique id for the current user.
                 'client_user_id': 'user-id',
               },
               'client_name': "Plaid Quickstart",
               'products': PLAID_PRODUCTS,
               'country_codes': PLAID_COUNTRY_CODES,
               'language': "en",
               'redirect_uri': PLAID_REDIRECT_URI,
               'payment_initiation': {
                  'payment_id': paymentId
               }
             }, (error, createTokenResponse) => {
              if (error !== null) {
                prettyPrintResponse(error);
                return response.json({
                  error: error,
                });
              }
              response.json(createTokenResponse);
            })
          }
        )
      }
    )
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/api/set_access_token', (request, response, next) => {
  PUBLIC_TOKEN = request.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, (error, tokenResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    prettyPrintResponse(tokenResponse);
    response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    });
  });
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.post('/api/accounts', (request, response, next) => {
  client.getAccounts(request.body.access_token, (error, accountsResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(accountsResponse);
    response.json(accountsResponse);
  });
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/api/auth', (request, response, next) => {
  client.getAuth(ACCESS_TOKEN, (error, authResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(authResponse);
    response.json(authResponse);
  });
});

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.post('/api/transactions', (request, response, next) => {
  let account_id = request.body.account_id;
  console.log(request.body.access_token)
  // Pull transactions for the Item for the last 5 years
  var startDate = moment().subtract(5, 'years').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(request.body.access_token, startDate, endDate, {
    count: 250,
    offset: 0,
    account_ids: [account_id]
  }, (error, transactionsResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    } else {
      prettyPrintResponse(transactionsResponse);
      response.json(transactionsResponse);
    }
  });
});

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/api/identity', (request, response, next) => {
  client.getIdentity(ACCESS_TOKEN, (error, identityResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(identityResponse);
    response.json({identity: identityResponse.accounts});
  });
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/api/balance', (request, response, next) => {
  client.getBalance(ACCESS_TOKEN, (error, balanceResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(balanceResponse);
    response.json(balanceResponse);
  });
});


// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get('/api/holdings', (request, response, next) => {
  client.getHoldings(ACCESS_TOKEN, (error, holdingsResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(holdingsResponse);
    response.json({error: null, holdings: holdingsResponse});
  });
});

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
app.get('/api/investment_transactions', (request, response, next) => {
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate, (error, investmentTransactionsResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(investmentTransactionsResponse);
    response.json({error: null, investment_transactions: investmentTransactionsResponse});
  });
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/api/assets', (request, response, next) => {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  var daysRequested = 10;

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  var options = {
    client_report_id: 'Custom Report ID #123',
    // webhook: 'https://your-domain.tld/plaid-webhook',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  };
  client.createAssetReport(
    [ACCESS_TOKEN],
    daysRequested,
    options,
    (error, assetReportCreateResponse) => {
      if (error !== null) {
        prettyPrintResponse(error);
        return response.json({
          error: error,
        });
      }
      prettyPrintResponse(assetReportCreateResponse);

      var assetReportToken = assetReportCreateResponse.asset_report_token;
      respondWithAssetReport(20, assetReportToken, client, response);
    });
});

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
app.get('/api/payment', (request, response, next) => {
  client.getPayment(PAYMENT_ID, (error, paymentGetResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error,
      });
    }
    prettyPrintResponse(paymentGetResponse);
    response.json({error: null, payment: paymentGetResponse});
  });
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/api/item', (request, response, next) => {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  client.getItem(ACCESS_TOKEN, (error, itemResponse) => {
    if (error !== null) {
      prettyPrintResponse(error);
      return response.json({
        error: error
      });
    }
    // Also pull information about the institution
    client.getInstitutionById(itemResponse.item.institution_id, (err, instRes) => {
      if (err !== null) {
        var msg = 'Unable to pull institution information from the Plaid API.';
        console.log(msg + '\n' + JSON.stringify(error));
        return response.json({
          error: msg
        });
      } else {
        prettyPrintResponse(itemResponse);
        response.json({
          item: itemResponse.item,
          institution: instRes.institution,
        });
      }
    });
  });
});

var server = app.listen(APP_PORT, () => {
  console.log('plaid-quickstart server listening on port ' + APP_PORT);
});

var prettyPrintResponse = response => {
  console.log(util.inspect(response, {colors: true, depth: 4}));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.
var respondWithAssetReport = (
  numRetriesRemaining,
  assetReportToken,
  client,
  response
) => {
  if (numRetriesRemaining === 0) {
    return response.json({
      error: 'Timed out when polling for Asset Report',
    });
  }

  var includeInsights = false;
  client.getAssetReport(
    assetReportToken,
    includeInsights,
    (error, assetReportGetResponse) => {
      if (error !== null) {
        prettyPrintResponse(error);
        if (error.error_code === 'PRODUCT_NOT_READY') {
          setTimeout(
            () => respondWithAssetReport(
              --numRetriesRemaining, assetReportToken, client, response),
            1000
          );
          return
        }

        return response.json({
          error: error,
        });
      }

      client.getAssetReportPdf(
        assetReportToken,
        (error, assetReportGetPdfResponse) => {
          if (error !== null) {
            return response.json({
              error: error,
            });
          }

          response.json({
            error: null,
            json: assetReportGetResponse.report,
            pdf: assetReportGetPdfResponse.buffer.toString('base64'),
          })
        }
      );
    }
  );
};

exports.app = functions.https.onRequest(app)
