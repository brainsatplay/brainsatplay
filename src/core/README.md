# brainsatplay
A framework for modular JavaScript applications

**brainsatplay** is a framework for writing modular JavaScript applications. Let's develop web apps in a standardized format!

## Introduction
### Plugins
Edit the **plugins** linked to the `[filename].plugins.json` files and the main entrypoint specified in `package.json`.  

> **Note:** This is what is visualized by the Files tab of the `brainsatplay-editor`.

### Nodes (i.e. plugin instances)
Edit the **nodes** field in `[filename].graph.json` files.

> **Note:** This is what is visualized by the Properties tab of the `brainsatplay-editor` (coming soon...).

### Application Logic
Edit the **edges** field in `[filename].graph.json` files.

> **Note:** This is what is visualized by the Graph tab of the `brainsatplay-editor`.

## Getting Started 
> **Note:** Classes within the `src/editable` directory require the [freerange](https://github.com/brainsatplay/freerange) library to function appropriately.