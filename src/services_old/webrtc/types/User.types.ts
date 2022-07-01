export interface UserType {
    id: string;
    ws: any;
    auth?: any;
    info?: {
        [key: string]: any;
    }
}