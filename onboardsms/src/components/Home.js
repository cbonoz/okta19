import React, { Component } from 'react';
import ReactRotatingText from 'react-rotating-text'
import NotificationSystem from 'react-notification-system';

import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { withAuth } from '@okta/okta-react'

import full_logo from './../assets/onboard_trans.png'
import Header from './Header';

const ROTATOR_WORDS = [
    'Emergencies',
    'Company Onboarding',
    'Tutorials',
    'Everything',
]
export default withAuth(class Home extends Component {
    
    constructor(props) {
      super(props);
      this.state = { authenticated: null };
      this.notificationSystem = React.createRef()
      this.checkAuthentication = this.checkAuthentication.bind(this);
      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
      this.createNotification = this.createNotification.bind(this)
    }
  
    async checkAuthentication() {
      const authenticated = await this.props.auth.isAuthenticated();
      if (authenticated !== this.state.authenticated) {
        this.setState({ authenticated });
      }
    }

    createNotification(message, level, position) {
        const notification = this.notificationSystem.current;
        notification.addNotification({message, level, position: position || 'br'});
    }
  
    async login() {
      this.props.auth.login('/');
    }
  
    async logout() {
      this.props.auth.logout('/');
      this.createNotification('Logged Out!', 'success')
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
            <div className="home-content">
                <Header authenticated={authenticated} login={() => this.login()} logout={() => this.logout()}/>
                <div className="center home-hero">
                    <img src={full_logo} alt="Onboard SMS logo" className="clear banner-image" />
                    <br />
                    <span className="header-font clear">
                        Text Message based Guides for
                        <br /><span className="rotating-text">
                            <ReactRotatingText
                                items={ROTATOR_WORDS}
                                typingInterval={100}
                                color={'#fff'}/>
                        </span>
                    </span>
                    <div className='centered'>
                        <Link to="/guides"><Button className="login-button btn-success">Discover Guides</Button></Link>
                    </div>
                </div>
                <NotificationSystem ref={this.notificationSystem} />
            </div>);
    }
  });
