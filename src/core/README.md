# brainsatplay
[![Discord](https://img.shields.io/badge/chat-discord-7289da.svg?sanitize=true)](https://discord.gg/CDxskSh9ZB)

`brainsatplay` is a framework for quickly assembling interactive, high-performance web applications.

## Benefits
🔮 **Low Code:** Our browser-based [editor] makes it easy to wire together your application logic using the [visualscript] library.

🧩 **Familiar:** We don't lock users into unnecessary abstractions. Just format code files as ES Modules!

⚡ **Performant:** High-performance event-based logic using the [graphscript] library.

🌐 **Social:** Derivative plugins can be published as NPM packages and registered on the [plugins] library to be shared with the world.

📜 **Radically Open:** This library is licensed under the AGPL license. All derivatives are also free and open-source software!

## Getting Started
### Core Concepts
#### Plugins
**Plugins** are class-like objects that can be reused across applications. 
To change the plugins that are exported from your application, edit the file specified in the `main` field of your root `package.json` file.  

> **Note:** This is what is visualized by the Files tab of the `brainsatplay-editor`.

Our plugin system has been optimized for you to publish your creations as NPM packages to remain compatible with vanilla JavaScript applications.

To be editable by `brainsatplay.editable` classes, you must have your source code accessible from Github, NPM, or other locations.

##### Metadata
Information about the plugin is jointly specified by the closest `package.json` file and the associated `.brainsatplay/[filename].metadata.json` file.

###### Keys
- type: Browser / Node / Universal
- capabilities: Input / Output / Both
- modalities: Audio / Haptic / Graphic / Network / Ambient
- ui: URL or relative reference

#### Nodes
**Nodes** are plugin instances that are created for a specific application. To change the nodes that are instantiated, edit the `nodes` field in the relevant `.brainsatplay/[filename].graph.json` file.

> **Note:** This is what is visualized by the Properties tab of the `brainsatplay-editor` (coming soon...).

#### Application Logic
 To change the logic of your application, edit the **edges** field in the relevant `.brainsatplay/[filename].graph.json` file.

> **Note:** This is what is visualized by the Graph tab of the `brainsatplay-editor`.

## Roadmap
♿ **Inclusive:** Extend [visualscript] to become a fully accessible visual programming system. Use the [accessify] library to guarantee accessibility support for resulting applications through multimodal I/O support.

📡 **Backend Support:** Edit workspaces running in Node.js, local or the cloud.

## Contributing Guidelines
If you've created a plugin for [brainsatplay], make sure to link to the source `package.json` file with a pull request to [plugins].

[brainsatplay]: https://github.com/brainsatplay/brainsatplay
[plugins]: https://github.com/brainsatplay/plugins
[graphscript]: https://github.com/brainsatplay/graphscript
[visualscript]: https://github.com/brainsatplay/visualscript
[editor]: https://github.com/brainsatplay/editor
[accessify]: https://github.com/brainsatplay/accessify
