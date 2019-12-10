import * as firebase from 'firebase/app';
import "firebase/database";
import "firebase/auth";

interface ISignalsDevice {
  deviceID:string;
  dateAdded:string;
  deviceName:string;
  fan:string;
  probe1Name:string;
  probe2Name:string;
  probe3Name:string;
  probe4Name:string;
  wifiOnly:string;
}

interface ISmokeDevice {
  device:string;
  added:string;
  name:string;
  serial:string;
}

interface ISignalsTempRecord{
  p1:string,
  p2:string,
  p3:string,
  p4:string,
  time:string
}

interface ISmokeTempRecord{
  probe1:string,
  probe2:string,
  time:string
}

interface ISignalsDeviceDetails{
  alarmSounding:{p1H:string, p1L:string, p2H:string, p2L:string, p3H:string, p3L:string, p4H:string, p4L:string},
  alarmSwitch:{p1Switch:string, p2Switch:string, p3Switch:string, p4Switch:string},
  alarms:{p1H:string, p1L:string, p2H:string, p2L:string, p3H:string, p3L:string, p4H:string, p4L:string},
  calibration:{p1:string, p2:string, p3:string, p4:string},
  data:{battery:string, firmware:string, wifi:string},
  fan:{alarm:string, connection:string, setTemp:string},
  maxmin:{p1Max:string, p1Min:string, p2Max:string, p2Min:string, p3Max:string, p3Min:string, p4Max:string, p4Min:string},
  migrated:boolean,
  muted: {p1:string, p2:string, p3:string, p4:string},
  names: {device:string, p1:string, p2:string, p3:string, p4:string},
  resetmaxmin:{p1:string, p2:string, p3:string, p4:string},
  rings:{p1:string, p2:string, p3:string, p4:string},
  rssi:{lastupdate:string, level:string},
  tempunit:{unit:string}
}

interface ISmokeDeviceDetails{
    alarms:{ alarm1High:boolean, alarm1Low:boolean, alarm2High:boolean, alarm2Low:boolean, probe1H:string, probe1L:string, probe2H:string, probe2L:string},
    data:{battery:number,firmware:string,wifi:number},
    hidden:{probe1:boolean, probe2:boolean, showMaxMinP1:boolean, showMaxMinP2:true},
    minMax:{probe1Max:string, probe1Min:string, probe2Max:string, probe2Min:string},
    notification:{trigger1H:boolean, trigger1L:boolean, trigger2H:boolean, trigger2L:boolean, triggerLoss:boolean},
    probeNames:{probe1:string, probe2:string},
    unit:{probe1:string,probe2:string},
    update:{canUpdate:boolean,time:number}
}

export class ThermoworksFirebase {
  fbInstance: firebase.app.App;
  username: string;
  password: string;
  uid: string;
  signalDevices: Map<String, ISignalsDevice>;
  smokeDevices: Map<String, ISmokeDevice>;
  tempData:Map<string, Array<{ 'date': Date; 'value': number; }>>;
  probeState:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
  signalsDeviceDetails:Map<String, ISignalsDeviceDetails>;
  smokeDeviceDetails:Map<String, ISmokeDeviceDetails>;
  onDataUpdate?:() => any;

  constructor() {
    //these were mined from the android APK... hopefully they don't mind too much
    this.fbInstance = firebase.initializeApp({
      apiKey: 'AIzaSyCfCUKlG5-VPsqta-9M92XBSFLHYsbSqLk',
      authDomain: 'smoke-cloud.firebaseapp.com',
      databaseURL: 'https://smoke-cloud.firebaseio.com',
      projectId: 'smoke-cloud',
      storageBucket: 'smoke-cloud.appspot.com',
      messagingSenderId: '74663406178'
    });

    this.username = '';
    this.password = '';
    this.uid = '';
    this.signalDevices = new Map();
    this.smokeDevices = new Map();
    this.tempData = new Map();
    this.onDataUpdate = undefined;
    this.probeState = new Map();
    this.signalsDeviceDetails = new Map();
    this.smokeDeviceDetails = new Map();
  }

  setCredentials(username:string, password:string){
    this.username = username;
    this.password = password;
  }

