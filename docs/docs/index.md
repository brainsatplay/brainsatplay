---
sidebar_position: 1
title: Introduction
---
# Introduction
## A New Way to Compose the Web
`brainsatplay` is a rapid application design (RAD) framework for composing interactive, high-performance web applications. This follows a datastream programming paradigm, which models a program as a directed graph of the data flowing between operations, to provides the following advantages: 
1. An operation runs as soon as all of its inputs become valid. Thus, this paradigm is inherently parallel and can work well in large, decentralized systems.
2. The task of maintaining state is removed from the programmer and given to the runtime.
3. Various transport protocols can be used to carry messages.

Our framework is composed of several libraries that we intend to grow into a software ecosystem for open-source scientific application development on the Open Web: 

:::note

This framework is [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html) and maintained by [Garrett Flynn](https://github.com/garrettmflynn) and [Josh Brewster](https://github.com/joshbrew) from [Brains@Play](https://brainsatplay.com).

:::

## How It Began
We took the latest latest APIs for data acquisition (e.g. Web Bluetooth, Web Serial, etc.) and developed a way to process and forward data as fast as possible. 

We believe that physiological signals represent the next frontier of interactive programming—beyond traditional events such as mouse movements and button presses.

## Playing with Code
`brainstplay` embodies our desire to support the joy of developers as they create high-performance code. It encompasses many different goals including **first-class TypeScript support**, a focus on **inspectability and interactivity**, and **accessibility** for use by everyone with a brain. 

More generally, `brainsatplay` refers to the culture of rapid prototyping that permeates the project by extending functionality from simple components rather than adding unneccesary complexity.

## Architecture
`brainsatplay` uses the [Web Application Specification Language (wasl)](./guides/libraries/wasl) to construct high-performance applications in [graphscript](./guides/libraries/graphscript). The underlying `wasl` configuration can then be visualized using [visualscript](./guides/libraries/visualscript) and constructed alongside `brainsatplay` plugins using our [editor](./guides/libraries/editor).

| Library               | Status                                                       | Description                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| [brainsatplay]         | [![brainsatplay-status]][brainsatplay] | An application synchronization library for [graphscript] and [visualscript].
| [graphscript]         | [![graphscript-status]][graphscript] | Easy graph-based workflow (state machine) programming, microservice architectures, and interoperable front and backend web frameworks.       |
| [visualscript]         | [![visualscript-status]][visualscript]  | A low-code programming system for [wasl] applications       |
| [wasl]         | [![wasl-status]][wasl] | The web application specification language used by the [graphscript] library       |
| [editor]         | [![editor-status]][editor] | A low-code editor for brainsatplay applications.       |
| [datastreams-api]     | [![datastreams-api-status]][datastreams-api]                   | Uniformly acquire real-time data with available browser APIs.                       |
| [tinybuild]     | [![tinybuild-status]][tinybuild]                   | Custom build tool for web applications.     

## Audience
This documentation is written for **programmers who care about the agency of their users**. We assume that you can read JavaScript code—as all of the examples here are written for the browser (specifically the latest Chromium browsers) or Node.js. Other than that basic background, we try to present all the concepts you will need to use `brainsatplay`.

[brainsatplay]: https://github.com/brainsatplay/brainsatplay
[brainsatplay-status]: https://img.shields.io/npm/v/brainsatplay

<!-- Specification Language -->
[wasl]: https://github.com/brainsatplay/wasl
[wasl-status]: https://img.shields.io/npm/v/wasl

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