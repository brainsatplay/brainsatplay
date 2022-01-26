
# brainsatplay.js
[![AGPLv3 License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/npm/v/brainsatplay.svg?sanitize=true)](https://www.npmjs.com/package/brainsatplay)
[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)
[![Fund](https://img.shields.io/badge/fund-donate-brightgreen.svg)](https://www.brainsatplay.com/fund)

**brainsatplay** is an open-source ecosystem for computational neuroscience on the Web.

#### To Do
1. Reimplement with a new scope using our new libraries
2. Implement robust [P300](https://www.frontiersin.org/articles/10.3389/fnins.2017.00109/full), [SSVEP](https://ieeexplore.ieee.org/document/8553012), motor imagery, and general [artifact rejection](https://gitlab.ciirc.cvut.cz/open-source/rps) algorithms. 
3. Process NWB files

#### Browser Compatibility
**brainsatplay** is most compatible with Chromium browsers.

## Ecosystem

| Project               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| [datastreams-api]     | [![datastreams-api-status]][datastreams-api]                   | Handle streaming BLE / USB data, modeled after the StreamsAPI, includes WebRTC                       |
| [jsnwb]     | [![jsnwb-status]][jsnwb]                   | Read/write data from Neurodata without Borders files                       |
| [magicworker]         | [![magicworker-status]][magicworker] | Multithreading and workers plus GPUjs, single script CPU+GPU pipeline creation, Canvas and ThreeJS utilities, and more.       |   
| [gpujsutils]         | [![gpujsutils-status]][gpujsutils] | Utility wrapper for gpujs with a bunch of default functions (primarily GPU FFTs) and some automating for creating gpujs kernels (incl canvas output kernels) |   
| [WebsocketLiveserver] | Frontend [![websocketliveserver-frontend-status]][websocketliveserver] Backend [![websocketliveserver-backend-status]][websocketliveserver] | Library for socket servers featuring user data & communication features, WebRTC and OSC streaming, game room creation, and more to come (WIP but working) |
| [anotherstatemanager] | [![anotherstatemanager-status]][anotherstatemanager] | Multiple types of state management in one, written for high performance & laziness |
| [objectlisteners] | [![objectlisteners-status]][objectlisteners] | Customizable event listener system for arbitrary objects  |
| [biquadjs] | [![biquadjs-status]][biquadjs] | A simple set of customizable biquad filters for digital signal processing |

[View More](https://github.com/brainsatplay)

[datastreams-api]: https://github.com/brainsatplay/datastreams-api
[datastreams-api-status]: https://img.shields.io/npm/v/datastreams-api.svg
[jsnwb]: https://github.com/brainsatplay/jsnwb
[jsnwb-status]: https://img.shields.io/npm/v/jsnwb.svg
[magicworker]: https://github.com/brainsatplay/magicworker
[magicworker-status]: https://img.shields.io/npm/v/magicworker
[WebsocketLiveserver]: https://github.com/brainsatplay/websocketliveserver
[websocketliveserver-frontend-status]: https://img.shields.io/npm/v/websocketliveserver-frontend
[websocketliveserver-backend-status]: https://img.shields.io/npm/v/websocketliveserver-backend
[anotherstatemanager]: https://github.com/brainsatplay/anotherstatemanager
[anotherstatemanager-status]: https://img.shields.io/npm/v/anotherstatemanager
[objectlisteners]: https://github.com/brainsatplay/objectlistener
[objectlisteners-status]: https://img.shields.io/npm/v/objectlisteners
[gpujsutils]: https://github.com/brainsatplay/gpujsutils
[gpujsutils-status]: https://img.shields.io/npm/v/gpujsutils
[biquadjs]: https://github.com/brainsatplay/biquadjs
[biquadjs-status]: https://img.shields.io/npm/v/biquadjs

####  Brains@Play Platform
Visit the [Brains@Play Platform](https://app.brainsatplay.com) to access and create content for the Brains@Play ecosystem.

## Documentation
To check out live examples and documentation, visit [docs.brainsatplay.com](https://docs.brainsatplay.com/docs/intro) (needs updating).

## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).

The issue list of this repo is exclusively for bug reports and feature requests.

## Changelog
Detailed changes for each release will be documented in the [release notes](https://github.com/brainsatplay/brainsatplay/releases).

## Contribution
It's a free for all for now. More guidelines to come. Thank you to all the people who already contributed to **brainsatplay**!

If you have a **brainsatplay**-related project/component/tool, add it with a pull request to [this curated list](https://github.com/brainsatplay/awesome-brainsatplay!)