  async init(){
    this.uid = '';
    this.signalDevices = new Map();
    await this.fbInstance.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error) {
      // Handle Errors here.  @TODO probably need a better way of handling errors with a callback.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });
    this.uid = this.fbInstance.auth().currentUser!.uid;

    //we have to wait for this to come back once to finish init, but we also need to subscribe to changes.
    //init signals devices
    let signalsDevicesQuery = await this.fbInstance.database().ref().child("users").child(this.uid).child("devices").child("signals").once("value");
  
    for (let device in signalsDevicesQuery.toJSON()){
      console.log(signalsDevicesQuery.val()[device]);
      let devObj = signalsDevicesQuery.val()[device] as ISignalsDevice;

      this.signalDevices.set(devObj.deviceName,devObj);
      //init empty temp data
      this.tempData.set(devObj.deviceName+":"+devObj.probe1Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe2Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe3Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe4Name, [])

      //get older data once at startup in case it exists
      let temps = await this.fbInstance.database().ref().child("SignalTemps").child(devObj.deviceID).limitToLast(300).once("value");
      this.addSignalsTempData(devObj.deviceName, temps);
      //subscribe to update events on each device
      this.signalsStart(devObj);
    }

    let smokeDevicesQuery = await this.fbInstance.database().ref().child("users").child(this.uid).child("devices").child("smoke").once("value");

    for (let device in smokeDevicesQuery.toJSON()){
      console.log(smokeDevicesQuery.val()[device]);
      let devObj = smokeDevicesQuery.val()[device] as ISmokeDevice;
      this.smokeDevices.set(devObj.name,devObj);
      //init empty temp data
      this.tempData.set(devObj.name+":Probe 1", [])
      this.tempData.set(devObj.name+":Probe 2", [])

      //get older data once at startup in case it exists
      let temps = await this.fbInstance.database().ref().child("smokeTemp").child(devObj.device).limitToLast(300).once("value");
      this.addSignalsTempData(devObj.name, temps);

      //subscribe to update events on each device
      this.smokeStart(devObj);
    }
  }

  //Returns temp data for all probes on both smoke and signals devices
  returnTempData(): Map<string, Array<{ 'date': Date; 'value': number; }>>{
    return this.tempData;
  }

 //@TODO make this return type a interface that is imported (or exported)
  returnProbeDetails(): Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>{
    return this.probeState; 
  }

  setOnTempUpdate(onDataUpdate:() => any){
    this.onDataUpdate = onDataUpdate;
  }


  //This starts a ongoing query with firebase for updates on a sepcific signal device
  signalsStart(device: ISignalsDevice){
    this.fbInstance.database().ref().child("SignalTemps").child(device.deviceID).limitToLast(1).on("value", (snapshot_ => this.addSignalsTempData(device.deviceName, snapshot_)));
    this.fbInstance.database().ref().child("signals").child(device.deviceID).limitToLast(20).on("value", (snapshot_ => this.addSignalsData(device.deviceName, snapshot_)));
  }
  
  //This starts a ongoing query with firebase for updates on a sepcific smoke device
  smokeStart(device: ISmokeDevice){
    this.fbInstance.database().ref().child("smokeTemp").child(device.device).limitToLast(1).on("value", (snapshot_ => this.addSmokeTempData(device.name, snapshot_)));
    this.fbInstance.database().ref().child("smoke").child(device.device).limitToLast(20).on("value", (snapshot_ => this.addSmokeData(device.name, snapshot_)));
  }

  async addSignalsData(deviceName:string, a:firebase.database.DataSnapshot){
    console.log("Signals Device ("+deviceName+") Data update");
    var deviceDetails = a.toJSON() as ISignalsDeviceDetails

    this.signalsDeviceDetails.set(deviceName, deviceDetails);

    this.replaceSignalsProbeDetails(deviceName);
  }

  async addSmokeData(deviceName:string, a:firebase.database.DataSnapshot){
    console.log("Smoke Device ("+deviceName+") Data update");
    var deviceDetails = a.toJSON() as ISmokeDeviceDetails;

    this.smokeDeviceDetails.set(deviceName, deviceDetails);

    this.replaceSmokeProbeDetails(deviceName);
  }

