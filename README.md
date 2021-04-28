<div style="display: flex; align-items: center;  justify-content:center;margin-bottom: 25px;">
<div style="text-align:center; width: 400px;">
<img src="./logo.png" style="width: 300px;" alt="Brains@Play">
<p>A full-stack framework for developing brain-responsive web apps with JavaScript</p>

<a href="https://github.com/brainsatplay/brainsatplay-beta"><img src="https://img.shields.io/badge/github-source_code-blue.svg?logo=github&logoColor=white"></a>
<a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg"></a>
</div>
</div>

## Description
**brainsatplay.js** is full-stack framework for deploying web-based brain-computer interface (BCI) applications. This library abstracts the networking and data management requirements for developing functional BCI apps hosted on the web.

FYI it's super unfinished. We are reworking a few systems still to be *just* right and then completing documentation and a community website, give it a few weeks :-)


## Getting Started
### Tutorials
- [Create an Applet (v1)]{@tutorial Applets}
- [Create an Applet (v2)]{@tutorial Applets(v2)}
- [Add a Device]{@tutorial Devices}
- [Create a Multiplayer Applet]{@tutorial Multiplayer}

### Library Usage
#### Node.js
```bash
npm install brainsatplay
``` 

##### CommonJS
```javascript
const brainsatplay = require('brainsatplay')
``` 

##### ES Modules
```javascript
import * as brainsatplay from 'brainsatplay'
```

#### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/brainsatplay"></script>
```

### Running a Local Development Server
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
4. Click on the link in the terminal to navigate to http://localhost:1234 to view the latest version of Brains@Play Platform


##  Examples
### [Brains@Play Platform](https://app.brainsatplay.com) 
The alpha version of Brains@Play's application manager.

## Support
If you have any questions (or would just like to chat about this project), reach out to Garrett Flynn and Josh Brewster via [contact@brainsatplay.com](contact@brainsatplay.com).


## Appendix A: The Brains@Play Ethos
Everyone has a brain. So why not develop hardware and applications with all of them in mind? Brains@Play is kickstarting a neurotechnology co-development movement where anyone can *join the brainstorm to collectively imagine how to use our brains to function better together*.

Our technology supports the development of web-based applications structured as an **Applet** (shown in the [Brains@Play Starter Kit](https://github.com/brainsatplay/brainsatplay-starter-kit) repository). At the core of each applet is a **Data Atlas** that processes biosignals streamed over Bluetooth Low Energy (BLE) or Serial in real-time. This allows users to **train** to modulate their brainwaves and, eventually, **play** games. 

Distributing your applets via tbe [Brains@Play Platform](https://app.brainsatplay.com) is highly encouraged—though we intend to support standalone app development in the browser and Node.js using [the brainsatplay.js NPM library](https://www.npmjs.com/package/brainsatplay). Any application built with brainsatplay.js can stream data to **The Brainstorm** and allow users from around the world, with varying degrees of motor control, to train and play together. 

In the coming months, our team will announce **BCI Bounties** (i.e. cash prizes and community "karma") to incentivize eager contributors to solve hard problems in the neurotechnology space and make their mark in the community. 

The brainstorm has begun. Will you play a part in it?