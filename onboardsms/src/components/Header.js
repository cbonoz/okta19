import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = { authenticated: null };
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
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


    async login() {
        this.props.auth.login('/');
    }

    async logout() {
        this.props.auth.logout('/');
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

export default withAuth(Header);