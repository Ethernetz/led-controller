import React, { ChangeEvent } from "react"; // we need this to make JSX compile
import { Led } from "../Leds";
import CSS from "csstype";
import Grid from "@material-ui/core/Grid";
import { BsBrightnessHigh } from "react-icons/bs";
import { MuiThemeProvider, Slider, Switch, createMuiTheme } from "@material-ui/core";
type LedInlineSettingProps = {
  onNameClick: (x: Led) => void;
  onBrightnessChange: (x: Led, b: number) => void;
  onPowerSwitch: (x: Led, on: boolean) => void;
  led: Led;
};

export const LedInlineSettings = React.memo((props: LedInlineSettingProps) => {
  let stopPropegation = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
  };
  const style: CSS.Properties = {
    padding: "5px 15px 10px 15px",
  };
  const nameStyle: CSS.Properties = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "white",
  };
  const theme = createMuiTheme({
      palette: {
        secondary: {
          main: props.led.hex,
        },
      },
      overrides: {
        MuiSlider: {
          thumb: {
            color: "#ffffff",
          },
          track: {
            color: props.led.hex,
          },
          rail: {
            color: "black",
          },
        },
        MuiSwitch: {
          thumb: {
            color: "#ffffff",
          },
        },
      },
    });
const renders = React.useRef(0);

  return (
    <div style={style} onClick={stopPropegation} onTouchMove={stopPropegation}>
      <div style={nameStyle} 
      onClick={(e) => props.onNameClick(props.led)}
      >
        {props.led.name + " " + renders.current++}
      </div>
      <Grid container spacing={1} alignItems="center">
          <Grid item>
            <BsBrightnessHigh
              size={24}
              style={{ display: "block" }}
              color={"white"}
            />
          </Grid>
          <Grid item xs>
            <MuiThemeProvider theme={theme}>
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
            </MuiThemeProvider>
          </Grid>
          <Grid item>
            <MuiThemeProvider theme={theme}>
            <Switch
                checked={props.led.on}
                onChange={(e, on) => props.onPowerSwitch(props.led, on)}
                size="small"
              />
            </MuiThemeProvider>
          </Grid>
        </Grid>
    </div>
  );
})
