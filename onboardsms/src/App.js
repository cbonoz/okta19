import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import Home from './components/Home';
import Header from './components/Header'
import Protected from './components/Protected';
import { withAuth } from '@okta/okta-react'
import Guides from './components/Guides';

const yourOktaDomain = process.env.REACT_APP_OKTA_DOMAIN 
const clientId = process.env.REACT_APP_CLIENT_ID

class App extends Component {

  render() {
    return (
      <div>
      <Router>
        <Security issuer={`${yourOktaDomain}/oauth2/default`}
                  client_id={`${clientId}`}
                  redirect_uri={window.location.origin + '/implicit/callback'} >
          <Route path='/' exact={true} component={Home}/>
          <SecureRoute path='/create' component={Protected}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
          <Route path='/guides' component={Guides} />
        </Security>
      </Router>
      </div>
    );
  }
}

export default withAuth(App)