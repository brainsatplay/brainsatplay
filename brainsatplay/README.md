<div style="display: flex; align-items: center;  justify-content:center;margin-bottom: 25px;">
<div style="text-align:center; width: 400px;">
<img src="./logo.png" style="width: 300px;">
<p>A full-stack framework for developing brain-responsive web apps with JavaScript</p>

<img src="https://img.shields.io/badge/github-source_code-blue.svg?logo=github&logoColor=white"
href="https://github.com/brainsatplay/brainsatplay">
<img src="https://img.shields.io/badge/License-MIT-yellow.svg"
href="https://opensource.org/licenses/MIT">
</div>
</div>

## Description
**brainsatplay.js** is full-stack framework for developing web-based brain-computer interface (BCI) applications. This library extends [bci.js](https://bci.js.org/) to remove the networking and data management requirements for developing functional BCI apps hosted on the web.

## Getting Started with brainsatplay.js
### Library Usage
#### Node.js
```bash
npm install brainsatplay
``` 

#### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/brainsatplay"></script>
``` 
### Running a Local Server
1. Install [NPM](https://www.npmjs.com/) and [Node](https://nodejs.org/en/).
2. If you have npm installed already, make sure to update it to the latest version using:
```bash
npm update -g npm
```
2. In the project folder, install the required Node modules by typing this into your command line:
```bash
npm install
``` 
3. In your command line:
```bash
npm start
```
4. Click on the link in the terminal to navigate to http://localhost to view a template project using the Brains@Play library

### Stream Data to the Server
1. Use your favorite environment management system (e.g. [Miniconda](https://docs.conda.io/en/latest/miniconda.html)) to create a new environment.
2. Install the brainsatplay package
```bash
pip install brainsatplay
```
3. Navigate to this project's /libraries/python directory
4. In stream.py, configure the following settings for your specific use-case:
```python
  BOARD = 'SYNTHETIC_BOARD' 
  # Synthetic Stream: 'SYNTHETIC_BOARD'
  # OpenBCI Board: 'CYTON_DAISY_BOARD'
  # Neurosity Boards: 'NOTION_1_BOARD' or 'NOTION_2_BOARD'

  PORT = None
  # Synthetic Stream: None
  # Mac: '/dev/cu.usbserial-________'
  # Windows: 'COM_'
                  
  URL = 'http://localhost/'#'https://brainsatplay.azurewebsites.net'
  # Local: 'http://localhost'
  # Deployed Game: 'https://brainsatplay.azurewebsites.net'

  LOGIN_DATA = { 'guestaccess': True }#,'guestId': '9e90cd6f-35a9-45b2-9d7b-229968275025' }
  # Guests: { 'guestaccess': True, 'guestId': '********'}
  # Authenticated Users: { 'username': '********', 'password': '********' }
  
  GAME = 'template'
  # Current Games: template, brainstorm

  ACCESS = 'public'
  # Anyone Can Access Data (required to play games): 'public'
  # Only Interfaces with Same USERID Access Data: 'private'

  DATA_STREAM = ['brainflow', 'arbitrary']
  # Stream raw voltages using Brainflow: 'brainflow'
    # Extend this array with arbitrary fields to pass to the front end

  def arbitraryEventFunction(brain): 
    # Use this callback function to pass arbitrary data to the front end (corresponding to fields in DATA_STREAM)
      brain.passData('arbitrary', math.sin(time.time()))
```
6. Begin streaming:
```bash
python stream.py
```

##  Examples
### [Brains@Play Project Template](https://brainsatplay.com/template) 
The Brains@Play Project Template uses p5.js to illustrate the basic functionality of the Brains@Play API. We include it in this repository for you to kickstart your game development! 

### [Brainstorm](https://brainsatplay.com/brainstorm) 
Brainstorm is a web-based BCI game that computes, visualizes, and promotes the synchronization of brains across geographic, political, and social barriers. To generate public discussion about the ethical, legal, and social implications of emerging commercial devices to monitor brain activity, Brainstorm was be showcased at [Livewire: A Stimulating Night of Neurotechnology](https://visionsandvoices.usc.edu/eventdetails/?event_id=33741435186601&s_type=&s_genre=)—a USC Visions and Voices event combining neuroscience, neuroethics, and interactive media for participatory technology design.

## Support

If you are having issues, please email Garrett Flynn at gflynn@usc.edu

## Acknowledgments
### Funding
**brainsatplay.js** was supported by [OpenBCI](https://openbci.com/) and [USC Visions and Voices](https://visionsandvoices.usc.edu/) for the production of [Livewire: A Stimulating Night of Neurotechnology](https://visionsandvoices.usc.edu/eventdetails/?event_id=33741435186601&s_type=&s_genre=).

### External Libraries Used
#### JavaScript
- [NPM](https://www.npmjs.com/) and [Node](https://nodejs.org/en/).
- [eegpwa](https://github.com/moothyknight/eegpwa)
  - Bandpass and notch filters
  - FreeEEG32 Serial class
- [bci.js](https://bci.js.org/)
  - Bandpower function
- [muse-js](https://github.com/urish/muse-js/tree/master/src)
  - Muse BLE class
- [Express](https://expressjs.com/)
- [Webpack](https://webpack.js.org/)
- [ws](https://www.npmjs.com/package/ws)

#### Python
- [Brainflow](https://brainflow.readthedocs.io/en/stable/index.html)
- [websockets](https://websockets.readthedocs.io/en/stable/intro.html)
- [requests](https://requests.readthedocs.io/en/master/)


