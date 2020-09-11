import React from "react";
import CSS from "csstype";
import { Led } from "../Leds";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import { shadeBlend } from "../shadeBlend";
import { LedInlineSettings } from "./led-inline-settings";
import { LedBasicInlineSettings } from "./led-basic-inline-settings";
import {hexFromCoords} from "../colorConverters"

interface ColorPickerProps {
  leds: Led[];
  changeColorCallback: (leds: Led[], hex: string) => void;
  changeBrightnessCallback: (led: Led, brightness: number) => void;
  powerSwitchCallback: (led: Led, on: boolean) => void;
  nameSelectCallback: (led: Led) => void;
  closePickerCallback: (leds: Led[]) => void;
  width: number;
  height: string;
}

export const ColorPicker = React.memo((props: ColorPickerProps) => {

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log("mouse move");
    props.changeColorCallback(
      props.leds,
      hexFromCoords(e.screenX, e.screenX, props.width) //TODO get Y
    );
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    console.log("touch move");
    props.changeColorCallback(
      props.leds,
      hexFromCoords(e.touches[0].clientX, e.touches[0].clientX, props.width) //TODO get Y
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>)  => {
    console.log("mouse click");
    props.changeColorCallback(
      props.leds,
      hexFromCoords(e.clientX, e.screenX, props.width) //TODO get Y
    );
  }

  const handleClosePicker = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();
    props.closePickerCallback(props.leds);
  }

    let styles: CSS.Properties = {
      backgroundColor: props.leds[0]?.hex || "#00f",
      height: `${props.height}`,
      width: "100%",
      position: "relative",
    };

    let nameContainerStyles: CSS.Properties = {
      position: "absolute",
      bottom: 0,
      paddingTop: "10px",
      paddingBottom: "10px",
      width: "100%",
      backgroundColor: String(shadeBlend(-0.7, props.leds[0].hex)),
      // "rgba(0, 0, 0, 0.8)",
      borderRadius: "5px",
    };

    let closeStyle: CSS.Properties = {
      position: "absolute",
      right: 0,
      fontSize: "40",
      display: "block",
    };

    return (
      <div
        className="color-picker"
        style={styles}
        // onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
      >
        <CloseRoundedIcon onClick={handleClosePicker} style={closeStyle} />
        <div style={nameContainerStyles}>
          {props.leds.map(led => (
            <LedInlineSettings
            key={led.id}
            led={led}
            onNameClick={props.nameSelectCallback}
            onBrightnessChange={props.changeBrightnessCallback}
            onPowerSwitch={props.powerSwitchCallback}
          ></LedInlineSettings>
          // <LedBasicInlineSettings
          // key={led.id}
          // led={led}
          // // onNameClick={props.nameSelectCallback}
          // // onBrightnessChange={props.changeBrightnessCallback}
          // // onPowerSwitch={props.powerSwitchCallback}
          // ></LedBasicInlineSettings>
          ))}
        </div>
      </div>
    );
})
