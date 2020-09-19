import React, { ChangeEvent } from "react"; // we need this to make JSX compile
import { Led } from "../Leds";
import { BsBrightnessHigh } from "react-icons/bs";
import {
  Slider,
  Switch,
  makeStyles,
} from "@material-ui/core";
type LedInlineSettingProps = {
  onNameClick: (x: Led) => void;
  onPowerSwitch: (x: Led, on: boolean) => void;
  onBrightnessChange: (x: Led, b: number) => void;
  led: Led;
};

const useStyles = makeStyles({
  root: {
    padding: "5px 15px 10px 15px",
  },
  flexbox: {
    display: "flex",
    alignItems: "center",
  },
  item: {
    // flex: 1,
  },
  itemSlider: {
    width: "100%",
    margin: "0 20px 0 20px"
  },
  name: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "white",
  },
  icon: {
    display: "block",
    color: "white",
  },
});

const useSliderStyles = makeStyles({
  root:{
    display: "block",
    padding: "0px",
  },
  thumb:{
    color: "#fff",
  },
  rail:{
    color: "#000",
  },
  track: {
    color: (props: LedInlineSettingProps) => props.led.hex,
  },
})

const useSwitchStyles = makeStyles({
  switchBase: {
    color: "#fff",
    // color:  (props: LedInlineSettingProps) => props.led.hex,
    "&$checked": {
      color:  "#fff",
      // color:  (props: LedInlineSettingProps) => props.led.hex,
    },
    "&$checked + $track": {
      backgroundColor:  "#000",
      // backgroundColor: (props: LedInlineSettingProps) => props.led.hex,
    },
  },
  checked: {},
  track: {},
})

export const LedInlineSettings = React.memo(
  (props: LedInlineSettingProps) => {
    let stopPropegation = (
      e:
        | React.MouseEvent<HTMLDivElement, MouseEvent>
        | React.TouchEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
    };

    const renders = React.useRef(0);
    const classes = useStyles(props);
    const sliderClasses = useSliderStyles(props);
    const switchClasses = useSwitchStyles(props);
    return (
      <div
        className={classes.root}
        onClick={stopPropegation}
        onTouchMove={stopPropegation}
      >
        <div
          className={classes.name}
            onClick={(e) => props.onNameClick(props.led)}
        >
          {props.led.name + " " + renders.current++ + "ok"}
        </div>
        <div className={classes.flexbox}>
          <div className={classes.item}>
            <BsBrightnessHigh className={classes.icon} size={24} />
          </div>
          <div className={classes.itemSlider}>
            <Slider
              value={props.led.brightness}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              step={5}
              className={sliderClasses.root}
              classes={{
                thumb: sliderClasses.thumb,
                rail: sliderClasses.rail,
                track: sliderClasses.track,
              }}
              onChange={(e: ChangeEvent<{}>, v: number | number[]) =>
                props.onBrightnessChange(props.led, Array.isArray(v) ? v[0] : v)
              }
            />
          </div>
          <div className={classes.item}>
            <Switch
              checked={ props.led.on }
              classes={{
                switchBase: switchClasses.switchBase,
                track: switchClasses.track,
                checked: switchClasses.checked
              }}
              onChange={(e, on) => props.onPowerSwitch(props.led, on)}
              size="small"
            />
          </div>
        </div>
      </div>
    );
  }
);
