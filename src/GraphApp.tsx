import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MetricsGraphics from 'react-metrics-graphics';
import './mggraphics.css';
import GithubCorner from 'react-github-corner';
import ContainerDimensions from 'react-container-dimensions';
import Button from 'react-bootstrap/Button';
import { RouteComponentProps } from 'react-router';
import axios from 'axios';

interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
}

interface MyState {
  tempData:Array<Array<{ 'date': Date; 'value': number; }>>;
  baselines:Array<{value:number, label:string}>;
};
class Graph extends Component<Props, MyState> {
  constructor(state:Props){
    super(state);

    this.state = {
      tempData:  [],
      baselines: []
    };
  }

  async componentDidMount(){
    var id= this.props.match.params.id;
    var result = await axios({
            method: 'GET',
            url: "https://jsonblob.com/api/jsonBlob/"+id,
            transformResponse:[(data) => {
                return JSON.parse(data, (key, value) => {
                    if (key === "date"){
                        return new Date(value);
                    }else{
                        return value;
                    }
                });
            }
            ]
        });
    this.setState({...this.state, tempData:result.data.tempData})
  }

  render() {
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
                    />
                  }
                </ContainerDimensions>
              </div>
              <div id="buttonContainer" className="row">
                <div id="buttons" className="col">
                  <Button style={{width:"250px", margin:"15px"}}>Share Graph</Button>
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

export default Graph;
