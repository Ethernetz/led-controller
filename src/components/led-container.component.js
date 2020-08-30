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
      ids: leds.map(led => led.id)
    };
  }

  onColorChange(data) {
    console.log("data is", data, data.hex);
    // console.log("state is", this.state)
    let newLeds = {}
    data.ids.forEach((id) => {
      newLeds = {
        ...newLeds,
        [id]: {
          ...this.state.leds[id],
          hex: data.hex,
        },
      }
      
      if (this.state.leds[id].ip) {
        // console.log("param will be",  `c 0x${data.hex.slice(-6)}`)
        // axios
        //   .post(`http://${this.state.leds[id].ip}/sendCommand?command=c 0x${data.hex.slice(-6)}`)
          // .then((res) => console.log("response was", res.data));
      }
    });
    this.setState({
      leds: {
        ...this.state.leds,
        ...newLeds
      }
    });
  }
  onNameSelect(data) {
    this.setState({
      leds: {
        ...this.state.leds,
        [data.id]: {
          ...this.state.leds[data.id],
          override: true
        }
      }
    });
  }
  onClosePicker(data) {
    // this.setState({
    //   leds: {
    //     ...this.state.leds,
    //     [data.id]: {
    //       ...this.state.leds[data.id],
    //       override: true
    //     }
    //   }
    // });
  }

  componentDidMount() {
    leds.forEach((led) => {
      // console.log(led);
      if(!led.ip)
        return
      axios.get(`http://${led.ip}/color`).then((res) => {
        if (res.data.length > 0) {
          this.setState({
            leds: {
              ...this.state.leds,
              [led.id]: {
                ...[led.id],
                hex: `#${("000000" + res.data).slice(-6)}`,
              },
            },
          });
        }
      });
    });
  }

  render() {
    const divStyle = {
      height: "100%",
      width: "100%",
    };
    let overrideData = [];
    let groupByColorData = [];
    this.state.ids.forEach(id => {
      let led = this.state.leds[id];
      if(led.override){
        overrideData.push([led])
        return
      }
      let index = groupByColorData.findIndex(leds => leds[0].hex === led.hex)
      if(index > -1)
        groupByColorData[index].push(led)
      else
        groupByColorData.push([led])
        
    })

    // console.log("OD", overrideData);
    // console.log("GBCD", groupByColorData);
    let data = overrideData.concat(groupByColorData);
    let pickers = []
    for(let i = 0; i < data.length; i++){
      pickers.push(
        <ColorPicker
          leds={data[i]}
          changeLedCallback={this.onColorChange}
          nameSelectCallback={this.onNameSelect}
          closePickerCallback={this.onClosePicker}
          height={`${100/data.length}%`}
          key={i}
        ></ColorPicker>
      )
    } 
    return (
      <div style={divStyle}>
        {pickers}
      </div>
    );
  }
}
