import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import GithubCorner from 'react-github-corner';




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
		this.setState({...this.state, show: false });
	}

	handleShow() {
		this.setState({...this.state, show: true });
	}

  handleChange(event: React.FormEvent) {
    let target = (event.target as HTMLInputElement);
    this.setState({...this.state, [target.name]: target.value});
  }

  handleSubmit(event:React.FormEvent<HTMLFormElement>) {
    this.props.onLogin(this.state.username, this.state.password);
    this.setState({...this.state, show: false });
    event.preventDefault();
  }

  render() {
    return (
      <>
      <Button variant="primary" onClick={this.handleShow}>
        Get Started
      </Button>
      <Modal show={this.state.show}>
      <Form onSubmit={this.handleSubmit}>
        <Modal.Header>
          <Modal.Title>Login with Thermoworks Account</Modal.Title>
          <GithubCorner href="https://github.com/dlgreenwald/SignalsMontior" direction="right" size="60" octoColor="white" bannerColor="grey" />
        </Modal.Header>
        <Modal.Body>
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

        </Modal.Body>
        <Modal.Footer>

          <Button type="submit" variant="primary">
            Login
          </Button>
        </Modal.Footer>
        </Form>
      </Modal>
      </>
    );
  }

}

export default LoginModal;