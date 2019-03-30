
import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap'
import logo from '../assets/onboard_simple.png'
import helper from '../helper'

class Header extends Component {

  state = {
    currentUser: null
  }

  async componentDidUpdate() {
    const { authenticated, auth } = this.props
    let { currentUser } = this.state
    if (authenticated && auth && !currentUser) {
      currentUser = await auth.getUser()
      this.setState({currentUser: helper.getEnrichedUser(currentUser)})
    }
  }

  render() {
    const { authenticated, login, logout } = this.props
    const { currentUser } = this.state
    return (
      <div>
        <Navbar bg="light" variant="light" sticky="top">
          <Navbar.Brand href="/" >
            <img
              alt="Onboard SMS"
              src={logo}
              width="120"
              height="30"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Toggle />

          <Nav.Link href="/guides">Guides</Nav.Link>
          {login && <div>
            {authenticated ? <div>
              <Navbar.Collapse className="justify-content-end">
                <Nav.Link href="/create">Create New Guide</Nav.Link>
                <Nav.Link href="#" onClick={logout}>Logout</Nav.Link>

                <Navbar.Text pullRight>
                  Signed in as: <a href="#login">{currentUser && currentUser.user_name}</a>
                </Navbar.Text>
              </Navbar.Collapse>
            </div> :
              <div pullRight>
                <Navbar.Collapse className="justify-content-end">
                  <Nav.Link href="#" onClick={login}>Login</Nav.Link>
                </Navbar.Collapse>
              </div>}
          </div>}
        </Navbar>
      </div>
    )
  }
}

export default Header