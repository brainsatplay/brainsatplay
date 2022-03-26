import { initModel } from "..";
import { BaseObj } from "./_base.model";

export const NoteType = 'NOTE';
export class NoteObj extends BaseObj<typeof NoteType> {
    message: string = '';
    clientId: string = '';
    submittedBy: string = '';

    constructor(p?: Partial<NoteObj>) {
        super(NoteType, p);
        initModel(this, p);
    }
}
