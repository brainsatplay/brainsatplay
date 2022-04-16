# brainsatplay-cli
 Brains@Play's Command Line Interface

## Design Notes
Users can specify:
1. Project Type
    - Certain projects can add (1) a template documentation website, a (2) configurable backend where services can be specified from the cli, and (3) how the project will be built (e.g. for desktop / mobile as a PWA or Electron app)
    - This will **download the appropriate template repository off of Github**
2. Project Name

## Inspiration
**PWA:** https://web.dev/window-controls-overlay/

### Roadmap
1. Clone project repos from Github
2. Create a server admin cli to update a server on the fly
3. Construct a functional PWA
4. Spawn a visualization that creates code in real-time.
 - Write functional elements
 - Compose functional elements
5. Publish repo to GitHub
6. Deploy application

## Getting Started
### Installation
``` bash
npm i -g
```

### Usage
#### List All Commands
``` bash
brainatplay
```

#### Create Project (WIP)
``` bash
brainatplay create --name my-library --type library
