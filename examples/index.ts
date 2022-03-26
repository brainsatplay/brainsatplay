import { isType, nullOrEmpty, objKeys } from "@giveback007/util-lib";


export const initModel = <T>(obj: T, partial?: Partial<T>) => {
    if (!nullOrEmpty(partial)) objKeys(obj).forEach(k => {
        const val = (partial as any)[k];
        if (isType(val, 'undefined')) return;
        
        obj[k] = val;
    });
}