export class BaseObj<T extends string> {
    readonly objType: T;
    readonly structType: T;
    readonly _id: string = ''; //  randomId(structType+'dummyId') //random id associated for unique identification, used for lookup and indexing
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly ownerId: string | undefined;
    readonly timestamp: number;

    parent: any;

    constructor(objType: T, p?: Partial<BaseObj<T>>) {
        const t = (new Date()).toISOString();
        
        this.objType = this.structType = objType; // replaces structType for Josh //this is how you will look it up by type in the server
        this.createdAt = p?.createdAt || t;
        this.updatedAt = t; // Augments timestamp for Josh
        this.timestamp = Date.now();

        // TODO: Implement Josh's base structure effectively
        this.ownerId = p?.ownerId ?? ''//owner user
        this.parent =  p?.parent //parent struct it's associated with (e.g. if it needs to spawn with it)

        if(!this.parent?._id) delete this.parent;
        // if(Object.keys(additionalProps).length > 0) Object.assign(struct,additionalProps);
    }
}
