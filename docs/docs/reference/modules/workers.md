---
id: "workers"
title: "Namespace: Workers"
sidebar_label: "Workers"
sidebar_position: 0
custom_edit_url: null
---

# Namespace: Workers

## Variables

### workerResponses

• `Let` **workerResponses**: *any*[]= []

Defined in: [src/Workers.js:5](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L5)

___

### workerThreadrot

• `Let` **workerThreadrot**: *number*= 0

Defined in: [src/Workers.js:8](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L8)

___

### workerThreads

• `Let` **workerThreads**: *number*= 2

Defined in: [src/Workers.js:7](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L7)

___

### workers

• `Let` **workers**: *any*[]= []

Defined in: [src/Workers.js:6](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L6)

## Functions

### addWorker

▸ `Const` **addWorker**(`workerurl?`: *string*): *undefined* \| *number*

#### Parameters

| Name | Type |
| :------ | :------ |
| `workerurl` | *string* |

**Returns:** *undefined* \| *number*

Defined in: [src/Workers.js:33](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L33)

___

### postToWorker

▸ `Const` **postToWorker**(`input`: *any*, `workeridx?`: *any*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `input` | *any* | - |
| `workeridx` | *any* | null |

**Returns:** *void*

Defined in: [src/Workers.js:57](https://github.com/brainsatplay/brainsatplay/blob/746d6f3/src/library/src/Workers.js#L57)
