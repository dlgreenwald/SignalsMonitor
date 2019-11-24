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

interface ITempRecord{
  p1:string,
  p2:string,
  p3:string,
  p4:string,
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

export class ThermoworksFirebase {
  fbInstance: firebase.app.App;
  username: string;
  password: string;
  uid: string;
  smokeDevices: Map<String, ISignalsDevice>;
  tempData:Map<string, Array<{ 'date': Date; 'value': number; }>>;
  probeState:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
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
    this.smokeDevices = new Map();
    this.tempData = new Map();
    this.onDataUpdate = undefined;
    this.probeState = new Map();
  }

  setCredentials(username:string, password:string){
    this.username = username;
    this.password = password;
  }

  async init(){
    this.uid = '';
    this.smokeDevices = new Map();
    await this.fbInstance.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error) {
      // Handle Errors here.
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
    var devicesQuery = await this.fbInstance.database().ref().child("users").child(this.uid).child("devices").child("signals").once("value");
    
    devicesQuery.forEach((device) => {
      var devObj = device.toJSON() as ISignalsDevice;

      this.smokeDevices.set(devObj.deviceName,devObj);
      //init empty temp data
      this.tempData.set(devObj.deviceName+":"+devObj.probe1Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe2Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe3Name, [])
      this.tempData.set(devObj.deviceName+":"+devObj.probe4Name, [])

      //subscribe to update events on each device
      this.start(devObj);
    });

  }

  //Gets the Signals Devices.  Smoke Devices are at "users/[uid]/devices/smoke" but I don't have one so I can't make this reliable.  Only need to do this at login
  getSignalsDevices(){
    return this.smokeDevices;
  }

  returnTempData(): Map<string, Array<{ 'date': Date; 'value': number; }>>{
    return this.tempData;
  }

 
  returnProbeDetails(): Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>{
    return this.probeState; 
  }

  setOnTempUpdate(onDataUpdate:() => any){
    this.onDataUpdate = onDataUpdate;
  }


  start(device: ISignalsDevice){
    this.fbInstance.database().ref().child("SignalTemps").child(device.deviceID).limitToLast(100).on("value", (snapshot_ => this.addTempData(device.deviceName, snapshot_)));
  }

  async replaceProbeDetails(deviceName:string){
    //lets do the conversion here rather than when requested.
    var device = this.smokeDevices.get(deviceName);
    var deviceID:string = "";
    if(device!==undefined){
      deviceID=device.deviceID;
    }

    var details = await this.fbInstance.database().ref().child("signals").child(deviceID).limitToLast(20).once("value");
    var deviceDetails:ISignalsDeviceDetails = details.toJSON() as ISignalsDeviceDetails
    
    //It pains me to write code like this, but it's unavoidable with the way the data is stuctured.
    //The best thing we can do is restructure the data as soon as we have it.
    //P1
    var temp = this.tempData.get(deviceName+":"+deviceDetails.names.p1)
    if(temp !== undefined && temp[temp.length-1]!==undefined){
      this.probeState.set(deviceName+":"+deviceDetails.names.p1, {
        temp:temp[temp.length-1].value.toString(),
        date:temp[temp.length-1].date,
        alarm:Boolean(deviceDetails.alarmSounding.p1H)||Boolean(deviceDetails.alarmSounding.p1L),
        alarmHigh:deviceDetails.alarms.p1H,
        alarmLow:deviceDetails.alarms.p1L,
        max:deviceDetails.maxmin.p1Max,
        min:deviceDetails.maxmin.p1Min,
        name:deviceDetails.names.p1
      });
    }

    //P2
    temp = this.tempData.get(deviceName+":"+deviceDetails.names.p2)
    if(temp !== undefined && temp[temp.length-1]!==undefined){
      this.probeState.set(deviceName+":"+deviceDetails.names.p2, {
        temp:temp[temp.length-1].value.toString(),
        date:temp[temp.length-1].date,
        alarm:Boolean(deviceDetails.alarmSounding.p2H)||Boolean(deviceDetails.alarmSounding.p2L),
        alarmHigh:deviceDetails.alarms.p2H,
        alarmLow:deviceDetails.alarms.p2L,
        max:deviceDetails.maxmin.p2Max,
        min:deviceDetails.maxmin.p2Min,
        name:deviceDetails.names.p2
      });
    }

    //P3
    temp = this.tempData.get(deviceName+":"+deviceDetails.names.p3)
    if(temp !== undefined && temp[temp.length-1]!==undefined){
      this.probeState.set(deviceName+":"+deviceDetails.names.p3, {
        temp:temp[temp.length-1].value.toString(),
        date:temp[temp.length-1].date,
        alarm:Boolean(deviceDetails.alarmSounding.p3H)||Boolean(deviceDetails.alarmSounding.p3L),
        alarmHigh:deviceDetails.alarms.p3H,
        alarmLow:deviceDetails.alarms.p3L,
        max:deviceDetails.maxmin.p3Max,
        min:deviceDetails.maxmin.p3Min,
        name:deviceDetails.names.p3
      });
    }

    //P4
    temp = this.tempData.get(deviceName+":"+deviceDetails.names.p4)
    if(temp !== undefined && temp[temp.length-1]!==undefined){
      this.probeState.set(deviceName+":"+deviceDetails.names.p4, {
        temp:temp[temp.length-1].value.toString(),
        date:temp[temp.length-1].date,
        alarm:Boolean(deviceDetails.alarmSounding.p4H)||Boolean(deviceDetails.alarmSounding.p4L),
        alarmHigh:deviceDetails.alarms.p4H,
        alarmLow:deviceDetails.alarms.p4L,
        max:deviceDetails.maxmin.p4Max,
        min:deviceDetails.maxmin.p4Min,
        name:deviceDetails.names.p4
      });
    }
  }
  
  async addTempData(deviceName:string, a:firebase.database.DataSnapshot){
    var device = this.smokeDevices.get(deviceName);

    a.forEach((record:firebase.database.DataSnapshot) => {
      var data = record.toJSON() as ITempRecord;

      var d = new Date(0);
      d.setUTCSeconds(Number(data.time));

      if(device !== undefined){
        data.p1!=="---"&&this.tempData.get(device.deviceName+":"+device.probe1Name)!.push({date:d, value:Number(data.p1)});
        data.p2!=="---"&&this.tempData.get(device.deviceName+":"+device.probe2Name)!.push({date:d, value:Number(data.p2)});
        data.p3!=="---"&&this.tempData.get(device.deviceName+":"+device.probe3Name)!.push({date:d, value:Number(data.p3)});
        data.p4!=="---"&&this.tempData.get(device.deviceName+":"+device.probe4Name)!.push({date:d, value:Number(data.p4)});
  
      }
    });

    await this.replaceProbeDetails(deviceName);

    if(this.onDataUpdate!==undefined){
      this.onDataUpdate();
    }

  }

}

