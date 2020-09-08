import React, { ChangeEvent, FormEvent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Slider, { SliderProps as MuiSliderProps } from "@material-ui/core/Slider";
import { Omit } from '@material-ui/types';

interface Props{
  color: string;
//   onChange:
//   ((event: ChangeEvent<{}>, value: any) => void)
//   | ((event: FormEvent<HTMLButtonElement>) => void); //Hack from https://github.com/mui-org/material-ui/issues/17454#issuecomment-647132303
    onChangeCallback: (v: number) => void;
}

const useStyles = makeStyles({
    root: {
      color: (props: Props) => props.color,
      height: 8,
      padding: 0,
    },
  });

export default function SettingSlider(props: Props & Omit<MuiSliderProps, keyof Props>) {
  const { color, onChangeCallback, ...other } = props;
  const classes = useStyles(props);
  return <Slider 
  className={classes.root} {...other} 
  onChange={(e: ChangeEvent<{}>, v: number | number[])=>onChangeCallback( Array.isArray(v) ? v[0] : v)} 
  />;
}