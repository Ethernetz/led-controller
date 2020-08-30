import React, { Component } from "react";
import axios from "axios";
import ColorPicker from "./color-picker.component";
import { leds } from "../Leds";
export default class LedContainer extends Component {
  constructor(props) {
    super(props);

    this.onColorChange = this.onColorChange.bind(this);
    this.onNameSelect = this.onNameSelect.bind(this);
    this.onClosePicker = this.onClosePicker.bind(this);
    this.getPickerData = this.getPickerData.bind(this);
    this.getUpdatedColorGroups = this.getUpdatedColorGroups.bind(this);
    this.getUpdatedColors = this.getUpdatedColors.bind(this);

    let l = {};
    leds.forEach((led) => {
      l = {
        ...l,
        [led.id]: {
          ...led,
        },
      };
    });
    this.state = {
      leds: l,
      ids: leds.map((led) => led.id),
      colors: [],
    };
  }

  onColorChange(data) {
    let newLeds = {};
    data.ids.forEach((id) => {
      newLeds = {
        ...newLeds,
        [id]: {
          ...this.state.leds[id],
          hex: data.hex,
        },
      };

      if (this.state.leds[id].ip) {
        // axios
        //   .post(`http://${this.state.leds[id].ip}/sendCommand?command=c 0x${data.hex.slice(-6)}`)
        //   .then((res) => console.log("response was", res.data));
      }
    });
    this.setState({
      leds: {
        ...this.state.leds,
        ...newLeds,
      },
      colors: this.getUpdatedColors({...this.state.leds, ...newLeds})
    });
  }
  onNameSelect(data) {
    this.setState({
      leds: {
        ...this.state.leds,
        [data.id]: {
          ...this.state.leds[data.id],
          override: true,
        },
      },
    });
  }
  onClosePicker(data) {
    let newLeds = {};
    let newColorGroup = 0
      for(let i = 0; i < this.state.colors.length; i++){
        if(this.state.leds[data.ids[0]].colorGroup !== i){
          newColorGroup = i;
          break;
        }
      }
    data.ids.forEach((id) => {
      newLeds = {
        ...newLeds,
        [id]: {
          ...this.state.leds[id],
          override: false,
          colorGroup: newColorGroup,
          hex: this.state.colors[newColorGroup],
        },
      };
    });
    this.setState(
      this.getUpdatedColorGroups({ ...this.state.leds, ...newLeds })
    );
  }

  componentDidMount() {
    leds.forEach((led) => {
      if (!led.ip) return;
      axios.get(`http://${led.ip}/color`).then((res) => {
        if (res.data.length > 0) {
          this.setState(
            this.getUpdatedColorGroups({
              ...this.state.leds,
              [led.id]: {
                ...this.state.leds[led.id],
                hex: `#${("000000" + res.data).slice(-6)}`,
              },
            })
          );
        }
      });
    });
    this.setState(this.getUpdatedColorGroups(this.state.leds));
  }

  getPickerData() {
    let overrideData = [];
    let colorGroupData = [];
    this.state.ids.forEach((id) => {
      let led = this.state.leds[id];
      if (led.override) {
        overrideData.push([led]);
        return;
      }
      colorGroupData[led.colorGroup] != null
        ? colorGroupData[led.colorGroup].push(led)
        : (colorGroupData[led.colorGroup] = [led]);
    });
    return overrideData.concat(colorGroupData);
  }

  getUpdatedColorGroups(leds) {
    let newColors = [];
    let newLeds = {};
    for (let i = 0; i < this.state.ids.length; i++) {
      let id = this.state.ids[i];
      let led = leds[id];
      if (newColors.indexOf(led.hex) === -1) newColors.push(led.hex);

      newLeds = {
        ...newLeds,
        [id]: {
          ...leds[id],
          colorGroup: newColors.indexOf(led.hex),
        },
      };
    }

    return {
      leds: {
        ...this.state.leds,
        ...newLeds,
      },
      colors: newColors,
    };
  }

  getUpdatedColors(leds){
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
      // maxHeight: "100vh",
      width: "100%",
    };
    let data = this.getPickerData();
    let pickers = [];
    for (let i = 0; i < data.length; i++) {
      pickers.push(
        <ColorPicker
          leds={data[i]}
          changeLedCallback={this.onColorChange}
          nameSelectCallback={this.onNameSelect}
          closePickerCallback={this.onClosePicker}
          height={`${100 / data.length}%`}
          key={i}
        ></ColorPicker>
      );
    }
    return <div style={divStyle}>{pickers}</div>;
  }
}
