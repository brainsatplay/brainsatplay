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

\+ **new Session**(`username?`: *string*, `password?`: *string*, `urlToConnect?`: *string*): [*Session*](session.md)

```javascript
let session = new Session();
```

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `password` | *string* | '' |
| `urlToConnect` | *string* | 'http://localhost' |

**Returns:** [*Session*](session.md)

Defined in: [src/Session.js:65](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L65)

## Properties

### atlas

• **atlas**: *DataAtlas*

___

### deviceStreams

• **deviceStreams**: *any*[]

___

### id

• **id**: *number*

___

### info

• **info**: *object*

#### Type declaration

| Name | Type |
| :------ | :------ |
| `auth` | *object* |
| `auth.authenticated` | *boolean* |
| `auth.password` | *string* |
| `auth.url` | URL |
| `auth.username` | *string* |
| `nDevices` | *number* |
| `subscribed` | *boolean* |
| `subscriptions` | *never*[] |

___

### socket

• **socket**: *any*

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

Defined in: [src/Session.js:442](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L442)

▸ **addAnalysisMode**(`mode?`: *string*, `deviceName?`: *any*, `n?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `mode` | *string* | '' |
| `deviceName` | *any* | - |
| `n` | *number* | 0 |

**Returns:** *void*

Defined in: [src/Session.js:552](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L552)

___

### addAnalyzerFunc

▸ **addAnalyzerFunc**(`prop?`: *any*, `callback?`: () => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `prop` | *any* | null |
| `callback` | () => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:567](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L567)

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

Defined in: [src/Session.js:609](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L609)

___

### addStreamParams

▸ **addStreamParams**(`params?`: *any*[]): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `params` | *any*[] | [] |

**Returns:** *void*

Defined in: [src/Session.js:616](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L616)

___

### beginStream

▸ **beginStream**(`streamParams?`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `streamParams` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:414](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L414)

___

### checkPathname

▸ **checkPathname**(`pathname`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathname` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1698](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1698)

___

### checkURL

▸ **checkURL**(`url`: *any*): *any*

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | *any* |

**Returns:** *any*

Defined in: [src/Session.js:1691](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1691)

___

### closeSocket

▸ **closeSocket**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:1673](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1673)

___

### configureStreamForSession

▸ **configureStreamForSession**(`deviceTypes?`: *any*[], `streamParams?`: *any*[]): *boolean*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceTypes` | *any*[] | [] |
| `streamParams` | *any*[] | [] |

**Returns:** *boolean*

Defined in: [src/Session.js:1576](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1576)

___

### connect

▸ **connect**(`device?`: *string*, `analysis?`: *any*, `onconnect?`: *any*, `ondisconnect?`: *any*, `streaming?`: *boolean*, `streamParams?`: *any*, `useFilters?`: *boolean*, `pipeToAtlas?`: *boolean*): *Promise*<undefined \| ``false``\>

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

**Returns:** *Promise*<undefined \| ``false``\>

Defined in: [src/Session.js:139](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L139)

___

### createBrainstormBrowser

▸ **createBrainstormBrowser**(`parentNode?`: HTMLElement, `onsubscribe?`: () => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `parentNode` | HTMLElement |
| `onsubscribe` | () => *void* |

**Returns:** *void*

Defined in: [src/Session.js:1141](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1141)

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

Defined in: [src/Session.js:246](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L246)

___

### endStream

▸ **endStream**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:422](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L422)

___

### getApp

▸ **getApp**(): *App*<DefaultFunctionsFactory, any\>

**Returns:** *App*<DefaultFunctionsFactory, any\>

Defined in: [src/Session.js:642](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L642)

___

### getBrainstormData

▸ **getBrainstormData**(`value`: *any*, `type?`: *string*): *any*[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `value` | *any* | - |
| `type` | *string* | 'app' |

**Returns:** *any*[]

Defined in: [src/Session.js:1506](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1506)

___

### getDevice

▸ **getDevice**(`deviceNameOrType?`: *string*, `deviceIdx?`: *number*): *undefined*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `deviceNameOrType` | *string* | 'FreeEEG32\_2' |
| `deviceIdx` | *number* | 0 |

**Returns:** *undefined*

Defined in: [src/Session.js:427](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L427)

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

Defined in: [src/Session.js:475](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L475)

___

### getSessions

▸ **getSessions**(`appname`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `appname` | *any* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:976](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L976)

___

### getStreamData

▸ **getStreamData**(`userOrAppname?`: *string*, `propname?`: *any*): *object*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `userOrAppname` | *string* | '' |
| `propname` | *any* | null |

**Returns:** *object*

Defined in: [src/Session.js:487](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L487)

___

### getUsers

▸ **getUsers**(`appname`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `appname` | *any* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:926](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L926)

___

### insertMultiplayerIntro

▸ **insertMultiplayerIntro**(`applet`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `applet` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:1286](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1286)

___

### kickUserFromSession

▸ **kickUserFromSession**(`sessionid`: *any*, `userToKick`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `sessionid` | *any* |
| `userToKick` | *any* |
| `onsuccess` | (`newResult`: *any*) => *void* |

**Returns:** *void*

Defined in: [src/Session.js:1558](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1558)

___

### login

▸ **login**(`beginStream?`: *boolean*, `dict?`: { `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }, `onsuccess?`: (`newResult`: *any*) => *void*): *Promise*<undefined \| { `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `beginStream` | *boolean* | false |
| `dict` | *object* | - |
| `dict.authenticated` | *boolean* | false |
| `dict.password` | *string* | - |
| `dict.url` | URL | - |
| `dict.username` | *string* | - |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *Promise*<undefined \| { `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }\>

