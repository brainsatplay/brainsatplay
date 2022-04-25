---
sidebar_position: 1
title: Introduction
---
# Introduction

## What is Brains@Play?
`brainsatplay` is a concurrency framework for interactive, high-performance applications controlled by the browser. It gives you [Sockets](./guides/basic/sockets) that carry messages across various transport protocols, as well as [Graphs](./guides/basic/graphs) that can be dynamically modified at runtime. You may also integrate software written for other environments such as Node.js, Python, or C++. 

This framework is [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html) and maintained by [Brains@Play](https://brainsatplay.com).

:::note

This documentation was heavily inspired by [ØMQ - The Guide](https://zguide.zeromq.org/docs/preface/).

:::

## How It Began
We took the latest latest APIs for data acquisition (e.g. Web Bluetooth, Web Serial, etc.) and developed a way to process and forward data as fast as possible. 

We believe that physiological signals represent the next frontier of interactive programming—beyond traditional events such as mouse movements and button presses.

## Playing with Code
The **play** in `brainsatplay` embodies our desire to support the joy of developers as they create high-performance code. It encompasses many different goals including **first-class TypeScript support**, a focus on **inspectability and interactivity**, and **accessibility** for use by everyone with a brain. 

More generally, play refers to the culture of rapid prototyping that permeates the project by extending functionality from simple components rather than adding unneccesary complexity.


## Audience
This documentation is written for **programmers who care about the agency of their users**. We assume that you can read JavaScript code—as all of the examples here are written for the Browser (specifically the latest Chromium browsers) or Node. Other than that basic background, we try to present all the concepts you will need to use `brainsatplay`.