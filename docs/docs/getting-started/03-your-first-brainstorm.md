---
sidebar_position: 3
---

# Your First Brainstorm

This tutorial will get you started building your first networked application with brainsatplay.js! 

## Welcome to The Brainstorm
### Add a Welcome Screen
``` javascript
constructor(){
    ...
    //-------Required Multiplayer Properties------- 
    this.subtitle = 'My First Brainstorm'
    this.streams = ['coherence']
    //----------------------------------------------
    ...
}

init(){
    ...
    //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
    let setupHTML = (props=this.props) => {
        this.session.insertMultiplayerIntro(this)
    }
    ...
}
```
## Listen to the Brainstorm
Instead of checking your **Data Atlas** inside the `animate()` function, you'll now iterate through data in `this.session.state.data`.

``` javascript
init() {

    // ...

    let animate = () => {
        let streamInfo = this.session.state.data?.commandResult
        if (streamInfo.userData != null && streamInfo.userData.length !== 0 && Array.isArray(streamInfo.userData)){
            streamInfo.userData.forEach((userData)=> {
                console.log(userData)
            })
        } 
        requestAnimationFrame(animate)
    }

    animate()
}
```

## Adding a Stream Function
In some cases, you'll want to automatically compute and stream new values to the Brainstorm. To do this, add a custom streaming function using `this.session.addStreamFunc()`. 

For this example, you'll want to transfer your alpha coherence calculations from the `animate()` loop to `this.session.addStreamFunc()`

``` javascript
    this.session.addStreamFunc(
        'coherence', 
        () => {
            return this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')
        }
    )
```

## Streaming App States
Game states can also be streamed over the Brainstorm. To do this, you'll have to track your states within a Javascript object.

### Track App States
``` javascript
constructor(){
    ...
    this.stateIds = []
    this.appStates = {
        spacebar: false
    } // name whatever you want
}

deinit(){
    this.stateIds.forEach(id => {
        this.session.state.unsubscribeAll(id);
    })
    this.AppletHTML.deleteNode();
}
```

### Add States to App Stream
Move your alpha coherence calculations out of the `animate()` loop and assign to a custom stream function using `this.session.addStreamFunc`.


``` javascript
    this.stateIds.push(this.session.streamAppData('appStates', this.appStates,(newData) => {}))
```

Now you can change the `appStates` variable and it will be automatically updated in the app stream.

``` javascript
document.addEventListener('keydown',(k => {
    if (k.code === 'Space' && this.appStates.spacebar != true) this.appStates.spacebar = true
}))

document.addEventListener('keyup',(k => {
    if (k.code === 'Space') this.appStates.spacebar = false
}))
```

## Conclusion

You should now have an applet that logs (1) frontal coherence and (2) spacebar clicks from any user connected to the Brainstorm!