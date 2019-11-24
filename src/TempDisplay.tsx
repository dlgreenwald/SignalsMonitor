import React, { Component } from 'react';
import './App.css';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'



interface MyProps {name: string, probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}};
interface MyState {name: string, probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}};
  
  class TempDisplay extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state = {
            probe:props.probe,
            name:props.name
        }
    }

    componentWillReceiveProps(nextProps:MyProps) {
        this.setState(nextProps);  
      }


    render() {
        return(
            <>
            <Card className="m-2" style={{flex: 1}} text="secondary">
                <Card.Title>{this.state.name}</Card.Title>
                <Card.Body>
                    <Row>
                        <Col>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>MinAlarm</Row><Row>{this.state.probe.alarmLow}</Row></Col></Row>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>MaxAlarm</Row><Row>{this.state.probe.alarmHigh}</Row></Col></Row>
                        </Col>
                        <Col>
                            <Row style={{fontSize:"xxx-large", writingMode:"vertical-lr"}}>{this.state.probe.temp}°</Row>
                        </Col>
                        <Col>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>Min</Row><Row>{this.state.probe.min}</Row></Col></Row>
                            <Row><Col><Row style={{fontSize:"xx-small"}}>Max</Row><Row>{this.state.probe.max}</Row></Col></Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            </>
        )
    }

  }

  export default TempDisplay;

