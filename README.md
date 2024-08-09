# The Brains@Play Framework

**The Brains@Play Framework** allows anyone to compose interactive, high-performance web applications and contribute to **an ecosystem of copyleft software infrastructure for open-source application development** on the Web. 

> ### Notice of Discontinued Project
> Work on the Brains@Play Framework has been discontinued since September 2023. While this project was originally centered on uniform access to biosensing devices on the [Brains@Play Platform](https://github.com/brainsatplay/platform), we began translating this monolithic project into standalone libraries to simplify biosensing application development.
> 
> With the best of intentions, we ultimately abandoned our core product and failed to secure sustainable funding. The resources linked below are a record of this stage of the organization.

## The Benefits
🔮 **Low Code:** Our browser-based [studio] makes it easy to wire together your application logic using the [visualscript] library.

🧩 **Familiar:** We don't lock users into unnecessary abstractions. Just format code files as ES Modules!

⚡ **Performant:** High-performance event-based logic using the [graphscript] library.

🌐 **Social:** Derivative components can be published as NPM packages and registered on the [components] library to be shared with the world.

📜 **Radically Open:** This library is licensed under the AGPL license. All derivatives are also free and open-source software!

> If we don't have something you'd like to see within this framework, feel free to propose your idea in the [Issues](https://github.com/brainsatplay/brainsatplay/issues) tab!

## Getting Started
Check out the [brainsatplay-starter-kit](https://github.com/brainsatplay/brainsatplay-starter-kit) to start developing your application with the Brains@Play Framework!

## Framework Libraries
Below are the core repositories of the Brains@Play Framework. Check out the [components] repository to see everything created by our community!

| Library               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| **[wasl]**         | [![wasl-status]][wasl] | The Web Application Specification Language, used by the [brainsatplay] library       |
| **[brainsatplay]**         | [![brainsatplay-status]][brainsatplay] | Enables editing of [wasl] applications at runtime.
| [graphscript]         | [![graphscript-status]][graphscript] | Easy graph-based workflow (state machine) programming, microservice architectures, and interoperable front and backend web frameworks.       |
| [studio]         | [![studio-status]][studio] | A low-code editor for [wasl] applications.       |
| [datastreams-api]     | [![datastreams-api-status]][datastreams-api]                   | Uniformly acquire real-time data with available browser APIs.                       |

### Repo Contents (src)
#### core
An application synchronization library for [graphscript] and [visualscript].

## Acknowledgments
This project was maintained by [Garrett Flynn](https://github.com/garrettmflynn) and [Joshua Brewster](https://github.com/joshbrew).

## Appendix
### Branches
The `main` branch of this repository contains the latest releases of core libraries in The Brains@Play Framework.

The `nightly` branch hosts regular changes between official releases.

The `legacy` branch contains a record of the original brainsatplay library (<= v0.0.36), which is used in the [Brains@Play Platform](https://github.com/brainsatplay/platform).

### Additional Repositories
#### Hardware
| Project               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| [hegduino]         | Public | A low-cost hemoencephalography (HEG) device.       |
| [nRF52]         | In Development | Working prototypes for using nRF52 microcontrollers (ARM + BLE5) with low cost sensors.       |

[brainsatplay]: ./src/core/README.md
[brainsatplay-status]: https://img.shields.io/npm/v/brainsatplay

<!-- Specification Language -->
[wasl]: https://github.com/brainsatplay/wasl
[wasl-status]: https://img.shields.io/npm/v/wasl

<!-- Core Library-->
[graphscript]: https://github.com/brainsatplay/graphscript
[graphscript-status]: https://img.shields.io/npm/v/graphscript

<!-- Integrated Editor-->
[studio]: https://github.com/brainsatplay/studio
[studio-status]: https://img.shields.io/npm/v/brainsatplay-studio

<!-- Low Code Programming System-->
[visualscript]: https://github.com/brainsatplay/visualscript
[visualscript-status]: https://img.shields.io/npm/v/visualscript


<!-- Data Acquisition-->
[datastreams-api]: https://github.com/brainsatplay/datastreams-api
[datastreams-api-status]: https://img.shields.io/npm/v/datastreams-api.svg

<!-- Build Tool-->
[tinybuild]: https://github.com/brainsatplay/tinybuild
[tinybuild-status]: https://img.shields.io/npm/v/tinybuild

<!-- Additional Repos -->
[components]: https://github.com/brainsatplay/components
[accessify]: https://github.com/brainsatplay/accessify
[docs]: https://github.com/brainsatplay/docs

<!-- Hardware -->
[hegduino]: https://github.com/moothyknight/HEG_ESP32_Delobotomizer

[nRF52]: https://github.com/brainsatplay/nRF52-Biosensing-Boards


