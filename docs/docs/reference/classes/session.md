---
id: "session"
title: "Class: Session"
sidebar_label: "Session"
sidebar_position: 0
custom_edit_url: null
---

# Class: Session

```javascript
import {Session} from 'brainsatplay'
```

## Constructors

### constructor

\+ **new Session**(`username?`: *string*, `password?`: *string*, `appname?`: *string*, `access?`: *string*, `remoteHostURL?`: *string*, `localHostURL?`: *string*): [*Session*](session.md)

```javascript
let session = new Session();
```

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `password` | *string* | '' |
| `appname` | *string* | '' |
| `access` | *string* | 'public' |
| `remoteHostURL` | *string* | 'http://server.brainsatplay.com' |
| `localHostURL` | *string* | 'http://localhost:8000' |

**Returns:** [*Session*](session.md)

Defined in: [src/Session.js:69](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L69)

## Properties

### atlas

• **atlas**: *DataAtlas*

___

### devices

• **devices**: *any*[]

___

### info

• **info**: *object*

#### Type declaration

| Name | Type |
| :------ | :------ |
| `auth` | *object* |
| `auth.access` | *string* |
| `auth.appname` | *string* |
| `auth.authenticated` | *boolean* |
| `auth.password` | *string* |
| `auth.url` | URL |
| `auth.username` | *string* |
| `connections` | *never*[] |
| `localHostURL` | *string* |
| `nDevices` | *number* |
| `remoteHostURL` | *string* |
| `subscribed` | *boolean* |

___

### socket

• **socket**: *undefined* \| ``null`` \| WebSocket

___

### state

• **state**: *StateManager*

___

### streamObj

• **streamObj**: *streamSession*

___

### subscribed

• **subscribed**: *undefined* \| *boolean*

## Methods

### addAnalysisMode

