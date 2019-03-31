import React, { Component } from 'react'
import { withAuth } from '@okta/okta-react'
import Header from './Header'
import SearchInput, { createFilter } from 'react-search-input'
import api from '../api'
import StackGrid, { transitions } from "react-stack-grid"
import NotificationSystem from 'react-notification-system'
import { parse, format } from 'date-fns'
import GuideModal from './GuideModal';
const { scaleDown } = transitions
const KEYS_TO_FILTERS = ['name', 'author', 'description']

class Guides extends Component {

  state = {
    modalShow: false,
    authenticated: null, 
    guides: [], 
    searchTerm: '',
    currentGuide: {}
  }

  constructor(props) {
    super(props)
    this.notificationSystem = React.createRef()
    this.checkAuthentication = this.checkAuthentication.bind(this)
    this.searchUpdated = this.searchUpdated.bind(this)
    this.createNotification = this.createNotification.bind(this)
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated()
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated })
    }

  }

  createNotification(message, level, position) {
    const notification = this.notificationSystem.current
    notification.addNotification({ message, level, position: position || 'br' })
  }

  async componentDidMount() {
    this.checkAuthentication()
    this.getGuides()
  }

  selectGuide(currentGuide) {
    console.log('selected', currentGuide)
    this.setState({currentGuide, modalShow: true})
  }

  async getGuides() {
    try {
      const response = await api.getGuides()
      const guides = response.data
      console.log('guides', guides)
      this.setState({ guides })
    } catch (e) {
      console.error(e)
    }
  }
  async login() {
    this.props.auth.login('/')
  }

  async logout() {
    this.props.auth.logout('/')
    this.createNotification('Logged Out!', 'success')
  }

  async componentDidUpdate() {
    this.checkAuthentication()
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term })
  }

  render() {
    const { authenticated, currentGuide, guides, modalShow } = this.state
    const { auth } = this.props

    const filteredGuides = guides.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))

    const modalClose = () => this.setState({ modalShow: false });

    return (
      <div>
        <Header authenticated={authenticated} auth={auth} login={() => this.login()} logout={() => this.logout()} />
        <div className='guide-section gradient-background'>
          <div className='guide-search'>
            <SearchInput className="search-input" onChange={this.searchUpdated} fuzzy={true} sortResults={true} />
          </div>
          <hr />
          <div className='guide-results'>
            <StackGrid
              appear={scaleDown.appear}
              appeared={scaleDown.appeared}
              enter={scaleDown.enter}
              entered={scaleDown.entered}
              columnWidth={250}
              leaved={scaleDown.leaved}>

              {filteredGuides.map((guide, i) => {
                const formattedDate = format(parse(guide.createdAt * 1000), 'MM/dd/yyyy')
                return <div key={i}
                className='guide-item' onClick={() => this.selectGuide(guide)}>
                  <p>Guide: <br/><b>{guide.name.substr(0, Math.min(guide.name.length, 20))}</b></p>
                  <hr/>
                  <p>{guide.description}</p>
                  {/* <p>Created: {formattedDate}</p> */}
                </div>
              })}
            </StackGrid>
          </div>
          <GuideModal
            show={modalShow}
            onHide={modalClose}
            currentGuide={currentGuide}
          />
          <NotificationSystem ref={this.notificationSystem} />
        </div>
      </div>
    )
  }
}

export default withAuth(Guides)