import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MetricsGraphics from 'react-metrics-graphics';
import LoginModal from './LoginModal';
import ShareModal from './ShareModal';
import {ThermoworksFirebase} from './ThermoworksFirebase';
import TempColumn from './TempColumn';
import './mggraphics.css';
import GithubCorner from 'react-github-corner';
import ContainerDimensions from 'react-container-dimensions';
import Button from 'react-bootstrap/Button';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { RouteComponentProps } from 'react-router';
import Graph from './GraphApp';

interface MatchParams {
}

interface Props extends RouteComponentProps<MatchParams> {
}


interface MyState {
  firebase: ThermoworksFirebase
  tempData:Array<Array<{ 'date': Date; 'value': number; }>>;
  curTemps:Map<string, { 'date': Date; 'value': number; }>;
  probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
  showLogin:boolean;
  baselines:Array<{value:number, label:string}>;
  shareURL:string;
};
class App extends Component<Props, MyState> {
  constructor(state:Props){
    super(state);

    this.state = {
      firebase: new ThermoworksFirebase(),
      tempData:  [],
      baselines: [],
      curTemps: new Map(),
      probeDetails: new Map(),
      showLogin:true,
      shareURL:""
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

    var newBaselines:Array<{value:number, label:string}> =  [];
    this.state.firebase.returnProbeDetails().forEach((value, key) => {
      newBaselines.push({value:Number(value.alarmHigh), label:key+" High"});
      if(value.alarmLow!=="32"){
        newBaselines.push({value:Number(value.alarmLow), label:key+" Low"})
      }
    })

    this.setState({...this.state, 
      tempData:newTemps, curTemps:newCurTemps, probeDetails:newProbeDetails, baselines:newBaselines
    });
  }

  async exportXLSX(){
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    //create book
    var wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "ThermoWorks Temperature Log"
    }

    this.state.firebase.returnTempData().forEach((value, key) => {
      if(value.length!==0){
        var sheetname = key.replace(':','-'); //xlsx silently fails once there are colons in the sheet name
        wb.SheetNames.push(sheetname);
        wb.Sheets[sheetname] = XLSX.utils.json_to_sheet(value);
      }
      
    })

    //write the book out and stream it to the browser as a file
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'array'});
    const data = new Blob([wbout], {type: fileType});
    FileSaver.saveAs(data, "Temps" + fileExtension);
  }

  async exportURL(){
    var response = await axios.post("https://jsonblob.com/api/jsonBlob", JSON.stringify({tempData:this.state.tempData, baselines:this.state.baselines}), {headers:{'Content-Type': 'application/json', 'Accept':'application/json'}});
    this.setState({...this.state, shareURL:"https://www.dlgreen.com/SignalsMonitor?id="+response.headers["x-jsonblob"]})
    console.log(response.headers["x-jsonblob"]);
  }

  render() {
    //If we have a url parameter ID we are showing a shared link
    let search = new URLSearchParams(this.props.location.search);
    if(search.get("id")!== null){
      return <Graph history={this.props.history} location={this.props.location} match={this.props.match}  />
    }

    return (
      <div id="App" style={{padding:0, margin:15}} className="row">
        <GithubCorner href="https://github.com/dlgreenwald/SignalsMontior" direction="left" octoColor="#212529" bannerColor="grey" />
        <div id="container"  style={{marginTop:45}} className="col">
          <div id="headerContainer" className="row">
            <div id="header">
              Better Thermoworks Monitor
            </div>
          </div>
          <div id="body" className="row">
            <div id="irbe">
              <div id="graphContainer" className="row">
                <ContainerDimensions>
                  {({ width, height }) =>
                    <MetricsGraphics
                      data={this.state.tempData}
                      width={width}
                      height={600}
                      x_accessor="date"
                      y_accessor="value"
                      right="40"
                      area="false"
                      brush="xy"
                      baselines={this.state.baselines}
                    />
                  }
                </ContainerDimensions>
              </div>
              <TempColumn curTemps={this.state.curTemps} probeDetails={this.state.probeDetails} />
              <div id="buttonContainer" className="row">
                <div id="buttons" className="col">
                  <LoginModal show={this.state.showLogin} onLogin={this.onLogin.bind(this)} />
                  <Button style={{width:"250px", margin:"15px"}} onClick={this.exportXLSX.bind(this)}>Download *.xlsx</Button>
                  <ShareModal url={this.state.shareURL} onShare={this.exportURL.bind(this)}/>
                </div>
              </div>
            </div>
          </div>  
          <div id="footer" className="row">
            <div id="footerContainer" className="col">
              
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default App;
