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

Defined in: [src/Session.js:69](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L69)

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

Defined in: [src/Session.js:360](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L360)

▸ **addAnalysisMode**(`mode?`: *string*, `deviceName?`: *any*, `n?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | *string* | '' |
| `deviceName` | *any* | - |
| `n` | *number* | 0 |

**Returns:** *void*

Defined in: [src/Session.js:470](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L470)

___

### addAnalyzerFunc

▸ **addAnalyzerFunc**(`prop?`: *any*, `callback?`: () => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `prop` | *any* | null |
| `callback` | () => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:485](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L485)

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

Defined in: [src/Session.js:527](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L527)

___

### addStreamParams

▸ **addStreamParams**(`params?`: *any*[]): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `params` | *any*[] | [] |

**Returns:** *void*

Defined in: [src/Session.js:534](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L534)

___

### beginStream

▸ **beginStream**(`streamParams?`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamParams` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:332](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L332)

___

### checkPathname

▸ **checkPathname**(`pathname`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathname` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1262](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1262)

___

### checkURL

▸ **checkURL**(`url`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1255](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1255)

___

### closeSocket

▸ **closeSocket**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:1237](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1237)

___

### configureStreamForGame

▸ **configureStreamForGame**(`deviceTypes?`: *any*[], `streamParams?`: *any*[]): *boolean*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceTypes` | *any*[] | [] |
| `streamParams` | *any*[] | [] |

**Returns:** *boolean*

Defined in: [src/Session.js:1167](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1167)

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

Defined in: [src/Session.js:155](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L155)

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

Defined in: [src/Session.js:247](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L247)

___

### endStream

▸ **endStream**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:340](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L340)

___

### getApp

▸ **getApp**(): *App*<DefaultFunctionsFactory, any\>

**Returns:** *App*<DefaultFunctionsFactory, any\>

Defined in: [src/Session.js:560](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L560)

___

### getBrainstormData

▸ **getBrainstormData**(`name`: *any*): *any*[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | *any* |

**Returns:** *any*[]

Defined in: [src/Session.js:1122](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1122)

___

### getDevice

▸ **getDevice**(`deviceNameOrType?`: *string*, `deviceIdx?`: *number*): *undefined*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceNameOrType` | *string* | 'freeeeg32\_2' |
| `deviceIdx` | *number* | 0 |

**Returns:** *undefined*

Defined in: [src/Session.js:345](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L345)

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

Defined in: [src/Session.js:393](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L393)

___

### getGames

▸ **getGames**(`appname?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `appname` | *string* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:820](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L820)

___

### getStreamData

▸ **getStreamData**(`userOrAppname?`: *string*, `propname?`: *any*): *object*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `userOrAppname` | *string* | '' |
| `propname` | *any* | null |

**Returns:** *object*

Defined in: [src/Session.js:405](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L405)

___

### insertMultiplayerIntro

▸ **insertMultiplayerIntro**(`applet`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `applet` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:904](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L904)

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

Defined in: [src/Session.js:1149](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1149)

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

Defined in: [src/Session.js:577](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L577)

___

### loginWithGoogle

▸ **loginWithGoogle**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:564](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L564)

___

### loginWithRealm

▸ **loginWithRealm**(`authResponse`: *any*): *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `authResponse` | *any* |

**Returns:** *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

Defined in: [src/Session.js:568](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L568)

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

Defined in: [src/Session.js:262](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L262)

___

### onconnected

▸ **onconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:223](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L223)

___

### onconnectionLost

▸ **onconnectionLost**(`response`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:1241](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1241)

___

### ondisconnected

▸ **ondisconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:225](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L225)

___

### processSocketMessage

▸ **processSocketMessage**(`received?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `received` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:651](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L651)

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

Defined in: [src/Session.js:234](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L234)

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

Defined in: [src/Session.js:620](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L620)

___

### sendWSCommand

▸ **sendWSCommand**(`command?`: *string*, `dict?`: {}): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `command` | *string* | '' |
| `dict` | *object* | {} |

**Returns:** *void*

Defined in: [src/Session.js:1227](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L1227)

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

Defined in: [src/Session.js:134](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L134)

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

Defined in: [src/Session.js:727](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L727)

___

### signup

▸ **signup**(`dict?`: {}, `baseURL?`: *string*): *Promise*<any\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dict` | *object* | {} |
| `baseURL` | *string* | - |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:594](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L594)

___

### stopAnalysis

▸ **stopAnalysis**(`name?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:377](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L377)

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

Defined in: [src/Session.js:500](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L500)

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

Defined in: [src/Session.js:424](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L424)

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

Defined in: [src/Session.js:843](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L843)

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

Defined in: [src/Session.js:771](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L771)

___

### unsubscribe

▸ **unsubscribe**(`tag?`: *string*, `sub`: *any*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |
| `sub` | *any* | - |

**Returns:** *void*

Defined in: [src/Session.js:461](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L461)

___

### unsubscribeAll

▸ **unsubscribeAll**(`tag?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |

**Returns:** *void*

Defined in: [src/Session.js:466](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L466)

___

### unsubscribeFromGame

▸ **unsubscribeFromGame**(`gameId?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `gameId` | *string* | '' |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:884](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L884)

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

Defined in: [src/Session.js:801](https://github.com/brainsatplay/brainsatplay/blob/d0b2a85/src/library/src/Session.js#L801)
