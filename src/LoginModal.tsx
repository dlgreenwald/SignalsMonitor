import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'




interface MyProps {
  onLogin:(username:string, password:string) => any;
};
interface MyState {
  show: boolean
  username: string
  password: string
};

class LoginModal extends Component<MyProps, MyState> {

  constructor(props:MyProps) {
		super(props);

		this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			show: true,
      username: '',
      password: ''
		};
  }

  handleClose() {
		this.setState({ show: false });
	}

	handleShow() {
		this.setState({ show: true });
	}

  handleChange(event: React.FormEvent) {
    let target = (event.target as HTMLInputElement);
    this.setState({...this.state, [target.name]: target.value});
  }

  async handleSubmit(event: React.MouseEvent) {
    this.props.onLogin(this.state.username, this.state.password);
  }

  render() {
    return (
      <>
      <Button variant="primary" onClick={this.handleShow}>
        Get Started
      </Button>
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Login with Thermoworks Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control name="username" type="email" value={this.state.username} placeholder="Enter email" onChange={this.handleChange}/>
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" value={this.state.password} placeholder="Password" onChange={this.handleChange}/>
          </Form.Group>

          <Button variant="primary" onClick={this.handleSubmit}>
            Submit
          </Button>

        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    );
  }

}

export default LoginModal;