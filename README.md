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
**brainsatplay.js** is full-stack framework for developing web-based brain-computer interface (BCI) applications. This library abstracts the networking and data management requirements for developing functional BCI apps hosted on the web.

FYI it's super unfinished. We are reworking a few systems still to be *just* right and then completing documentation and a community website, give it a few weeks :-)


## Getting Started
### Library Usage
#### Node.js
```bash
npm install brainsatplay
``` 

```javascript
const brainsatplay = require('brainsatplay')
``` 

#### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/brainsatplay"></script>
``` 

### Running a Local Version
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
If you have any questions (or would just like to chat about this project), reach out to Garrett Flynn (gflynn@usc.edu) or Josh Brewster.

## Acknowledgments
### Funding
**brainsatplay.js** was supported by [OpenBCI](https://openbci.com/) and [USC Visions and Voices](https://visionsandvoices.usc.edu/) for the production of [Livewire: A Stimulating Night of Neurotechnology](https://visionsandvoices.usc.edu/eventdetails/?event_id=33741435186601&s_type=&s_genre=).

### External Libraries Used
#### JavaScript
- [NPM](https://www.npmjs.com/) and [Node](https://nodejs.org/en/).
- [muse-js](https://github.com/urish/muse-js/tree/master/src)
- [Express](https://expressjs.com/)
- [Snowpack](https://snowpack.dev/)
- [Webpack](https://webpack.js.org/)
- [ws](https://www.npmjs.com/package/ws)
- And many more!



## Appendix A: Purpose

Our goal at **Brains@Play** is to make a cross-platform, plug and play progressive web app interface for EEG interaction. This will later merge with my FNIRS work to make a full "Web BCI" platform. Everything is kept as modular as possible so new hardware support or interesting software features become as trivial to add as possible and without breaking anything else. 

Leveraging a developer option for chromium browsers (Chrome only currently), the Web Serial API, we can get real time data with the FreeEEG32 at the full 512sps * 32 channel sample speed. With other nice feature like web workers, gpujs, and canvas, we can make a competent and user friendly piece of software that matches functionality with others - and it can be developed in a fraction of the time.

Everything here now was accomplished over the past couple months independently, when it's done it will look like any other starter BCI software but accessible from a web link. PWAs can also be made downloadable on desktop or mobile depending on use case. This altogether makes for a flexible, rapid-development-friendly, cross platform, build-free software package to jump into the fray with our favorite hardware. I want to be able to develop something with instant cross platform access, plug and play ability, easy networking, and easy feature development. We got that with this software model, and I'll be experimenting with python and C wrappers to allow plugging those scripts into the interface for visualizing or networking with different data.

![brainmap](./brainmap.PNG)

![stream](./Coherence.PNG)

![stream](./stream.png)


## Appendix B: Cool features

* GPU js FFTs with web workers enabling real time DSP for as many channel inputs as you want. Benchmarked 128 channels * 512 samples in 8.3ms, about 15ms-20ms average on an RTX 2060.
* Digital biquad filters, as many as you want...
* Live charting, brain mapping, coherence, much more to come.
* Modular data and visual tools with class based modules, and a modifiable decoder for enabling any hardware.
* Configured for the [FreeEEG32](https://github.com/neuroidss/freeeeg32_beta), easy to add other configurations, I need to add a formal layer to accept data from any kind of stream into some functions so you don't need to mess with anything else in the app.
* Wicked fast HTML rendering with custom fragment system.
* State based UI system for easy subscribing/unsubcribing disparate features to data streams. 
* Applet based feature system, easy to write features and add to the main app. The whole app is interchangable.
* IndexedDB file system with BrowserFS, download a formatted CSV, optimized for performance and not overwhelming browser memory limits by autosaving often and breaking up download file sizes into chunks.
