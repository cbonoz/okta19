import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react'
import Header from './Header';

class Guides extends Component {
    constructor(props) {
        super(props);
        this.state = { authenticated: null, guides: [] };
        this.checkAuthentication = this.checkAuthentication.bind(this);
      }
    
      async checkAuthentication() {
        const authenticated = await this.props.auth.isAuthenticated();
        if (authenticated !== this.state.authenticated) {
          this.setState({ authenticated });
        }
        
      }
   
      async componentDidMount() {
        this.checkAuthentication();
      }
    
      async componentDidUpdate() {
        this.checkAuthentication();
      }
    
    render() {
        const { authenticated } = this.state
        return (
            <div>
                <Header/>
                {authenticated && <h1>authenticated</h1>}                
            </div>
        );
    }
}

export default withAuth(Guides);