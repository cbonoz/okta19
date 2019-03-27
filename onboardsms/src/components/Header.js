
import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap'
import logo from '../assets/onboard_simple.png'

class Header extends Component {
  render() {
    const { authenticated, login, logout } = this.props
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
                <Nav.Link href="#" onClick={login}>Login</Nav.Link>
                <Nav.Link href="/create" onClick={logout}>Logout</Nav.Link>

                <Navbar.Text pullRight>
                  Signed in as: <a href="#login">Mark Otto</a>
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