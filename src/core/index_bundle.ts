//we can't circularly export a namespace for index.ts so this is the intermediary

export * from './index'
import * as bundle from './index'

if(globalThis.brainsatplay) Object.assign(globalThis.brainsatplay,bundle);
else globalThis.brainsatplay = bundle;