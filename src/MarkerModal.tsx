import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

interface MyProps {
  date:Date,
  onSave: (date:Date, annotation:string) => any;
  onClose: () => any;
  show:boolean;
};
interface MyState {
  annotationText:string;
  textEntered:boolean;
};

class MarkerModal extends Component<MyProps, MyState> {

  constructor(props: MyProps) {

    super(props);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      textEntered:false,
      annotationText: ""
    };
  }

  handleClose() {
    this.props.onClose();
  }

  handleShow() {
  }

  handleChange(event: React.FormEvent) {
    let target = (event.target as HTMLInputElement);
    let newState =  { ...this.state, [target.name]: target.value };

    if(newState.annotationText!==""){
      newState = {...newState, textEntered:true};
    }
    this.setState(newState);
  }

  handleSubmit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.props.onSave(this.props.date, this.state.annotationText);
    
  }

  render() {
    return (
      <>
        <Modal show={this.props.show} onHide={this.handleClose}>
          <Form onSubmit={this.handleSubmit}>
            <Modal.Header>
              <Modal.Title>Annotation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="annotationText">
                <Form.Label>Annotation Text</Form.Label>
                <Form.Control name="annotationText" value={this.state.annotationText} placeholder="Please enter text" onChange={this.handleChange} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer><Button variant="primary" onClick={this.handleClose}>
              Close
                  </Button>

              <Button type="submit" variant="primary" disabled={!this.state.textEntered}>
                Save
          </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    );
  };
}
export default MarkerModal;