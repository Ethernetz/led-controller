import React, { Component } from "react";
import { MdClose } from "react-icons/md";
import CSS from 'csstype';
import {Led} from '../Leds'

interface IColorPickerState{
  width: number;
  height: number;
  leds?: Led[]
}

interface IColorPickerProps{
  leds: Led[];
  changeLedCallback: (leds: Led[], hex: string)=>void;
  nameSelectCallback: (led: Led)=>void;
  closePickerCallback: (leds: Led[])=>void;

  height: string;
  
}

export default class ColorPicker extends Component<IColorPickerProps, IColorPickerState> {
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
    this.props.changeLedCallback(
      this.props.leds,
      this.hexFromCoords(e.screenX, e.screenX), //TODO get Y
    );
  }

  handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    console.log("touch move");
    this.props.changeLedCallback(
      this.props.leds,
      this.hexFromCoords(e.touches[0].clientX, e.touches[0].clientX), //TODO get Y
    );
  }
  handleNameSelect(led: Led) {
    this.props.nameSelectCallback(led);
  }
  handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
    console.log("mouse click");
    this.props.changeLedCallback(
      this.props.leds, 
      this.hexFromCoords(e.clientX, e.screenX), //TODO get Y
    );
  }
  handleClosePicker(e: React.MouseEvent<SVGElement, MouseEvent>) {
    e.stopPropagation();
    this.props.closePickerCallback(this.props.leds);
  }

  hexFromCoords(x: number, y: number):string {
    var h = (x / this.state.width) * 360;
    var s = 100;
    var l = 50;
    console.log(x, this.state.width)
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
      const hue2rgb = (p:number, q:number, t:number) => {
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
    const toHex = (x:number) => {
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

    let nameContainerStyles: CSS.Properties  = {
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
            <LedName key={index} id={led.id} led={led} text={led.name + (led.connection!=null)} onClick={this.handleNameSelect} ></LedName>
          ))}
        </div>
      </div>
    );
  }
}

interface ILedNameProps{
    onClick: (x:Led)=>void
    id: number;
    text: string;
    led: Led;

}
export class LedName extends React.Component<ILedNameProps> {
 

  handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, i: Led) => {
    e.stopPropagation();  
    this.props.onClick(i);
  }

  render() {
    let styles: CSS.Properties = {
      // backgroundColor: "#fff",
      fontSize: "25px",
      fontWeight: "bold",
    };
    return (
      <div style={styles} onClick={(e) => this.handleClick(e, this.props.led)}>
        {this.props.text}
      </div>
    );
  }
}
