import { DataTablet, DS } from 'brainsatplay-data'
import { Data, ProfileStruct, AuthorizationStruct, GroupStruct, DataStruct, EventStruct, ChatroomStruct, CommentStruct, Struct } from 'brainsatplay-data/dist/src/types';

export const randomId = (prefix?) => ((prefix) ? `${prefix}` : '')  + Math.floor(1000000000000000*Math.random())

export const pseudoObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => //the fuck?
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))



