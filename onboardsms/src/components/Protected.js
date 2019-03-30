import React, { Component } from 'react'
import { withAuth } from '@okta/okta-react'
import { Row, Col, ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import Header from './Header'
import NotificationSystem from 'react-notification-system'
import { parse, format } from 'date-fns'
import api from '../api'

class Protected extends Component {

  state = { 
    authenticated: null, 
    currentUser: null, 
    currentGuide: null,
    guides: [] 
  }

  constructor(props) {
    super(props)
    this.notificationSystem = React.createRef()
    this.checkAuthentication = this.checkAuthentication.bind(this)
    this.createNotification = this.createNotification.bind(this)
  }

  async checkAuthentication(fetchGuides) {
    const authenticated = await this.props.auth.isAuthenticated()
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated })
    }
    if (!authenticated) {
      // window.location.pathname = "/"
      // return
    }

    if (fetchGuides) {

      try {
        const currentUser = await this.props.auth.getUser()
        console.log('currentUser', JSON.stringify(currentUser))
        this.setState({ currentUser })
        this.getGuidesForUser(currentUser)
      } catch (e) {
        console.error('error getting user', e)
      }
    }
  }


  createNotification(message, level, position) {
    const notification = this.notificationSystem.current
    notification.addNotification({ message, level, position: position || 'br' })
  }

  async login() {
    this.props.auth.login('/')
  }

  async logout() {
    this.props.auth.logout('/')
    this.createNotification('Logged Out!', 'success')
  }

  async componentDidMount() {
    this.checkAuthentication(true)
  }

  async createGuide(guide) {
    try {
      const createdGuide = await api.createGuide(guide)
    } catch (e) {
      console.error(e)
    }
  }

  async getGuidesForUser(currentUser) {
    try {
      const author = currentUser.name
      const guides = await api.getGuidesByAuthor(author)
      this.setState({ guides })
    } catch (e) {
      console.error(e)
    }
  }

  clearGuide() {
    this.setState({currentGuide: null})
  }

  submitGuide() {
    const { currentGuide } = this.state
    const createdGuide = this.createGuide(currentGuide)
    if (createdGuide) {
      this.createNotification('Created Guide', 'success')
      this.clearGuide()
    }
  }

  async componentDidUpdate() {
    this.checkAuthentication()
  }

  render() {
    const { authenticated, guides } = this.state
    const { auth } = this.props
    return (
      <div>
        <Header authenticated={authenticated} auth={auth} login={() => this.login()} logout={() => this.logout()} />
        <Row className='create-section gradient-background'>
          {/* Existing Guide Section */}
          <Col xs={12} md={6}>
            {/* <div className='centered'>
              <h2 className='centered create-header'>My Guides</h2>
            </div> */}

            <ListGroupItem>Header</ListGroupItem>
            <ListGroupItem>

            {guides.map((guide) => {
              const formattedDate = format(parse(guide.createdAt * 1000), 'MM/dd/yyyy')
              return <div className='guide-item'>
                <div onClick={(g) => this.deleteGuide(g)}></div>
                <h3>Name: {guide.name}</h3>
                <p>Created: {formattedDate}</p>
              </div>
            })}
            </ListGroupItem>
          </Col>

          {/* Create Guide Section */}
          <Col xs={12} md={6}>
            {/* <div className='centered'>
              <h2 className='centered create-header'>Create Guide</h2>
            </div> */}

            <ListGroupItem bsStyle='info'>Header</ListGroupItem>
            <ListGroupItem>
              <Button onClick={() => this.submitGuide()} bsStyle='success'>Create</Button>
              <Button onClick={() => this.clearGuide()} bsStyle='danger'>Cancel</Button>
            </ListGroupItem>

          </Col>
        </Row>
        <NotificationSystem ref={this.notificationSystem} />
      </div>
    )
  }
}

export default withAuth(Protected)