  //This fetches and replaces the signals device details.  It's current called once fore each temp update.  
  replaceSignalsProbeDetails(deviceName:string){
    //lets do the conversion here rather than when requested.
 
    var deviceDetails = this.signalsDeviceDetails.get(deviceName)
    if (deviceDetails !== undefined) {
      //It pains me to write code like this, but it's unavoidable with the way the data is stuctured.
      //The best thing we can do is restructure the data as soon as we have it.
      //P1
      var temp = this.tempData.get(deviceName + ":" + deviceDetails.names.p1)
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":" + deviceDetails.names.p1, {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarmSounding.p1H) || Boolean(deviceDetails.alarmSounding.p1L),
          alarmHigh: deviceDetails.alarms.p1H,
          alarmLow: deviceDetails.alarms.p1L,
          max: deviceDetails.maxmin.p1Max,
          min: deviceDetails.maxmin.p1Min,
          name: deviceDetails.names.p1
        });
      }

      //P2
      temp = this.tempData.get(deviceName + ":" + deviceDetails.names.p2)
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":" + deviceDetails.names.p2, {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarmSounding.p2H) || Boolean(deviceDetails.alarmSounding.p2L),
          alarmHigh: deviceDetails.alarms.p2H,
          alarmLow: deviceDetails.alarms.p2L,
          max: deviceDetails.maxmin.p2Max,
          min: deviceDetails.maxmin.p2Min,
          name: deviceDetails.names.p2
        });
      }

      //P3
      temp = this.tempData.get(deviceName + ":" + deviceDetails.names.p3)
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":" + deviceDetails.names.p3, {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarmSounding.p3H) || Boolean(deviceDetails.alarmSounding.p3L),
          alarmHigh: deviceDetails.alarms.p3H,
          alarmLow: deviceDetails.alarms.p3L,
          max: deviceDetails.maxmin.p3Max,
          min: deviceDetails.maxmin.p3Min,
          name: deviceDetails.names.p3
        });
      }

      //P4
      temp = this.tempData.get(deviceName + ":" + deviceDetails.names.p4)
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":" + deviceDetails.names.p4, {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarmSounding.p4H) || Boolean(deviceDetails.alarmSounding.p4L),
          alarmHigh: deviceDetails.alarms.p4H,
          alarmLow: deviceDetails.alarms.p4L,
          max: deviceDetails.maxmin.p4Max,
          min: deviceDetails.maxmin.p4Min,
          name: deviceDetails.names.p4
        });
      }
    }

    if(this.onDataUpdate!==undefined){
      this.onDataUpdate();
    }
  }
  
  addSignalsTempData(deviceName:string, a:firebase.database.DataSnapshot){
    var device = this.signalDevices.get(deviceName);

    console.log("Signals ("+deviceName+") Temp Data update: "+ a.numChildren());

    a.forEach((record:firebase.database.DataSnapshot) => {
      var data = record.toJSON() as ISignalsTempRecord;

      var d = new Date(0);
      d.setUTCSeconds(Number(data.time));

      if(device !== undefined){
        data.p1!=="---"&&this.tempData.get(device.deviceName+":"+device.probe1Name)!.push({date:d, value:Number(data.p1)});
        data.p2!=="---"&&this.tempData.get(device.deviceName+":"+device.probe2Name)!.push({date:d, value:Number(data.p2)});
        data.p3!=="---"&&this.tempData.get(device.deviceName+":"+device.probe3Name)!.push({date:d, value:Number(data.p3)});
        data.p4!=="---"&&this.tempData.get(device.deviceName+":"+device.probe4Name)!.push({date:d, value:Number(data.p4)});
  
      }
    });

    this.replaceSignalsProbeDetails(deviceName);
  }

  replaceSmokeProbeDetails(deviceName:string){
    var deviceDetails = this.smokeDeviceDetails.get(deviceName)
    if (deviceDetails !== undefined) {
      //It pains me to write code like this, but it's unavoidable with the way the data is stuctured.
      //The best thing we can do is restructure the data as soon as we have it.
      //P1
      var temp = this.tempData.get(deviceName + ":Probe 1")
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":Probe 1", {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarms.alarm1High) || Boolean(deviceDetails.alarms.alarm1Low),
          alarmHigh: deviceDetails.alarms.probe1H,
          alarmLow: deviceDetails.alarms.probe1L,
          max: deviceDetails.minMax.probe1Max,
          min: deviceDetails.minMax.probe1Min,
          name: deviceName
        });
      }

      //P2
      temp = this.tempData.get(deviceName + ":Probe 2")
      if (temp !== undefined && temp[temp.length - 1] !== undefined) {
        this.probeState.set(deviceName + ":Probe 2", {
          temp: temp[temp.length - 1].value.toString(),
          date: temp[temp.length - 1].date,
          alarm: Boolean(deviceDetails.alarms.alarm2High) || Boolean(deviceDetails.alarms.alarm2Low),
          alarmHigh: deviceDetails.alarms.probe2H,
          alarmLow: deviceDetails.alarms.probe2L,
          max: deviceDetails.minMax.probe2Max,
          min: deviceDetails.minMax.probe2Min,
          name: deviceName
        });
      }

      if(this.onDataUpdate!==undefined){
        this.onDataUpdate();
      }
    }
  }


  addSmokeTempData(deviceName:string, a:firebase.database.DataSnapshot){
    var device = this.smokeDevices.get(deviceName);
    console.log("Smoke ("+deviceName+") Temp Data update: "+ a.numChildren());

    a.forEach((record:firebase.database.DataSnapshot) => {
      var data = record.toJSON() as ISmokeTempRecord;

      var d = new Date(0);
      d.setUTCSeconds(Number(data.time));

      if(device!== undefined){
        data.probe1!=="-"&&this.tempData.get(device.name+":Probe 1")!.push({date:d, value:Number(data.probe1)});
        data.probe2!=="-"&&this.tempData.get(device.name+":Probe 2")!.push({date:d, value:Number(data.probe2)});
      }
    });

    this.replaceSmokeProbeDetails(deviceName);
  }

}

