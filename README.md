![Screenshot of Graph and Temp Cards](https://github.com/dlgreenwald/SignalsMontior/raw/master/screenshot.png)

## Signals Monitor
Signals Monitor is a project with attemps to create an improved experiance for the [Signals 4-Channel BBQ Alarm Thermometer with Wi-Fi and Bluetooth Wireless Technology](https://www.thermoworks.com/Signals).  You will need to have previously registered your Signals to your account via the mobile app.  You will provide the email and password you used to login to the Thermoworks application to connect and pull your data. Currently the only functionality is graphing and a "quick view" of all probes in an account which have active data.  This can lead to some weirdness with disonnected probes still displaying their last value (#TODO).  The quick view also provides a visual alert of Max and Min values being exceed with a color change.

It shoudl be possible to expand it to work with the [Smoke Gateway](https://www.thermoworks.com/Smoke-Gateway) the as well as the datasource is the same for both prodcuts given access to one.

This project was enabled by [python-thermoworks-smoke](https://pypi.org/project/thermoworks-smoke/) which provided the firebase apiKey and other parameters mined from the android APK.  [I too hope they don't mind too much.](https://github.com/nhorvath/python-thermoworks-smoke/blob/cf3e11b3723a8617c8cd84929a22b372030014f8/thermoworks_smoke/thermoworks_smoke.py#L42)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Desired upcoming features
* Auditory Alarm
* Actual Site hosted on GitHub Pages
* Save data to CSV
* Save graph image
* Display max and min values on graph
* Display lines on graph for MaxAlarm and MinAlarm (probably needs to be selectable)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

Deploys the users current 'build' directory to the gh-pages branch which is used to host this project.  You *must* always run `npm run build` on a git repo with a fresh 'git pull' prior to this command to make sure that the lastest build is copied.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
