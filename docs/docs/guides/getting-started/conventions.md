---
sidebar_position: 2
title: Conventions
---

##  Modules
A **module** is an ESM file that contains one default export and named exports that are used to provide additional metadata about the usage of the former.

:::info

1. **Any default export should be a function**—ideally stateless.
2. **Named exports should be modifiers** for this function, consistent with the [WASL](../libraries/wasl/index.md) standard.

:::

```javascript title="hello.js"
export default (message="world") => console.log(`hello ${message}!`)
```

## Plugins
A **plugin** is specified by a `[name].wasl.json` file and accompanied by a `package.json` file, which may use its `main` field to specify an exposed library—composed of **modules**—for distribution on Node Package Manager (NPM).

:::tip 

When exposing the default export of each **module**, the exposed library functions will only work properly if **all functions are stateless** and don't require access to additional variables in the module files.

:::

### Native vs. Remix
**Native plugins** contain all of their logic internally.

``` javascript
// self-contained logic
export default (message="world") => console.log(`hello ${message}!`)
```

**Remix plugins** adapt existing NPM libraries by wrapping their essential classes and function calls.

``` javascript
// external library usage
import * as graphscript from 'https://cdn.jsdelivr.net/npm/graphscript/dist/index.esm.js'
const graph = new graphscript.Graph({
    operator: (message="world") => console.log(`hello ${message}!`)
})

// encapsulated library object
export default () => graph.run('world')
```

## Graphs
A **graph** is a connected set of **plugins** that pass messages between each other. 

:::info 
Although specified in the WASL standard, these are *not* handled by the [wasl](../libraries/wasl/index.md) library itself. Instead, **graphs** are assembled by external libraries such as [graphscript](../libraries/graphscript/index.md).
:::