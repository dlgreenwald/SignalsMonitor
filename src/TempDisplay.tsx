import React, { Component } from 'react';
import './App.css';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import {CardProps} from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Sound from 'react-sound'
import alarmFile from './beeps.mp3'

interface MyProps {
    name: string, 
    probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string},
};
interface MyState {
    isAwknoledged:boolean;
}
  
  class TempDisplay extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state = {
            isAwknoledged:false
        }
    }

    static getDerivedStateFromProps(props:MyProps, state:MyState){
        if(state.isAwknoledged && (props.probe.alarmLow < props.probe.temp) && (props.probe.temp < props.probe.alarmHigh)){
           return {isAwknoledged:false};
        }
    }

    awknowledgeAlarm(){
        this.setState({...this.state, isAwknoledged:true});
    }

    render() {
        var temp:Number = Number(this.props.probe.temp);
        var alarmHigh:Number = Number(this.props.probe.alarmHigh);
        var alarmLow:Number = Number(this.props.probe.alarmLow);

        var Background:CardProps["bg"] = 'light';
        var Text:CardProps["text"] = "secondary";
        var IsAlarming = false;

        if((alarmLow < temp) && (temp < alarmHigh)){
            Background = 'light';
            Text = 'secondary';
        }
        if((alarmLow > temp)){
            Background = "primary";
            Text = 'white';
            IsAlarming = true;
        }
        if((temp > alarmHigh)){
            Background = "danger";
            Text="white";
            IsAlarming = true;
        }

        return(
            <>
            <div className="row cardContainer">
                <Card className="col card" style={{cursor: 'pointer'}} text={Text} bg={Background} border="dark" onClick={this.awknowledgeAlarm.bind(this)}>
                    <Card.Title style={{textAlign:"center"}}>{this.props.name}</Card.Title>
                    <Card.Body style={{padding:0}}>
                    <Container fluid>
                        <Row style={{padding:0}}>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>MinAlarm</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.props.probe.alarmLow}</Row></Col></Row>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>MaxAlarm</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.props.probe.alarmHigh}</Row></Col></Row>
                            </Col>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{fontSize:"xx-large", writingMode:"vertical-lr", padding:0}}>{this.props.probe.temp}°</Row>
                            </Col>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>Min</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.props.probe.min}</Row></Col></Row>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>Max</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.props.probe.max}</Row></Col></Row>
                            </Col>
                        </Row>
                    </Container>
                    <Sound url={alarmFile} playStatus={IsAlarming&&!this.state.isAwknoledged?Sound.status.PLAYING:Sound.status.STOPPED} loop={true}/>
                    </Card.Body>
                </Card>
            </div>
            </>
        )
    }

  }

  export default TempDisplay;

