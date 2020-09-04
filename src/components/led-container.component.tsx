import React, { Component } from "react";
import axios from "axios";
import ColorPicker from "./color-picker.component";
import { Led, storedLeds } from "../Leds";
// import {}

type LedMap = {[id: number]: Led};

interface ILedContainerState{
  leds: LedMap;
  ids: number[];
  colors: string[];
}

interface ILedContainerProps{
}


export default class LedContainer extends Component<ILedContainerProps, ILedContainerState> {
  constructor(props: ILedContainerProps) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onNameSelect = this.onNameSelect.bind(this);
    this.onClosePicker = this.onClosePicker.bind(this);
    this.getPickerData = this.getPickerData.bind(this);
    this.getUpdatedColorGroups = this.getUpdatedColorGroups.bind(this);
    this.getUpdatedColors = this.getUpdatedColors.bind(this);

    let leds: LedMap = {};
    let ids: number[] = []
    storedLeds.forEach((led) => {
      leds[led.id] = led;
      ids.push(led.id);
    });

    this.state = {
      leds: leds,
      ids: ids,
      colors: [],
    };
  }

  onColorChange(leds: Led[], hex: string) {
    let newLeds: LedMap = {};
    leds.forEach((led) => {
      newLeds[led.id] = {
        ...led,
        hex: hex
      }

      if (led.ip) {
        axios
          .post(
            `http://${
              led.ip
            }/sendCommand?command=c 0x${hex.slice(-6)}`
          )
          .then((res) => console.log("response was", res.data));
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
  onNameSelect(led: Led) {
    console.log("led is", led);
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
    console.log("leds are", leds);
    let newLeds: LedMap = {};
    let newHex = "#000000";
    for (let i = 0; i < this.state.ids.length; i++) {
      let id = this.state.ids[i];
      if (!this.state.leds[id].override && this.state.leds[id].hex !== leds[0].hex) {
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
        }
      });
    this.setState(
      this.getUpdatedColorGroups({ ...this.state.leds, ...newLeds })
    );
  }

  componentDidMount() {
    
    // connection.close()
    storedLeds.forEach((led) => {
      if (!led.ip) return;

      let connection = new WebSocket('ws://' + "10.0.0.28" + ':81/', ['arduino']);
      connection.onopen = function() {
        connection.send('Connect ' + new Date());
        connection.send('#8edfb1')
      };
      connection.onerror = function(error) {
        console.log('WebSocket Error ', error);
      };
      connection.onmessage = function(e) {
        console.log('Server: ', e.data);
    };

    // axios.get(`http://${led.ip}/color`).then((res) => {
    //   if (res.data.length > 0) {
    //     this.setState(
    //       this.getUpdatedColorGroups({
    //         ...this.state.leds,
    //         [led.id]: {
    //           ...this.state.leds[led.id],
    //           hex: `#${("000000" + res.data).slice(-6)}`,
    //         },
    //       })
    //     );
    //   }
    // });
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
      if (newColors.indexOf(led.hex) === -1) 
        newColors.push(led.hex);

      newLeds[id] = {
        ...leds[id],
        colorGroup: newColors.indexOf(led.hex),
      }
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
            changeLedCallback={this.onColorChange}
            nameSelectCallback={this.onNameSelect}
            closePickerCallback={this.onClosePicker}
            height={`${100 / ledGroups.length}%`}
          ></ColorPicker>
        ))}
      </div>
    );
  }
}
