import React, { Component } from "react";
import ColorPicker from "./color-picker.component";
import { Led, storedLeds } from "../Leds";

type LedMap = { [id: number]: Led };

interface ILedContainerState {
  leds: LedMap;
  ids: number[];
  colors: string[];
}

interface ILedContainerProps {}

export default class LedContainer extends Component<
  ILedContainerProps,
  ILedContainerState
> {
  constructor(props: ILedContainerProps) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onBrightnessChange = this.onBrightnessChange.bind(this);
    this.onNameSelect = this.onNameSelect.bind(this);
    this.onClosePicker = this.onClosePicker.bind(this);
    this.onPowerSwitch = this.onPowerSwitch.bind(this);
    this.getPickerData = this.getPickerData.bind(this);
    this.getUpdatedColorGroups = this.getUpdatedColorGroups.bind(this);
    this.getUpdatedColors = this.getUpdatedColors.bind(this);

    this.state = {
      leds: {},
      ids: [],
      colors: [],
    };
  }

  onColorChange(leds: Led[], hex: string) {
    let newLeds: LedMap = {};
    leds.forEach((led) => {
      newLeds[led.id] = {
        ...led,
        hex: hex,
      };
      if (led.connection){
        led.connection.send(hex);
      }
    });
    this.setState({
      leds: {
        ...this.state.leds,
        ...newLeds,
      },
      colors: this.getUpdatedColors({ ...this.state.leds, ...newLeds }),
    });
  }

  onBrightnessChange(led: Led, brightness: number) {
    if (led.connection){
      led.connection.send("b"+ Math.floor(brightness*230/100));
    }
    this.setState({
      leds: {
        ...this.state.leds,
        [led.id]: {
          ...this.state.leds[led.id],
          brightness: brightness
        }
      }
    })
  }
  onPowerSwitch(led: Led, on: boolean) {
    // if (led.connection){
    //   led.connection.send("b"+ Math.floor(brightness*230/100));
    // }
    this.setState({
      leds: {
        ...this.state.leds,
        [led.id]: {
          ...this.state.leds[led.id],
          on: on
        }
      }
    })
  }

  onNameSelect(led: Led) {
    this.setState({
      leds: {
        ...this.state.leds,
        [led.id]: {
          ...this.state.leds[led.id],
          colorGroup: null,
          override: true,
        },
      },
    });
  }
  onClosePicker(leds: Led[]) {
    let newLeds: LedMap = {};
    let newHex = "#000000";
    for (let i = 0; i < this.state.ids.length; i++) {
      let id = this.state.ids[i];
      if (
        !this.state.leds[id].override &&
        this.state.leds[id].hex !== leds[0].hex
      ) {
        newHex = this.state.leds[id].hex;
        break;
      }
    }
    leds.forEach((led) => {
      newLeds[led.id] = {
        ...led,
        override: false,
        colorGroup: null,
        hex: newHex,
      };
      if (led.connection){
        led.connection.send(newHex);
      }
    });
    this.setState(
      this.getUpdatedColorGroups({ ...this.state.leds, ...newLeds })
    );
  }

  componentDidMount() {
    storedLeds.forEach((led) => {
      if (!led.ip) return;
      console.log(`Connecting to ${led.name} at ${led.ip}`); 
      let connection = new WebSocket("ws://" + led.ip + ":81/", ["arduino",]);
      connection.onopen = () => {
        connection.send("Connect " + new Date());
        console.log(`Connected to ${led.name}`)
        this.setState({
          leds: {
            ...this.state.leds,
            [led.id]: {
              ...led,
              connection: connection,
            },
          },
          ids: [...this.state.ids, led.id]
        });
      };
      connection.onerror = (error) => {
        console.log(`Error from ${led.name}:`, error);
      };
      connection.onmessage = (e) => {
        console.log(`${led.name}: ${e.data}`);
        if (e.data[0] === "#") {
          this.setState(
            this.getUpdatedColorGroups({
              ...this.state.leds,
              [led.id]: {
                ...this.state.leds[led.id],
                hex: `#${("000000" + e.data.substring(1)).slice(-6)}`,
              },
            })
          );
        }
        if (e.data[0] === "b") {
          this.setState(
            this.getUpdatedColorGroups({
              ...this.state.leds,
              [led.id]: {
                ...this.state.leds[led.id],
                brightness: parseInt(e.data.substring(1))*100/230,
              },
            })
          );
        }
      };
      connection.onclose = (e) => {
        console.log(`Connected lost from ${led.name}`)
        this.setState({
          leds: {
            ...this.state.leds,
            [led.id]: {
              ...this.state.leds[led.id],
              connection: null,
              // hex: null,
            },
          },
          ids: [...this.state.ids.filter((id)=> id !== led.id)]
        });
      }
    });
    this.setState(this.getUpdatedColorGroups(this.state.leds));
  }

  getPickerData(): Led[][] {
    let overrideData: Led[][] = [];
    let colorGroupData: Led[][] = [];
    this.state.ids.forEach((id) => {
      let led = this.state.leds[id];
      if (led.override) {
        overrideData.push([led]);
        return;
      }

      colorGroupData[led.colorGroup || 0] != null
        ? colorGroupData[led.colorGroup || 0].push(led)
        : (colorGroupData[led.colorGroup || 0] = [led]);
    });
    return overrideData.concat(colorGroupData).filter(Boolean);
  }

  getUpdatedColorGroups(leds: LedMap) {
    let newColors = [];
    let newLeds: LedMap = {};
    for (let i = 0; i < this.state.ids.length; i++) {
      let id = this.state.ids[i];
      let led = leds[id];
      if (newColors.indexOf(led.hex) === -1) newColors.push(led.hex);

      newLeds[id] = {
        ...leds[id],
        colorGroup: newColors.indexOf(led.hex),
      };
    }
    return {
      leds: {
        ...leds,
        ...newLeds,
      },
      colors: newColors,
    };
  }

  getUpdatedColors(leds: LedMap): string[] {
    let newColors = [];
    for (let i = 0; i < this.state.ids.length; i++) {
      let id = this.state.ids[i];
      let led = leds[id];
      if (newColors.indexOf(led.hex) === -1) newColors.push(led.hex);
    }
    return newColors;
  }

  render() {
    const divStyle = {
      height: "100%",
      width: "100%",
    };
    let ledGroups = this.getPickerData();
    return (
      <div style={divStyle}>
        {ledGroups.map((leds, index) => (
          <ColorPicker
            key={index}
            leds={leds}
            changeColorCallback={this.onColorChange}
            changeBrightnessCallback={this.onBrightnessChange}
            nameSelectCallback={this.onNameSelect}
            closePickerCallback={this.onClosePicker}
            powerSwitchCallback={this.onPowerSwitch}
            height={`${100 / ledGroups.length}%`}
          ></ColorPicker>
        ))}
      </div>
    );
  }
}
