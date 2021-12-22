
# brainsatplay.js
[![AGPLv3 License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/npm/v/brainsatplay.svg?sanitize=true)](https://www.npmjs.com/package/brainsatplay)
[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)
[![Patreon](https://img.shields.io/badge/patreon-donate-brightgreen.svg)](https://www.patreon.com/brainsatplay)

**brainsatplay.js** is an open-source framework for developing brain-responsive applications using modern web technologies.

#### Browser Compatibility
brainsatplay.js is compatible with Chromium browsers.


## Ecosystem

| Project               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| [datastreams-api]     | [![datastreams-api-status]][datastreams-api]                   | Handle streaming BLE / USB data, modeled after the StreamsAPI, includes WebRTC                       |
| [magicworker]         | [![magicworker-status]][magicworker] | Multithreading and workers plus GPUjs, single script CPU+GPU pipeline creation, Canvas and ThreeJS utilities, and more.       |   
| [gpujsutils]         | [![gpujsutils-status]][gpujsutils] | Utility wrapper for gpujs with a bunch of default functions (primarily GPU FFTs) and some automating for creating gpujs kernels (incl canvas output kernels) |   
| [WebsocketLiveserver] | frontend: [![websocketliveserver-frontend-status]][websocketliveserver] backend: [![websocketliveserver-backend-status]][websocketliveserver] | Library for socket servers featuring user data & communication features, WebRTC and OSC streaming, game room creation, and more to come (WIP but working) |
| [anotherstatemanager] | [![anotherstatemanager-status]][anotherstatemanager] | Multiple types of state management in one, written for high performance & laziness |
| [objectlisteners] | [![objectlisteners-status]][objectlisteners] | Customizable event listener system for arbitrary objects  |
| [biquadjs] | [![biquadjs-status]][biquadjs] | A simple set of customizable biquad filters for digital signal processing |

[More libraries](https://github.com/brainsatplay)

[datastreams-api]: https://github.com/brainsatplay/datastreams-api
[datastreams-api-status]: https://img.shields.io/npm/v/datastreams-api.svg
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
Visit the [Brains@Play Platform](https://app.brainsatplay.com) to access and create content in the Brains@Play ecosystem.

## Documentation
To check out live examples and documentation, visit [docs.brainsatplay.com](https://docs.brainsatplay.com/docs/intro) (needs updating).

## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).

The issue list of this repo is exclusively for bug reports and feature requests.

## Changelog
Detailed changes for each release will be documented in the [release notes](https://github.com/brainsatplay/brainsatplay/releases).

## Contribution
It's a free for all for now. More guidelines to come. Thank you to all the people who already contributed to brainsatplay.js!

If you have a brainsatplay-related project/component/tool, add it with a pull request to [this curated list](https://github.com/brainsatplay/awesome-brainsatplay!)

## Project Roadmap
> **Note:** To be translated into several Github Projects boards.

### New Main Website
*December 2021*

An updated single-page website 
- Aggregate community contributions like on [Scratch](https://scratch.mit.edu/)

### Neurofeedback Studio
*January - February 2022*

A sleek, modular home [neurofeedback dashboard](https://docs.google.com/document/d/1nDjccY95XTVTcJqEquLJ9Ax7gofYWND-PJk7bW2OSBM/edit) with a modern UI, built-in data collection, and extensible through Studio support.
- Requires finishing the DataStreams API and generalizing all the brainsatplay.js systems into separate NPM libraries
    - Remove branding from published libraries
- Robust Google integration
- Chrome Extension to support integration of neurofeedback into web browsing
- Redoing every visual to be studio-friendly and more performant with threaded canvases.

### Documentation
*February - May 2022*

Create content around the development of applications using Brains@Play tools. Clearly define our feature wishlist with skeleton code to be filled in by open-source contributors.
- Includes writing up a publication for a Frontiers special issue for [BCIs: Research and Development in Children](https://www.frontiersin.org/research-topics/25874/bcis-research-and-development-in-children?j=1754339&sfmc_sub=325020520&l=94_HTML&u=45263393&mid=7236711&jb=32). As we develop a proposal for what is required to continue to support this work, we may start thinking about a W3C proposal around real-time data streams from BLE / USB devices.
- Create content on [Twitch](https://www.twitch.tv/brainsatplay) and Youtube while starting crowdfunding campaigns on Patreon and, potentially, Kickstarter

#### Components
- Session
- App
- Editor
- Wallet(?)
- DataAtlas
- DataStreams (Devices)
- Plugins
- Community Website


### BCI Features
*March 2022*

Implement robust [P300](https://www.frontiersin.org/articles/10.3389/fnins.2017.00109/full), [SSVEP](https://ieeexplore.ieee.org/document/8553012), motor imagery, and general [artifact rejection](https://gitlab.ciirc.cvut.cz/open-source/rps) algorithms. 

### Hardware Release
*???*

> See our [Miro Board](https://miro.com/app/board/o9J_lPlYRl4=/) for high-level conceptual diagrams of the project.
