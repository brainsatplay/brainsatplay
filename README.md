
# brainsatplay
[![AGPLv3 License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/npm/v/brainsatplay.svg?sanitize=true)](https://www.npmjs.com/package/brainsatplay)
[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

**brainsatplay** is a reliable high-performance computing framework for the Open Web.

> **Note:** While this repository currently contains a large number of utilities used in our pre-alpha [**platform**](https://github.com/brainsatplay/platform), we're working on the generalization of these utilities into their own separate repositories. As it stands, we plan to replace this repository with the contents of [**liveserver**](https://github.com/brainsatplay/liveserver) to highlight our core innovations in high-performance computing on the browser.

## Use-Case
If your project is a **progressive web app** that **analyzes real-time data streams or large amounts of data** and **displays frontend code that changes intermittently in response to computational outputs**, consider using **brainsatplay** to manage your computational workflows.

### Example
You have 32 channels of EEG data streaming over Web Serial and need to compute FFTs in real-time without impacting an animation that is changing to the beta band.

> **Todo:** Insert a benchmark of the BCI performance on the frontend and all your available networking schemes.

## Features
- Simple threading and offloading framework
- Support for the Data Capture and Streams API
- Hooks for frontend code to respond to data

## Documentation
To check out live examples and documentation, visit [docs.brainsatplay.com](https://docs.brainsatplay.com/docs/intro).

## Support
If you have questions about developing with Brains@Play, feel free to start a conversation on [Discord](https://discord.gg/tQ8P79tw8j) or reach out directly to our team at [contact@brainsatplay.com](mailto:contact@brainsatplay.com).

The issue list of this repo is exclusively for bug reports and feature requests.

## Changelog
Detailed changes for each release will be documented in the [release notes](https://github.com/brainsatplay/brainsatplay/releases).

## Contribution
It's a free for all for now. More guidelines to come. Thank you to all the people who already contributed to **brainsatplay**!

If you have a **brainsatplay**-related project, add it with a pull request to [this curated list](https://github.com/brainsatplay/awesome-brainsatplay!)
