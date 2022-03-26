
export interface RoomInterface {
    id?: string;
    name: string,
    initiator?: string, // reduced from UserType
    restrictions?: {
        users?: string[]
        max?: number
    },
    peers?: string[]
}