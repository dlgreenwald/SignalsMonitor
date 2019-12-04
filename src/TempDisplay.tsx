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
    name: string, 
    isAlarming:boolean;
    isAwknoledged:boolean;
    background:CardProps["bg"],
    text:CardProps["text"],
    probe:{ "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}};
  
  class TempDisplay extends Component<MyProps, MyState> {
    constructor(props:MyProps){
        super(props);

        this.state = {
            isAlarming:false,
            isAwknoledged:false,
            probe:props.probe,
            name:props.name,
            background:"light",
            text:"secondary"
        }
    }

    componentWillReceiveProps(nextProps:MyProps) {
        var temp:Number = Number(nextProps.probe.temp);
        var alarmHigh:Number = Number(nextProps.probe.alarmHigh);
        var alarmLow:Number = Number(nextProps.probe.alarmLow);

        var newBackground:CardProps["bg"] = 'light';
        var newText:CardProps["text"] = "secondary";
        var newIsAlarming = false;
        var newIsAwknowledged = this.state.isAwknoledged;

        if((alarmLow < temp) && (temp < alarmHigh)){
            newBackground = 'light';
            newText = 'secondary';
            newIsAwknowledged=false;
        }
        if((alarmLow > temp)){
            newBackground = "primary";
            newText = 'white';
            newIsAlarming = true;
        }
        if((temp > alarmHigh)){
            newBackground = "danger";
            newText="white";
            newIsAlarming = true;
        }
        console.log("Temp Details(Low:"+alarmLow+", Temp:"+temp+",  High:"+alarmHigh+")");
        console.log("Alarm State: "+newIsAlarming+" IsAwknowledged:"+newIsAwknowledged);
        this.setState({...this.state, name:nextProps.name, probe:nextProps.probe, background:newBackground, text:newText, isAlarming:newIsAlarming, isAwknoledged:newIsAwknowledged});  
      }

      awknowledgeAlarm(){
        this.setState({...this.state, isAwknoledged:true});
      }

    render() {
        return(
            <>
            <div className="row cardContainer">
                <Card className="col card" style={{cursor: 'pointer'}} text={this.state.text} bg={this.state.background} border="dark" onClick={this.awknowledgeAlarm.bind(this)}>
                    <Card.Title style={{textAlign:"center"}}>{this.state.name}</Card.Title>
                    <Card.Body style={{padding:0}}>
                    <Container fluid>
                        <Row style={{padding:0}}>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>MinAlarm</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.state.probe.alarmLow}</Row></Col></Row>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>MaxAlarm</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.state.probe.alarmHigh}</Row></Col></Row>
                            </Col>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{fontSize:"xx-large", writingMode:"vertical-lr", padding:0}}>{this.state.probe.temp}°</Row>
                            </Col>
                            <Col xs="4" style={{padding:0}}>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>Min</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.state.probe.min}</Row></Col></Row>
                                <Row style={{padding:0}}><Col><Row style={{fontSize:"xx-small", padding:0, margin:0}}>Max</Row><Row style={{fontSize:"large", padding:0, margin:0}}>{this.state.probe.max}</Row></Col></Row>
                            </Col>
                        </Row>
                    </Container>
                    <Sound url={alarmFile} playStatus={this.state.isAlarming&&!this.state.isAwknoledged?Sound.status.PLAYING:Sound.status.STOPPED} loop={true}/>
                    </Card.Body>
                </Card>
            </div>
            </>
        )
    }

  }

  export default TempDisplay;

