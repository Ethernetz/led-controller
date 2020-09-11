import React, { useState, useEffect, useRef } from "react";
import { ColorPicker } from "./color-picker.component";
import { Led, storedLeds } from "../Leds";
import { useWindowWidth } from "./useWindowWidth";

type LedMap = { [id: number]: Led };
export const LedContainer = () => {
  const [leds, setLeds] = useState<LedMap>({});
  const [ids, setIds] = useState<number[]>([]);
  const [updateColorGroups, setUpdateColorGroups] = useState(false);
  const width = useWindowWidth();

  const wsRefs = useRef<{ [id: number]: WebSocket }>();

  const onColorChange = (leds: Led[], hex: string) => {
    let newLeds: LedMap = {};
    leds.forEach((led) => {
      newLeds[led.id] = {
        ...led,
        hex: hex,
      };
      
      if (wsRefs?.current && wsRefs.current[led.id]) {
        wsRefs.current[led.id].send(hex);
      }
    });

    setLeds((currentLeds) => ({ ...currentLeds, ...newLeds }));
  };

  const onBrightnessChange = (led: Led, brightness: number) => {
    if (wsRefs?.current && wsRefs.current[led.id]) {
      wsRefs.current[led.id].send("b" + Math.floor((brightness * 230) / 100));
    }
    setLeds((currentLeds) => ({
      ...currentLeds,
      [led.id]: {
        ...currentLeds[led.id],
        brightness: brightness,
      },
    }));
  };
  const onPowerSwitch = (led: Led, on: boolean) => {
    setLeds((currentLeds) => ({
      ...currentLeds,
      [led.id]: {
        ...currentLeds[led.id],
        on: on,
      },
    }));
  };

  const onNameSelect = (led: Led) => {
    setLeds((currentLeds) => ({
      ...currentLeds,
      [led.id]: {
        ...currentLeds[led.id],
        colorGroup: null,
        override: true,
      },
    }));
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
    let newLeds: LedMap = {};
    ledsToClose.forEach((led) => {
      console.log("newHex", newHex);
      newLeds[led.id] = {
        ...led,
        override: false,
        colorGroup: null,
        hex: newHex,
      };
      if (wsRefs?.current && wsRefs.current[led.id]) {
        wsRefs.current[led.id].send(newHex);
      }
    });
    setLeds((currentLeds) => ({ ...currentLeds, ...newLeds }));
    setUpdateColorGroups(true);
  };

  useEffect(() => {
    console.log("mounting!!!");
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
        setLeds((currentLeds) => ({
          ...currentLeds,
          [led.id]: {
            ...led,
          },
        }));
        setIds((currentIds) => currentIds.concat(led.id));
      };
      ws.onmessage = (e) => {
        console.log(`${led.name}: ${e.data}`);
        if (e.data[0] === "#") {
          let hex = `#${("000000" + e.data.substring(1)).slice(-6)}`;
          setLeds((currentLeds) => ({
            ...currentLeds,
            [led.id]: {
              ...currentLeds[led.id],
              hex: `#${("000000" + e.data.substring(1)).slice(-6)}`,
            },
          }));
          setUpdateColorGroups(true);
        }
        if (e.data[0] === "b") {
          setLeds((currentLeds) => ({
            ...currentLeds,
            [led.id]: {
              ...currentLeds[led.id],
              brightness: (parseInt(e.data.substring(1)) * 100) / 230,
            },
          }));
        }
      };
      ws.onerror = (error) => {
        console.log(`Error from ${led.name}:`, error);
      };
      ws.onclose = () => {
        console.log(`Connection lost from ${led.name}`);
        setLeds((currentLeds) => ({
          ...currentLeds,
          [led.id]: {
            ...currentLeds[led.id],
          },
        }));
        setIds((currentIds) => currentIds.filter((id) => id !== led.id));
      };
    });
    return () => {
      console.log("about to unmount!");
      storedLeds.forEach((led) => {
        if (wsRefs?.current && wsRefs?.current[led.id])
          wsRefs.current[led.id].close();
      });
    };
  }, []);

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
      console.log("newLeds", newLeds);
      setLeds((currentLeds) => ({ ...currentLeds, ...newLeds }));
    }
  }, [leds, updateColorGroups]);

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
