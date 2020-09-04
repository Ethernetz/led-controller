export interface Led {
    id: number;
    name: string;
    ip?: string;
    hex: string;
    override: boolean;
    colorGroup?: number | null;
}

export const storedLeds: Led[] = [
    {
        id: 0,
        name: "Wall Led",
        ip: "10.0.0.169",
        hex: "#ff0000",
        override: false,
        // colorGroup: null,
    },
    {
        id: 1,
        name: "Tube 1",
        // ip: "10.0.0.169",
        hex: "#00ff00",
        override: false,
        // colorGroup: null,
    },
    {
        id: 2,
        name: "Tube 2",
        // ip: "10.0.0.169",
        hex: "#0000ff",
        override: false,
        // colorGroup: null,
    }
]
