---
sidebar_position: 2
---

# Glossary
### Module
An ESM file that contains a default export (Function) and named exports that are used to provide additional instructions about using the default export.

### Plugin
A collection of one or more **modules** indexed with a `package.json` file (for NPM distribution) and accompanied with an `index.wasl` file (to specify module assembly).

### Graph
An active set of plugins that pass messages between each other.

# Conventions
1. Default exports should be Functions
2. Named exports should be modifiers for this function