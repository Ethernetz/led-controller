import React, { useState, useEffect, useRef, useReducer } from "react";
import { ColorPicker } from "./color-picker.component";
import { Led, storedLeds } from "../Leds";
import { useWindowWidth } from "./useWindowWidth";

type Action =
  | { type: "add-led"; led: Led }
  | { type: "set-property"; key: keyof Led; value: any; leds: Led[] }
  | { type: "set-properties"; payload: Partial<Led>; leds: Led[] }
  | { type: "set-leds"; ledMap: LedMap };

type LedMap = { [id: number]: Led };

function reducer(state: LedMap, action: Action): LedMap {
  switch (action.type) {
    case "add-led":
      if (!action.led) return { ...state };

      return {
        ...state,
        [action.led.id]: action.led,
      };
    case "set-property":
      if (!action.leds || !action.key) return { ...state };

      return action.leds?.reduce(
        (map: LedMap, led) => {
          map[led.id] = { ...state[led.id], [action.key]: action.value };
          return map;
        },
        { ...state }
      );
    case "set-properties":
      return action.leds?.reduce(
        (map: LedMap, led) => {
          map[led.id] = { ...state[led.id], ...action.payload };
          return map;
        },
        { ...state }
      );
    case "set-leds":
      return { ...state, ...action.ledMap };
  }
}
export const LedContainer = () => {
  const [leds, ledDispatch] = useReducer(reducer, {});
  const [ids, setIds] = useState<number[]>([]);
  const [updateColorGroups, setUpdateColorGroups] = useState(false);
  const width = useWindowWidth();

  const wsRefs = useRef<{ [id: number]: WebSocket }>();

  const onColorChange = (leds: Led[], hex: string) => {
    ledDispatch({ type: "set-property", key: "hex", value: hex, leds: leds });
    leds.forEach((led) => {
      if (wsRefs?.current && wsRefs.current[led.id]) {
        wsRefs.current[led.id].send(hex);
      }
    });
  };

  const onBrightnessChange = (led: Led, brightness: number) => {
    ledDispatch({
      type: "set-property",
      key: "brightness",
      value: brightness,
      leds: [led],
    });
    if (wsRefs?.current && wsRefs.current[led.id]) {
      wsRefs.current[led.id].send("b" + Math.floor((brightness * 230) / 100));
    }
  };

  const onPowerSwitch = (led: Led, on: boolean) => {
    ledDispatch({ type: "set-property", key: "on", value: on, leds: [led] });
  };

  const onNameSelect = (led: Led) => {
    ledDispatch({
      type: "set-property",
      key: "colorGroup",
      value: null,
      leds: [led],
    });
    ledDispatch({
      type: "set-property",
      key: "override",
      value: true,
      leds: [led],
    });
  };
  const onClosePicker = (ledsToClose: Led[]) => {
    let currHex = ledsToClose[0].hex;
    let newHex = currHex;
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      if (!leds[id].override && leds[id].hex !== currHex) {
        newHex = leds[id].hex;
        break;
      }
    }
    ledDispatch({
      type: "set-properties",
      payload: {
        override: false,
        colorGroup: null,
        hex: newHex
      },
      leds: ledsToClose,
    });
    setUpdateColorGroups(true);
    ledsToClose.forEach((led) => {
      if (wsRefs?.current && wsRefs.current[led.id]) {
        wsRefs.current[led.id].send(newHex);
      }
    });
  };

  useEffect(() => {
    storedLeds.forEach((led) => {
      if (wsRefs?.current && wsRefs.current[led.id]) return;
      wsRefs.current = {
        ...wsRefs.current,
        [led.id]: new WebSocket("ws://" + led.ip + ":81/", ["arduino"]),
      };
      let ws = wsRefs.current[led.id];
      ws.onopen = () => {
        ws.send("Connect " + new Date());
        console.log(`Connected to ${led.name}`);
        ledDispatch({ type: "add-led", led: led });
        setIds((currentIds) => currentIds.concat(led.id));
      };
      ws.onmessage = (e) => {
        console.log(`${led.name}: ${e.data}`);
        if (e.data[0] === "#") {
          ledDispatch({
            type: "set-property",
            key: "hex",
            value: `#${("000000" + e.data.substring(1)).slice(-6)}`,
            leds: [led],
          });
          setUpdateColorGroups(true);
        }
        if (e.data[0] === "b") {
          ledDispatch({
            type: "set-property",
            key: "brightness",
            value: (parseInt(e.data.substring(1)) * 100) / 230,
            leds: [led],
          });
        }
      };
      ws.onerror = (error) => {
        console.log(`Error from ${led.name}:`, error);
      };
      ws.onclose = () => {
        console.log(`Connection lost from ${led.name}`);
        setIds((currentIds) => currentIds.filter((id) => id !== led.id));
      };
    });
    return () => {
      storedLeds.forEach((led) => {
        if (wsRefs?.current && wsRefs?.current[led.id])
          wsRefs.current[led.id].close();
      });
    };
  }, []);

  useEffect(() => {
    if (updateColorGroups) {
      setUpdateColorGroups(false);

      let newColors: string[] = [];
      for (let i = 0; i < ids.length; i++) {
        let led = leds[ids[i]];
        if (newColors.indexOf(led.hex) === -1) newColors.push(led.hex);
      }

      let newLeds: LedMap = {};
      for (let i = 0; i < ids.length; i++) {
        let led = leds[ids[i]];
        newLeds[ids[i]] = {
          ...led,
          colorGroup: newColors.indexOf(led.hex),
        };
      }
      ledDispatch({ type: "set-leds", ledMap: newLeds });
    }
  }, [leds, ids, updateColorGroups]);

  const getPickerData = (): Led[][] => {
    let overrideData: Led[][] = [];
    let colorGroupData: Led[][] = [];
    ids.forEach((id) => {
      let led = leds[id];
      if (!led) return;
      if (led.override) {
        overrideData.push([led]);
        return;
      }

      colorGroupData[led.colorGroup || 0] != null
        ? colorGroupData[led.colorGroup || 0].push(led)
        : (colorGroupData[led.colorGroup || 0] = [led]);
    });
    return overrideData.concat(colorGroupData).filter(Boolean);
  };

  const divStyle = {
    height: "100%",
    width: "100%",
  };
  let ledGroups = getPickerData();
  return (
    <div style={divStyle}>
      {ledGroups.map((leds, index) => (
        <ColorPicker
          key={index}
          leds={leds}
          changeColorCallback={onColorChange}
          changeBrightnessCallback={onBrightnessChange}
          nameSelectCallback={onNameSelect}
          closePickerCallback={onClosePicker}
          powerSwitchCallback={onPowerSwitch}
          height={`${100 / ledGroups.length}%`}
          width={width}
        ></ColorPicker>
      ))}
    </div>
  );
};
