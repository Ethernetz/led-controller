export interface Led {
    id: number;
    name: string;
    ip?: string;
    hex: string;
    brightness: number; 
    override: boolean;
    colorGroup?: number | null;
    connection?: WebSocket | null;
}

export const storedLeds: Led[] = [
    {
        id: 0,
        name: "Wall",
        ip: "10.0.0.28",
        hex: "#ff0000",
        brightness: 20,
        override: false,
        // colorGroup: null,
    },
    {
        id: 1,
        name: "Tube 1",
        ip: "10.0.0.169",
        hex: "#00ff00",
        brightness: 30,
        override: false,
        // colorGroup: null,
    },
    {
        id: 2,
        name: "Tube 2",
        ip: "10.0.0.110",
        hex: "#0000ff",
        brightness: 40,
        override: false,
        // colorGroup: null,
    }
]
