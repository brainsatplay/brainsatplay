---
sidebar_position: 1
title: Introduction
---

The Brains@Play Framework (Brains@Play) is a rapid application design system for composing interactive, high-performance web applications using **functional building blocks**. 

Brains@Play follows a **datastream** programming paradigm and models programs as directed graphs of data flowing between operations. The advantages of this approach are: 
1. **Inherent parallelization** for use in large, decentralized systems.
2. **Seamless transition between different transport protocols** (e.g. HTTP, Websocket, WebRTC, etc.) for passing messages.
3. **No need to maintain state** as a developer

While the team behind Brains@Play has initially sought to re-envision physiological computing education with the University of Alabama's [Human Technology Interaction Lab](https://htilua.org/), we ultimately intend to steward this framework into a **copyleft software ecosystem for open-source application development** that will recompose the web into a massive collection of reusable code blocks.

:::info The Developers
All core software for The Brains@Play Framework has been released under the [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html) license. It is maintained by [Garrett Flynn](https://github.com/garrettmflynn) and [Josh Brewster](https://github.com/joshbrew) from [Brains@Play LLC](https://brainsatplay.com).
:::

## The Library
`brainsatplay` compiles files in the Web Application Specification Language (specified in the [wasl](./guides/libraries/wasl) library) to high-performance applications. Beyond wrapping its dependencies, this library: 
- Transforms function arguments into [`graphscript`](./guides/libraries/graphscript) graphs that can be targeted independently
- Compiles source text from other languages (e.g. Python, C++, etc) into functional nodes (TBD)

Using the [`@brainsatplay/studio`](./guides/libraries/studio), the underlying WASL structure can be inspected, modified, and extended with official [plugins](https://github.com/brainsatplay/plugins).

## How It Began
At the core of `brainsatplay` is our decision to standardize the usage of ES Modules.

With the release of ECMAScript 2015 (ES6) in 2015, ECMAScript Modules (ES Modules) became the standard format to package JavaScript code for reuse and provide modularity to the Web. 

```javascript title="hello.js"
export const world = () => console.log('hello world!')
export const friend = () => console.log('hello friend!')
```

```javascript title="index.js"
import * as hello from './hello.js'
hello.world()
hello.friend()
```

The release of Firefox 60 (May 2018) marked its support in all major browsers. And Node.js 14 (April 2021) finally made these capabilities stable for server-side code. But had anything really changed about reuse?

Package managers such as NPM and Yarn made the process of reusing code easier by installing sub-dependencies, configuring your dependency tree, and much more. But packages aren't composable. They don't have a shared structure.

While working on browser-based physiological computing systems, Joshua Brewster and Garrett Flynn designed the [Web Application Specification Language (WASL)](./guides/libraries/wasl): a standard that combines ESM and JSON to specify composable Web plugins. 

```javascript title="trigger.js"
export const loop = 1000/10
export default () => true
```

```javascript title="hello.js"
export default (message="world") => console.log(`hello ${message}!`)
```

```json title="index.wasl.json"
{
    "name": "My App",
    "graph": {
        "nodes": {
            "trigger": {
                "src": "trigger.js"
            },
             "hello": {
                "src": "hello.js"
            }
        },

        "edges": {
            "trigger": {
                "hello": {}
            }
        }
    }
}
```

At that point, they hooked up Web Bluetooth, Web Serial, and other data acquisition APIs to these plugins and optimized [`brainsatplay` and its dependencies](./guides/libraries/index.md) to be as fast as possible. 

## Playing with Code
`brainstplay` embodies our desire to support the joy of developers as they create high-performance applications. It encompasses many different goals including **free software use**, a focus on **inspectability and interactivity**, and **accessibility** for everyone with a brain. 

More generally, `brainsatplay` refers to the culture of rapid prototyping that permeates the project by composing simple components without the need to focus on unneccesary complexity.

## Audience
This documentation is written for **programmers who care about the future of composability**. We assume that you can read JavaScript code—as all of the examples here are written for the browser (specifically the latest Chromium browsers) or Node.js. Other than that basic background, we try to present all the concepts you will need to use `brainsatplay`.

[brainsatplay]: https://github.com/brainsatplay/brainsatplay
[brainsatplay-status]: https://img.shields.io/npm/v/brainsatplay

<!-- Specification Language -->
[wasl]: https://github.com/brainsatplay/wasl
[wasl-status]: https://img.shields.io/npm/v/wasl

<!-- Core Library-->
[graphscript]: https://github.com/brainsatplay/graphscript
[graphscript-status]: https://img.shields.io/npm/v/graphscript

<!-- Integrated Editor-->
[@brainsatplay/studio]: https://github.com/brainsatplay/studio
[@brainsatplay/studio-status]: https://img.shields.io/npm/v/@brainsatplay/studio

<!-- Low Code Programming System-->
[visualscript]: https://github.com/brainsatplay/visualscript
[visualscript-status]: https://img.shields.io/npm/v/visualscript


<!-- Data Acquisition-->
[datastreams-api]: https://github.com/brainsatplay/datastreams-api
[datastreams-api-status]: https://img.shields.io/npm/v/datastreams-api.svg

<!-- Build Tool-->
[tinybuild]: https://github.com/brainsatplay/tinybuild
[tinybuild-status]: https://img.shields.io/npm/v/tinybuild

<!-- Plugin Registry -->
[@brainsatplay/plugins]: https://github.com/brainsatplay/plugins
[@brainsatplay/plugins-status]: https://img.shields.io/npm/v/@brainsatplay/plugins