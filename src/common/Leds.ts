export interface Led {
    id: number;
    name: string;
    ip?: string;
    hex: string;
    brightness: number; 
    on: boolean;
    override?: boolean;
    colorGroup?: number | null;
    connection?: WebSocket | null;
}

export const storedLeds: Led[] = [
    {
        id: 0,
        name: "Wall",
        ip: "10.0.0.22",
        hex: "#ff0000",
        brightness: 20,
        on: true,
    },
    {
        id: 1,
        name: "Tube 1",
        ip: "10.0.0.166",
        hex: "#00ff00",
        brightness: 20,
        on: true,
    },
    {
        id: 2,
        name: "Tube 2",
        ip: "10.0.0.109",
        hex: "#0000ff",
        brightness: 20,
        on: true,
    },
    // {
    //     id: 3,
    //     name: "Bed",
    //     ip: "10.0.0.187",
    //     hex: "#00ffff",
    //     brightness: 20,
    //     on: true,
    // }
]
