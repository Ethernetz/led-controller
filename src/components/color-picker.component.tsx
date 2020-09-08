import React, { Component } from "react";
import { MdClose } from "react-icons/md";
import { BsBrightnessLow, BsBrightnessHigh } from "react-icons/bs";
import CSS from "csstype";
import { Led } from "../Leds";
import { withStyles } from "@material-ui/core/styles";

import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";

const PrettoSlider = withStyles({
  root: {
    color: "#000",
    height: 8,
    padding: 0,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

interface IColorPickerState {
  width: number;
  height: number;
  leds?: Led[];
}

interface IColorPickerProps {
  leds: Led[];
  changeColorCallback: (leds: Led[], hex: string) => void;
  changeBrightnessCallback: (led: Led, brightness: number) => void;
  nameSelectCallback: (led: Led) => void;
  closePickerCallback: (leds: Led[]) => void;

  height: string;
}

export default class ColorPicker extends Component<
  IColorPickerProps,
  IColorPickerState
> {
  constructor(props: IColorPickerProps) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      leds: [],
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNameSelect = this.handleNameSelect.bind(this);
    this.handleBrightnessChange = this.handleBrightnessChange.bind(this);
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

  handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    console.log("mouse move");
    this.props.changeColorCallback(
      this.props.leds,
      this.hexFromCoords(e.screenX, e.screenX) //TODO get Y
    );
  }

  handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    console.log("touch move");
    this.props.changeColorCallback(
      this.props.leds,
      this.hexFromCoords(e.touches[0].clientX, e.touches[0].clientX) //TODO get Y
    );
  }
  handleNameSelect(led: Led) {
    this.props.nameSelectCallback(led);
  }
  handleBrightnessChange(led: Led, brightness: number){
    this.props.changeBrightnessCallback(led, brightness)
  }

  handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    console.log("mouse click");
    this.props.changeColorCallback(
      this.props.leds,
      this.hexFromCoords(e.clientX, e.screenX) //TODO get Y
    );
  }
  handleClosePicker(e: React.MouseEvent<SVGElement, MouseEvent>) {
    e.stopPropagation();
    this.props.closePickerCallback(this.props.leds);
  }

  hexFromCoords(x: number, y: number): string {
    var h = (x / this.state.width) * 360;
    var s = 100;
    var l = 50;
    return this.hslToHex(h, s, l);
  }

  hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
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
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  render() {
    let styles: CSS.Properties = {
      backgroundColor: this.props.leds[0]?.hex || "#00f",
      height: `${this.props.height}`,
      width: "100%",
      position: "relative",
    };

    let nameContainerStyles: CSS.Properties = {
      position: "absolute",
      bottom: 0,
      paddingTop: "10px",
      paddingBottom: "10px",
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      borderRadius: "5px",
    };

    let closeStyle: CSS.Properties = {
      position: "absolute",
      right: 0,
    };

    return (
      <div
        className="color-picker"
        style={styles}
        // onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}
        onClick={this.handleClick}
      >
        <MdClose
          onClick={this.handleClosePicker}
          size={40}
          style={closeStyle}
        />
        <div style={nameContainerStyles}>
          {this.props.leds.map((led, index) => (
            <LedName
              key={index}
              id={led.id}
              led={led}
              text={led.name}
              onNameClick={this.handleNameSelect}
              onBrightnessChange={this.handleBrightnessChange}
            ></LedName>
          ))}
        </div>
      </div>
    );
  }
}

interface ILedNameProps {
  onNameClick: (x: Led) => void;
  onBrightnessChange: (x: Led, b: number) => void;
  id: number;
  text: string;
  led: Led;
}
export class LedName extends React.Component<ILedNameProps> {
  stopPropegation = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
  };

  handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, i: Led) => {
    e.stopPropagation();
    this.props.onNameClick(i);
  };

  render() {
    let style: CSS.Properties = {
      padding: "5px 15px 10px 15px"
    };

    let nameStyle: CSS.Properties = {
      fontSize: "20px",
      fontWeight: "bold",
    };
    return (
      <div
        style={style}
        onClick={this.stopPropegation}
        onTouchMove={this.stopPropegation}
      >
        <div
          style={nameStyle}
          onClick={(e) => this.handleClick(e, this.props.led)}
        >
          {this.props.text}
        </div>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <BsBrightnessLow size={28} style={{ display: "block" }} />
          </Grid>
          <Grid item xs>
            <PrettoSlider
              value={this.props.led.brightness}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              step={5}
              style={{ display: "block" }}
              onChange={(e, v) => this.props.onBrightnessChange(this.props.led, Array.isArray(v) ? v[0] : v)}
            />
          </Grid>
          <Grid item>
            <BsBrightnessHigh size={28} style={{ display: "block" }} />
          </Grid>
        </Grid>
      </div>
    );
  }
}
