import React, { Component } from "react";
import { MdClose } from "react-icons/md";

export default class ColorPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      leds: null,
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNameSelect = this.handleNameSelect.bind(this);
    this.handleClosePicker = this.handleClosePicker.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.setState({
      leds: this.props.leds,
    });
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  handleMouseMove(e) {
    console.log("mouse move");
    this.props.changeLedCallback({
      ids: this.props.leds.map((led) => led.id),
      hex: this.hexFromCoords(e.screenX, e.screenX), //TODO get Y
    });
  }

  handleTouchMove(e) {
    console.log("touch move");
    this.props.changeLedCallback({
      ids: this.props.leds.map((led) => led.id),
      hex: this.hexFromCoords(e.touches[0].clientX, e.touches[0].clientX), //TODO get Y
    });
  }
  handleNameSelect(id) {
    this.props.nameSelectCallback({
      id: id,
    });
  }
  handleClick(e){
    console.log("mouse click");
    this.props.changeLedCallback({
      ids: this.props.leds.map((led) => led.id),
      hex: this.hexFromCoords(e.screenX, e.screenX), //TODO get Y
    });
  }
  handleClosePicker(e) {
    e.stopPropagation();
    this.props.closePickerCallback({
      leds: this.props.leds,
    });
  }

  hexFromCoords(x, y) {
    var h = (x / this.state.width) * 360;
    var s = 100;
    var l = 50;
    return this.hslToHex(h, s, l);
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  render() {
    let styles = {
      backgroundColor: this.props.leds[0]?.hex || "#00f",
      height: this.props.height,
      width: "100%",
      position: "relative",
    };

    let nameContainerStyles = {
      position: "absolute",
      right: 0,
      bottom: 0,
    };

    return (
      <div
        className="color-picker"
        style={styles}
        // onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}
        onClick = {this.handleClick}
      >
        <MdClose onClick={this.handleClosePicker} size={70} />
        <div style={nameContainerStyles}>
          {this.props.leds.map((led, index) => (
            <LedName key={index} id={led.id} text={led.name + led.override + led.colorGroup} onClick={this.handleNameSelect} ></LedName>
          ))}
        </div>
      </div>
    );
  }
}

export class LedName extends React.Component {
  handleClick = (e, i) => {
    e.stopPropagation();  
    this.props.onClick(i);
  }

  render() {
    let styles = {
      // backgroundColor: "#fff",
      fontSize: "25px",
      fontWeight: "bold",
    };
    return (
      <div style={styles} onClick={(e) => this.handleClick(e, this.props.id)}>
        {this.props.text}
      </div>
    );
  }
}
