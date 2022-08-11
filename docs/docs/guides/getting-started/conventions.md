---
sidebar_position: 2
---

## Glossary
### Modules
A **module** is an ESM file that contains a default export (Function) and named exports that are used to provide additional instructions about using the default export.

::: note 

1. Default exports should be Functions
2. Named exports should be modifiers for this function

:::

### Plugins
A **plugin** is a collection of one or more **modules** indexed with a `package.json` file (for NPM distribution) and accompanied with an `index.wasl` file (to specify module assembly).

::: note 

1. The default export should be a `package` and a `graph` object
2. Named exports should be imported modules

:::


#### Native vs. Encapsulated
Native **plugins** contain all of their logic internally.

``` javascript
// self-contained logic
export default () => console.log('hello world')
```

Encapsulated **plugins** warp existing NPM libraries.

``` javascript
// external library usage
import * as graphscript from 'https://cdn.jsdelivr.net/npm/graphscript/dist/index.esm.js'
const graph = new graphscript.Graph({
    operator: () => console.log('hello world')
})

// encapsulated library object
export default () => graph.run()
```

#### NPM Compatibility
We expect that users may want to publish their brainsatplay plugins to NPM. To do so, simply export the default functions to the file specified in the `main` field of your `package.json` file.

::: warning 

These exports will only work properly if you've declared stateless functions that don't require end-users to access additional variables in the ESM file.

:::


### Graphs
A **graph** is an active set of plugins that pass messages between each other.