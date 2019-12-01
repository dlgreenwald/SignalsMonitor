import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MetricsGraphics from 'react-metrics-graphics';
import LoginModal from './LoginModal';
import {ThermoworksFirebase} from './ThermoworksFirebase';
import 'jquery';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import TempColumn from './TempColumn';
import './mggraphics.css';
import GithubCorner from 'react-github-corner';
import ContainerDimensions from 'react-container-dimensions';

interface MyProps {

};
interface MyState {
  firebase: ThermoworksFirebase
  tempData:Array<Array<{ 'date': Date; 'value': number; }>>;
  curTemps:Map<string, { 'date': Date; 'value': number; }>;
  probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
  showLogin:boolean;
};
class App extends Component<{}, MyState> {
  constructor(state:MyProps){
    super(state);

    this.state = {
      firebase: new ThermoworksFirebase(),
      tempData:  [],
      curTemps: new Map(),
      probeDetails: new Map(),
      showLogin:true
    };
  }

  async onLogin(username:string, password:string){
    this.state.firebase.setCredentials(username, password);
    this.state.firebase.setOnTempUpdate(this.onTempUpdate.bind(this));
    await this.state.firebase.init();
    this.setState({...this.state, showLogin:false})
  }

  onTempUpdate(){
    //Store most recent data as Map for display
    var newCurTemps:Map<string, { 'date': Date; 'value': number; }> = new Map();
    this.state.firebase.returnTempData().forEach((probe, key)=>{
      newCurTemps.set(key, probe[probe.length-1]);
    })

    //Store all data as Array of Arrays for graph
    var newTemps:Array<Array<{ 'date': Date; 'value': number; }>>=[];
    this.state.firebase.returnTempData().forEach((probe)=>{
      if(probe.length!==0){//the graph componant chokes if it's passed empty datasets.
        newTemps.push(probe);
      }
    })

    var newProbeDetails = this.state.firebase.returnProbeDetails();

    this.setState({...this.state, 
      tempData:newTemps, curTemps:newCurTemps, probeDetails:newProbeDetails
    });
  }

  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <GithubCorner href="https://github.com/dlgreenwald/SignalsMontior" direction="left" octoColor="#212529" bannerColor="grey" />
          <Container fluid >
          <Row>
            <Col xs="12" sm="9" md="9">
              <ContainerDimensions>
                { ({width, height}) => 
                  <MetricsGraphics
                  title="Temperature over Time"
                  data={ this.state.tempData }
                  full_width="true"
                  height={600}
                  x_accessor="date"
                  y_accessor="value"
                  right="40"
                  area="false"
                  brush="xy"
                />
                }
              </ContainerDimensions>
              <LoginModal show={this.state.showLogin} onLogin={this.onLogin.bind(this) }/>
            </Col>
            <Col xs="auto">
                <TempColumn curTemps={this.state.curTemps} probeDetails={this.state.probeDetails}/>
            </Col>
          </Row>
          </Container>

          

        </header>
      </div>
    );
  }

}

export default App;
