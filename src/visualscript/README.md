# visualscript
Visual Reactive Programming with Web Components

> **Note:** This project is still in the **proposal** phase. Do not expect everything to work—and let us know if you'd like to contribute!

## Basic Usage
```html
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/brainsatplay-ui/"></script>
</head>
    <body></body>
    <script>
        const nav = new components.Nav({
            brand: {content: 'My Brand'},
            primary: {
                menu: [{content: 'Page 1'}, {content: 'Page 2'}],
                options: [{content: 'Log In'}]
            },
            secondary: [
                {content: 'Subdomain 1'},
                {content: 'Subdomain 2'},
                {content: 'Action', type:'button'}
            ],
        })
        document.body.insertAdjacentElement('afterbegin', nav)

    </script>
```

## Concepts
### Process
The entire `visualscript` framework is based on nested **Processes**.

### Editor
*Coming soon...*

### Controls
*Coming soon...*

### Events
*Coming soon...*


## Known Bugs
- Adding a Tab (insantiated as a class) to Main will not register on the TabBar
    - There seems to be no `#shadow-root` contained in the Tab.


## Roadmap
1. Control Panel
    - Device Connection / Management + Playground
    - Multiplayer Session Management
    - File Viewer
2. Everything on https://web-components.carbondesignsystem.com/?path=/story/components-accordion--default
3. Support interative, [notebook-like](https://github.com/gzuidhof/starboard-notebook) programming


