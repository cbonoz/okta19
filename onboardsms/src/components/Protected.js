import React, { Component } from 'react'
import { withAuth } from '@okta/okta-react'
import { Row, Col, ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import Header from './Header'
import NotificationSystem from 'react-notification-system'
import { parse, format } from 'date-fns'
import Form from "react-jsonschema-form";

import api from '../api'

const schema = {
  title: "New Guide",
  type: "object",
  required: ["name", "description", "steps"],
  properties: {
    name: { type: "string", title: "Guide Name", default: "CPR" },
    description: { type: "string", title: "Description", default: "How to do CPR" },
    steps: {
      "type": "array",
      "title": "Enter Steps",
      "items": {
        "type": "string",
        "default": "Enter your step here!"
      }
    },
    
  }
};



class Protected extends Component {

  state = {
    authenticated: null,
    currentUser: null,
    currentGuide: {},
    guides: [],
    loaded: false
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

  async getGuidesForUser(currentUser) {
    try {
      const author = currentUser.name
      const response = await api.getGuidesByAuthor(author)
      const guides = response.data
      console.log('myGuides', guides)
      this.setState({ guides, loaded: true })
    } catch (e) {
      console.error(e)
    }
  }

  clearGuide() {
    this.setState({ currentGuide: {} })
  }

  async submitGuide() {
    const { currentGuide } = this.state
    let response
    try {
      response = await api.createGuide(currentGuide)
    } catch (e) {
      console.error('error creating guide', e)
      const errorMessage = `Couldn't create guide: ${e.response.data}`
      this.createNotification(errorMessage, 'error')
      return
    }
    const createdGuide = response.data
    if (createdGuide) {
      this.createNotification('Created Guide: ' + createdGuide.name, 'success')
      this.clearGuide()
    }
  }

  async componentDidUpdate() {
    this.checkAuthentication()
  }

  render() {
    const { authenticated, guides, loaded } = this.state
    const { auth } = this.props
    const log = (type) => console.log.bind(console, type);

    const onSubmit = ({ formData }, e) => {
      console.log("Data submitted: ", formData);
      this.setState({ currentGuide: formData })
    }

    return (
      <div>
        <Header authenticated={authenticated} auth={auth} login={() => this.login()} logout={() => this.logout()} />
        <Row className='create-section gradient-background'>
          {/* Existing Guide Section */}
          <Col xs={12} md={6}>

            <ListGroupItem variant="light">Your Guides</ListGroupItem>
            {loaded && <ListGroupItem>
              {(!guides || guides.length == 0) && <div>
                <h5><b>Any guides you create will be visible here!</b></h5>
              </div>
              }
              {guides.map((guide, i) => {
                const formattedDate = format(parse(guide.createdAt * 1000), 'MM/dd/yyyy')
                return <div className='guide-item' key={i}>
                  <div onClick={(g) => this.deleteGuide(g)}></div>
                  <h3>Name: {guide.name}</h3>
                  <p>Created: {formattedDate}</p>
                </div>
              })}

            </ListGroupItem>
            }
          </Col>

          {/* Create Guide Section */}
          <Col xs={12} md={6}>

            <ListGroupItem variant="success">Create New Guide</ListGroupItem>
            <ListGroupItem>
              <Form schema={schema}
                onChange={log("changed")}
                onSubmit={onSubmit}
                onError={log("errors")} />
            </ListGroupItem>

          </Col>
        </Row>
        <NotificationSystem ref={this.notificationSystem} />
      </div>
    )
  }
}

export default withAuth(Protected)