▸ **addAnalysisMode**(`name?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:363](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L363)

▸ **addAnalysisMode**(`mode?`: *string*, `deviceName?`: *any*, `n?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | *string* | '' |
| `deviceName` | *any* | - |
| `n` | *number* | 0 |

**Returns:** *void*

Defined in: [src/Session.js:473](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L473)

___

### addAnalyzerFunc

▸ **addAnalyzerFunc**(`prop?`: *any*, `callback?`: () => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `prop` | *any* | null |
| `callback` | () => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:488](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L488)

___

### addStreamFunc

▸ **addStreamFunc**(`name`: *any*, `callback`: *any*, `idx?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | *any* | - |
| `callback` | *any* | - |
| `idx` | *number* | 0 |

**Returns:** *void*

Defined in: [src/Session.js:530](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L530)

___

### addStreamParams

▸ **addStreamParams**(`params?`: *any*[]): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `params` | *any*[] | [] |

**Returns:** *void*

Defined in: [src/Session.js:537](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L537)

___

### beginStream

▸ **beginStream**(`streamParams?`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamParams` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:335](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L335)

___

### checkPathname

▸ **checkPathname**(`pathname`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathname` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1275](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1275)

___

### checkURL

▸ **checkURL**(`url`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1268](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1268)

___

### closeSocket

▸ **closeSocket**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:1250](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1250)

___

### configureStreamForGame

▸ **configureStreamForGame**(`deviceTypes?`: *any*[], `streamParams?`: *any*[]): *boolean*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceTypes` | *any*[] | [] |
| `streamParams` | *any*[] | [] |

**Returns:** *boolean*

Defined in: [src/Session.js:1180](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1180)

___

### connect

▸ **connect**(`device?`: *string*, `analysis?`: *any*, `onconnect?`: *any*, `ondisconnect?`: *any*, `streaming?`: *boolean*, `streamParams?`: *any*, `useFilters?`: *boolean*, `pipeToAtlas?`: *boolean*): *undefined* \| ``false``

**`method`** module:brainsatplay.Session.setLoginInfo

**`description`** Connect local device and add it. Use [reconnect()]{@link module:brainsatplay.Session.reconnect} if disconnecting and reconnecting device in same session.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `device` | *string* | "freeeeg32\_2" | "freeeeg32", "freeeeg32_19", "muse", "notion" |
| `analysis` | *any* | - | "eegfft", "eegcoherence", etc |
| `onconnect` | *any* | - | Callback function on device connection. Subscribe to device outputs after connection completed. |
| `ondisconnect` | *any* | - | Callback function on device disconnection. Unsubscribe from outputs after device is disconnected. |
| `streaming` | *boolean* | false | Set to stream to server (must be connected) |
| `streamParams` | *any* | [] | e.g. [['eegch','FP1','all']] |
| `useFilters` | *boolean* | true | Filter device output if it needs filtering (some hardware already applies filters so we may skip those). |
| `pipeToAtlas` | *boolean* | true | Send data to atlas. |

**Returns:** *undefined* \| ``false``

Defined in: [src/Session.js:155](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L155)

___

### disconnect

▸ **disconnect**(`deviceIdx?`: *any*, `ondisconnect?`: *any*): *void*

**`method`** module:brainsatplay.Session.disconnect

**`description`** Disconnect local device.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deviceIdx` | *any* | Index of device. |
| `ondisconnect` | *any* | Callback function on device disconnection. |

**Returns:** *void*

Defined in: [src/Session.js:248](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L248)

___

### endStream

▸ **endStream**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:343](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L343)

___

### getApp

▸ **getApp**(): *App*<DefaultFunctionsFactory, any\>

**Returns:** *App*<DefaultFunctionsFactory, any\>

Defined in: [src/Session.js:563](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L563)

___

### getBrainstormData

▸ **getBrainstormData**(`name`: *any*): *any*[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | *any* |

**Returns:** *any*[]

Defined in: [src/Session.js:1135](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1135)

___

### getDevice

▸ **getDevice**(`deviceNameOrType?`: *string*, `deviceIdx?`: *number*): *undefined*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceNameOrType` | *string* | 'freeeeg32\_2' |
| `deviceIdx` | *number* | 0 |

**Returns:** *undefined*

Defined in: [src/Session.js:348](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L348)

___

### getDeviceData

▸ **getDeviceData**(`deviceType?`: *string*, `tag?`: *string*, `deviceIdx?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceType` | *string* | 'eeg' |
| `tag` | *string* | 'all' |
| `deviceIdx` | *number* | 0 |

**Returns:** *void*

Defined in: [src/Session.js:396](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L396)

___

### getGames

▸ **getGames**(`appname?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `appname` | *string* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:823](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L823)

___

### getStreamData

▸ **getStreamData**(`userOrAppname?`: *string*, `propname?`: *any*): *object*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `userOrAppname` | *string* | '' |
| `propname` | *any* | null |

**Returns:** *object*

Defined in: [src/Session.js:408](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L408)

___

### insertMultiplayerIntro

▸ **insertMultiplayerIntro**(`applet`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `applet` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:907](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L907)

___

### kickPlayerFromGame

▸ **kickPlayerFromGame**(`gameId`: *any*, `userToKick`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `gameId` | *any* |
| `userToKick` | *any* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:1162](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1162)

___

### login

▸ **login**(`beginStream?`: *boolean*, `dict?`: { `access`: *string* ; `appname`: *string* ; `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }, `baseURL?`: *string*): *Promise*<undefined \| WebSocket\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `beginStream` | *boolean* | false |
| `dict` | *object* | - |
| `dict.access` | *string* | - |
| `dict.appname` | *string* | - |
| `dict.authenticated` | *boolean* | false |
| `dict.password` | *string* | - |
| `dict.url` | URL | - |
| `dict.username` | *string* | - |
| `baseURL` | *string* | - |

**Returns:** *Promise*<undefined \| WebSocket\>

Defined in: [src/Session.js:580](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L580)

___

### loginWithGoogle

▸ **loginWithGoogle**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:567](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L567)

___

### loginWithRealm

▸ **loginWithRealm**(`authResponse`: *any*): *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `authResponse` | *any* |

**Returns:** *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

Defined in: [src/Session.js:571](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L571)

___

### makeConnectOptions

▸ **makeConnectOptions**(`parentNode?`: HTMLElement, `onconnect?`: *any*, `ondisconnect?`: *any*): *void*

**`method`** module:brainsatplay.Session.makeConnectOptions

**`description`** Generate DOM fragment with a selector for available devices.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `parentNode` | HTMLElement | Parent node to insert fragment into. |
| `onconnect` | *any* | Callback function on device connection. |
| `ondisconnect` | *any* | Callback function on device disconnection. |

**Returns:** *void*

Defined in: [src/Session.js:263](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L263)

___

### onconnected

▸ **onconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:224](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L224)

___

### onconnectionLost

▸ **onconnectionLost**(`response`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:1254](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1254)

___

### ondisconnected

▸ **ondisconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:226](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L226)

___

### processSocketMessage

