# brainsatplay
[![Awesome](https://awesome.re/badge-flat2.svg)](https://github.com/brainsatplay/awesome-brainsatplay)
[![Discord](https://img.shields.io/[](src/core/dist)badge/chat-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

`brainsatplay` is a framework for quickly assembling interactive, high-performance web applications. 

This repo is in active development so you'll see a lot of ideas still getting half baked and tossed out but you can follow our development closely if you subscribe to [garrettmflynn](https://github.com/garrettmflynn) and [joshbrew](https://github.com/joshbrew) on GitHub.

> If we don't have something you'd like to see within this framework, feel free to propose your idea in the [Issues](https://github.com/brainsatplay/brainsatplay/issues) tab!

Our mission is to enable open source biosensing and signal processing research, game, and education application development for everyone, We're solving a ton of typical web development problems in the process with a suite of custom frameworks leveraging the latest web APIs! 

> To learn more about what we're doing at a broad level, check out our [project](https://github.com/brainsatplay/project) repository.

### Framework Libraries
Below are the core repositories of the [brainsatplay] framework. Check out the [awesome-brainsatplay](https://github.com/awesome-brainsatplay) repository to see everything created by our community!

| Project               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| **[editor]**         | [![editor-status]][editor] | A low-code editor for brainsatplay applications.       |
| **[graphscript]**         | [![graphscript-status]][graphscript] | Easy graph-based workflow (state machine) programming, microservice architectures, and interoperable front and backend web frameworks.       |
| **[visualscript]**         | [![visualscript-status]][visualscript]  | A low-code programming system for the [graphscript] library       |
| [datastreams-api]     | [![datastreams-api-status]][datastreams-api]                   | Uniformly acquire real-time data with available browser APIs.                       |
| [tinybuild]     | [![tinybuild-status]][tinybuild]                   | Combines ultra fast and lightweight esbuild, hot reloading node and python (optional), and quick config/setup for webapps, npm libraries, pwas, and mobile applications.              

## Current Repo Contents
### chrome
A Chrome Extension for developing [brainsatplay] applications.

### cli
Program a new project through the terminal.

### core
A linker library between [graphscript] and [visualscript]

### pwa
An example Progressive Web App (PWA) using the [brainsatplay] framework.         |

## Documentation
> Full documentation will be released at https://docs.brainsatplay.com.

Check out the [brainsatplay-starter-kit](https://github.com/brainsatplay/brainsatplay-starter-kit) to start developing your application!

## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).


## Appendix
### Branches
The `legacy` branch of this repository contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).



[brainsatplay]: https://github.com/brainsatplay/brainsatplay

<!-- Core Library-->
[graphscript]: https://github.com/brainsatplay/graphscript
[graphscript-status]: https://img.shields.io/npm/v/graphscript

<!-- Integrated Editor-->
[editor]: https://github.com/brainsatplay/editor
[editor-status]: https://img.shields.io/npm/v/brainsatplay-editor

<!-- Low Code Programming System-->
[visualscript]: https://github.com/brainsatplay/visualscript
[visualscript-status]: https://img.shields.io/npm/v/visualscript


<!-- Data Acquisition-->
[datastreams-api]: https://github.com/brainsatplay/datastreams-api
[datastreams-api-status]: https://img.shields.io/npm/v/datastreams-api.svg

<!-- Build Tool-->
[tinybuild]: https://github.com/brainsatplay/tinybuild
[tinybuild-status]: https://img.shields.io/npm/v/tinybuild