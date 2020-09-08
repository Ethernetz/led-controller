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
        ip: "10.0.0.28",
        hex: "#ff0000",
        brightness: 20,
        on: true,
    },
    {
        id: 1,
        name: "Tube 1",
        ip: "10.0.0.169",
        hex: "#00ff00",
        brightness: 30,
        on: false,
    },
    {
        id: 2,
        name: "Tube 2",
        ip: "10.0.0.110",
        hex: "#0000ff",
        brightness: 40,
        on: true,
    }
]
