import React, { Component } from 'react'
import { withAuth } from '@okta/okta-react'
import { Row, Col, ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import Header from './Header'
import NotificationSystem from 'react-notification-system'
import { parse, format } from 'date-fns'
import Form from "react-jsonschema-form-bs4";
import helper from '../helper'
import api from '../api'

const schema = {
  title: "New Guide",
  type: "object",
  required: ["name", "description", "steps"],
  properties: {
    name: { type: "string", title: "Guide Name", default: "ex: CPR" },
    description: { type: "string", title: "Description", default: "ex: How to do CPR" },
    steps: {
      "type": "array",
      "title": "Enter the steps for your guide",
      "items": {
        "type": "string",
        "default": "Enter your step here!"
      }
    },
    
  }
}


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
    this.onSubmit = this.onSubmit.bind(this)
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
        let currentUser = await this.props.auth.getUser()
        currentUser = helper.getEnrichedUser(currentUser)
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
      const author = currentUser.user_name
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

  async deleteGuide(guide) {
    console.log('delete', guide.name)
    let response
    try {
      response = await api.deleteGuideByName(guide.name) 
      window.location.reload();
    } catch (e) {
      console.error('error deleting', e)
    }
  }

  async onSubmit({ formData }, e) {
    console.log("Data submitted: ", formData);
    const {currentUser} = this.state
    const currentGuide = {...formData, author: currentUser.user_name} 
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
      this.setState({guides: [...this.state.guides, createdGuide]})
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

    return (
      <div>
        <Header authenticated={authenticated} auth={auth} login={() => this.login()} logout={() => this.logout()} />
        <Row className='create-section gradient-background'>
          {/* Existing Guide Section */}
          <Col xs={12} md={6}>

            <ListGroupItem variant="info">Your Guides</ListGroupItem>
            {loaded && <ListGroupItem>
              {(!guides || guides.length == 0) && <div>
                <h5><b>Any guides you create will be visible here!</b></h5>
              </div>
              }
              {guides.map((guide, i) => {
                const formattedDate = format(parse(guide.createdAt * 1000), 'MM/dd/yyyy')
                return <div className='my-guide-item' key={i}>
                  <h3>{guide.name}</h3>
                  <p>Created: {formattedDate}</p>
                  <div onClick={() => this.deleteGuide(guide)} className='my-guide-item-delete'>
                    <i className="fa fa-trash" aria-hidden="true"/>
                  </div>
                </div>
              })}

            </ListGroupItem>
            }
          </Col>

          {/* Create Guide Section */}
          <Col xs={12} md={6}>

            <ListGroupItem variant="info">Create New Guide</ListGroupItem>
            <ListGroupItem>
              <Form schema={schema}
                // onChange={log("changed")}
                onSubmit={this.onSubmit}
                // onError={log("errors")} 
                />
                <br/>
                <p><i>Note each step can be a maximum of 160 characters.</i></p>
            </ListGroupItem>

          </Col>
        </Row>
        <NotificationSystem ref={this.notificationSystem} />
      </div>
    )
  }
}

export default withAuth(Protected)