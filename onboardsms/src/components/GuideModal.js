import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { parse, format } from "date-fns";
const MAIN_PHONE = "444-444-4444";

class GuideModal extends React.Component {
  render() {
    const { currentGuide, onHide, show } = this.props;
    let formattedDate;
    if (currentGuide) {
      formattedDate = format(
        parse(currentGuide.createdAt * 1000),
        "MM/dd/yyyy"
      );
    }

    return (
      <Modal
        show={show}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {currentGuide.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Guide: {currentGuide.name}</h4>
          <p>Author: {currentGuide.author}</p>
          {currentGuide.description && <p>{currentGuide.description}</p>}
          {formattedDate && <p>Created: {formattedDate}</p>}
          <p>
            Text '{currentGuide.name}' to {MAIN_PHONE}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default GuideModal;
