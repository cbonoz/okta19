import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react'

class Protected extends Component {
    constructor(props) {
        super(props);
        this.state = { authenticated: null };
        this.checkAuthentication = this.checkAuthentication.bind(this);
      }
    
      async checkAuthentication() {
        const authenticated = await this.props.auth.isAuthenticated();
        if (authenticated !== this.state.authenticated) {
          this.setState({ authenticated });
        }
        if (!authenticated) {
            window.location.pathname = "/"
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
                
            </div>
        );
    }
}

export default withAuth(Protected);