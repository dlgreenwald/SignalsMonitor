import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

interface MyProps {
  url: string,
  onShare: () => any;
};
interface MyState {
  show: boolean;
};

class ShareModal extends Component<MyProps, MyState> {

  constructor(props: MyProps) {

    super(props);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      show: false
    };
  }

  componentWillReceiveProps(nextProps: MyProps) {
    this.setState({ ...this.state });
  }

  handleClose() {
    this.setState({ ...this.state, show: false });
  }

  handleShow() {
    this.props.onShare();
    this.setState({ ...this.state, show: true });
  }

  handleChange(event: React.FormEvent) {
    let target = (event.target as HTMLInputElement);
    this.setState({ ...this.state, [target.name]: target.value });
  }

  render() {
    return (
      <>
        <Button style={{width:"250px", margin:"15px"}} variant="primary" onClick={this.handleShow}>
          Share Graph
              </Button>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Login with Thermoworks Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>URL</Form.Label>
                <Form.Control name="URL" type="email" value={this.props.url} disabled />
                <Form.Text className="text-muted">
                  Share this URL to share the current graph.  The link will be good for 150 days.
                    </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleClose}>
              Close
                  </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
}
export default ShareModal;