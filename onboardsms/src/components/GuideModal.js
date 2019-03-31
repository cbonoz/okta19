import React, { Component } from "react"
import { Modal, Button } from "react-bootstrap"
import { parse, format } from "date-fns"

const MAIN_PHONE = process.env.REACT_APP_PHONE

class GuideModal extends React.Component {
  render() {
    const { currentGuide, onHide, show } = this.props
    let formattedDate
    if (currentGuide) {
      const parsed = parse(currentGuide.createdAt * 1000)
      formattedDate = format(parsed,'MM/DD/YYYY hh:mm a')
    }

    return (
      <Modal show={show} 
      onHide={onHide}
      size="lg" aria-labelledby="contained-modal-title-vcenter"centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          Guide: {currentGuide.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><b>Author</b>: {currentGuide.author}</p>
          {currentGuide.description && <p><b>Description</b>: {currentGuide.description}</p>}
          {formattedDate && <p><b>Created</b>: {formattedDate}</p>}
          <p className='text-action'>Text '{currentGuide.name}' to {MAIN_PHONE}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default GuideModal