▸ **processSocketMessage**(`received?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `received` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:654](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L654)

___

### reconnect

▸ **reconnect**(`deviceIdx?`: *any*, `onconnect?`: *any*): *void*

**`method`** module:brainsatplay.Session.reconnect

**`description`** Reconnect a device that has already been added.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deviceIdx` | *any* | Index of device. |
| `onconnect` | *any* | Callback function on device reconnection. |

**Returns:** *void*

Defined in: [src/Session.js:235](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L235)

___

### request

▸ **request**(`body`: *any*, `method?`: *string*, `pathname?`: *string*, `baseURL?`: *string*): *Promise*<any\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `body` | *any* | - |
| `method` | *string* | "POST" |
| `pathname` | *string* | '' |
| `baseURL` | *string* | - |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:623](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L623)

___

### sendWSCommand

▸ **sendWSCommand**(`command?`: *string*, `dict?`: {}): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `command` | *string* | '' |
| `dict` | *object* | {} |

**Returns:** *void*

Defined in: [src/Session.js:1240](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L1240)

___

### setLoginInfo

▸ **setLoginInfo**(`username?`: *string*, `password?`: *string*, `access?`: *string*, `appname?`: *string*): *void*

**`method`** module:brainsatplay.Session.setLoginInfo

**`description`** Set user information.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `username` | *string* | '' | Username. |
| `password` | *string* | '' | Password. |
| `access` | *string* | 'public' | Access level ('public' or 'private'). |
| `appname` | *string* | '' | Name of the app. |

**Returns:** *void*

Defined in: [src/Session.js:134](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L134)

___

### setupWebSocket

▸ **setupWebSocket**(`auth?`: { `access`: *string* ; `appname`: *string* ; `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }): *undefined* \| WebSocket

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `auth` | *object* | - |
| `auth.access` | *string* | - |
| `auth.appname` | *string* | - |
| `auth.authenticated` | *boolean* | false |
| `auth.password` | *string* | - |
| `auth.url` | URL | - |
| `auth.username` | *string* | - |

**Returns:** *undefined* \| WebSocket

Defined in: [src/Session.js:730](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L730)

___

### signup

▸ **signup**(`dict?`: {}, `baseURL?`: *string*): *Promise*<any\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dict` | *object* | {} |
| `baseURL` | *string* | - |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:597](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L597)

___

### stopAnalysis

▸ **stopAnalysis**(`name?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:380](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L380)

___

### streamAppData

▸ **streamAppData**(`propname?`: *string*, `props?`: {}, `onData?`: (`newData`: *any*) => *void*): *string*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `propname` | *string* | 'data' |
| `props` | *object* | {} |
| `onData` | (`newData`: *any*) => *void* | - |

**Returns:** *string*

Defined in: [src/Session.js:503](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L503)

___

### subscribe

▸ **subscribe**(`deviceName?`: *string*, `tag?`: *string*, `prop?`: *any*, `onData?`: (`newData`: *any*) => *void*): *undefined*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceName` | *string* | 'eeg' |
| `tag` | *string* | 'FP1' |
| `prop` | *any* | null |
| `onData` | (`newData`: *any*) => *void* | - |

**Returns:** *undefined*

Defined in: [src/Session.js:427](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L427)

___

### subscribeToGame

▸ **subscribeToGame**(`gameid?`: *string*, `spectating?`: *boolean*, `userToSubscribe?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `gameid` | *string* | - |
| `spectating` | *boolean* | false |
| `userToSubscribe` | *string* | - |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:846](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L846)

___

### subscribeToUser

▸ **subscribeToUser**(`username?`: *string*, `userProps?`: *any*[], `userToSubscribe?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `userProps` | *any*[] | [] |
| `userToSubscribe` | *string* | - |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:774](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L774)

___

### unsubscribe

▸ **unsubscribe**(`tag?`: *string*, `sub`: *any*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |
| `sub` | *any* | - |

**Returns:** *void*

Defined in: [src/Session.js:464](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L464)

___

### unsubscribeAll

▸ **unsubscribeAll**(`tag?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |

**Returns:** *void*

Defined in: [src/Session.js:469](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L469)

___

### unsubscribeFromGame

▸ **unsubscribeFromGame**(`gameId?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `gameId` | *string* | '' |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:887](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L887)

___

### unsubscribeFromUser

▸ **unsubscribeFromUser**(`username?`: *string*, `userProps?`: *any*, `userToUnsubscribe?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `userProps` | *any* | null |
| `userToUnsubscribe` | *string* | - |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:804](https://github.com/brainsatplay/brainsatplay/blob/4241160/src/library/src/Session.js#L804)
