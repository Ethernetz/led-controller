import React, { ChangeEvent } from "react"; // we need this to make JSX compile
import { Led } from "../Leds";
import CSS from "csstype";
import Grid from "@material-ui/core/Grid";
import { BsBrightnessHigh } from "react-icons/bs";
import { MuiThemeProvider, Slider, Switch, createMuiTheme } from "@material-ui/core";
type LedBasicInlineSettingProps = {
//   onNameClick: (x: Led) => void;
//   onBrightnessChange: (x: Led, b: number) => void;
//   onPowerSwitch: (x: Led, on: boolean) => void;
  onBrightnessChange: (x: Led, b: number) => void;
  led: Led;
};

export const LedBasicInlineSettings = React.memo((props: LedBasicInlineSettingProps) => {
  let stopPropegation = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
  };
  let style: CSS.Properties = {
    padding: "5px 15px 10px 15px",
  };
  let nameStyle: CSS.Properties = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "white",
  };
  const renders = React.useRef(0);
  
  return (
    <div style={style} onClick={stopPropegation} onTouchMove={stopPropegation}>
      <div style={nameStyle} 
    //   onClick={(e) => props.onNameClick(props.led)}
      >
        {props.led.name + " " + renders.current++}
      </div>
      <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <Slider
                value={props.led.brightness}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                step={5}
                style={{ display: "block", padding: "0px" }}
                onChange={(e: ChangeEvent<{}>, v: number | number[]) =>
                  props.onBrightnessChange(
                    props.led,
                    Array.isArray(v) ? v[0] : v
                  )
                }
              />
          </Grid>
        </Grid>
    </div>
  );
})