Defined in: [src/Session.js:659](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L659)

___

### loginWithGoogle

▸ **loginWithGoogle**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:646](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L646)

___

### loginWithRealm

▸ **loginWithRealm**(`authResponse`: *any*): *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `authResponse` | *any* |

**Returns:** *Promise*<User<DefaultFunctionsFactory, any, DefaultUserProfileData\>\>

Defined in: [src/Session.js:650](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L650)

___

### makeConnectOptions

▸ **makeConnectOptions**(`parentNode?`: HTMLElement, `toggleButton?`: HTMLElement, `deviceFilter?`: *any*, `onconnect?`: *any*, `ondisconnect?`: *any*): *void*

**`method`** module:brainsatplay.Session.makeConnectOptions

**`description`** Generate DOM fragment with a selector for available devices.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `parentNode` | HTMLElement | - | Parent node to insert fragment into. |
| `toggleButton` | HTMLElement | null | Node of button to toggle |
| `deviceFilter` | *any* | null | - |
| `onconnect` | *any* | - | Callback function on device connection. |
| `ondisconnect` | *any* | - | Callback function on device disconnection. |

**Returns:** *void*

Defined in: [src/Session.js:262](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L262)

___

### onconnected

▸ **onconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:222](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L222)

___

### onconnectionLost

▸ **onconnectionLost**(`response`: *any*): *void*

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | *any* |

**Returns:** *void*

Defined in: [src/Session.js:1677](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1677)

___

### ondisconnected

▸ **ondisconnected**(): *void*

**Returns:** *void*

Defined in: [src/Session.js:224](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L224)

___

### processSocketMessage

▸ **processSocketMessage**(`received?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `received` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:744](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L744)

___

### promptLogin

▸ **promptLogin**(`parentNode?`: HTMLElement, `onsuccess?`: () => *void*): *Promise*<any\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `parentNode` | HTMLElement |
| `onsuccess` | () => *void* |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:1059](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1059)

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

Defined in: [src/Session.js:233](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L233)

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

Defined in: [src/Session.js:713](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L713)

___

### sendBrainstormCommand

▸ **sendBrainstormCommand**(`command?`: *string*, `dict?`: {}): *Promise*<void\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `command` | *string* | '' |
| `dict` | *object* | {} |

**Returns:** *Promise*<void\>

Defined in: [src/Session.js:1636](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1636)

___

### setLoginInfo

▸ **setLoginInfo**(`username?`: *string*, `password?`: *string*): *void*

**`method`** module:brainsatplay.Session.setLoginInfo

**`description`** Set user information.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `username` | *string* | '' | Username. |
| `password` | *string* | '' | Password. |

**Returns:** *void*

Defined in: [src/Session.js:120](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L120)

___

### setupWebSocket

▸ **setupWebSocket**(`auth?`: { `authenticated`: *boolean* = false; `password`: *string* ; `url`: URL ; `username`: *string*  }): *Promise*<any\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `auth` | *object* | - |
| `auth.authenticated` | *boolean* | false |
| `auth.password` | *string* | - |
| `auth.url` | URL | - |
| `auth.username` | *string* | - |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:832](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L832)

___

### signup

▸ **signup**(`dict?`: {}, `baseURL?`: *string*): *Promise*<any\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dict` | *object* | {} |
| `baseURL` | *string* | - |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:687](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L687)

___

### startOSC

▸ **startOSC**(`localAddress?`: *string*, `localPort?`: *number*, `remoteAddress?`: *any*, `remotePort?`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `localAddress` | *string* | "127.0.0.1" |
| `localPort` | *number* | 57121 |
| `remoteAddress` | *any* | null |
| `remotePort` | *any* | null |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:947](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L947)

___

### stopAnalysis

▸ **stopAnalysis**(`name?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | *string* | '' |

**Returns:** *void*

Defined in: [src/Session.js:459](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L459)

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

Defined in: [src/Session.js:582](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L582)

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

Defined in: [src/Session.js:506](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L506)

___

### subscribeToSession

▸ **subscribeToSession**(`sessionid`: *any*, `spectating?`: *boolean*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `sessionid` | *any* | - |
| `spectating` | *boolean* | false |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:998](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L998)

___

### subscribeToUser

▸ **subscribeToUser**(`username?`: *string*, `userProps?`: *any*[], `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `userProps` | *any*[] | [] |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:875](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L875)

___

### unsubscribe

▸ **unsubscribe**(`tag?`: *string*, `sub`: *any*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |
| `sub` | *any* | - |

**Returns:** *void*

Defined in: [src/Session.js:543](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L543)

___

### unsubscribeAll

▸ **unsubscribeAll**(`tag?`: *string*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tag` | *string* | 'FP1' |

**Returns:** *void*

Defined in: [src/Session.js:548](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L548)

___

### unsubscribeFromSession

▸ **unsubscribeFromSession**(`sessionid?`: *string*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `sessionid` | *string* | '' |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:1039](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1039)

___

### unsubscribeFromUser

▸ **unsubscribeFromUser**(`username?`: *string*, `userProps?`: *any*, `onsuccess?`: (`newResult`: *any*) => *void*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `username` | *string* | '' |
| `userProps` | *any* | null |
| `onsuccess` | (`newResult`: *any*) => *void* | - |

**Returns:** *void*

Defined in: [src/Session.js:906](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L906)

___

### waitForOpenConnection

▸ **waitForOpenConnection**(`socket`: *any*): *Promise*<any\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `socket` | *any* |

**Returns:** *Promise*<any\>

Defined in: [src/Session.js:1654](https://github.com/brainsatplay/brainsatplay/blob/480c337/src/libraries/js/src/Session.js#L1654)
