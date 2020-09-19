import React from 'react';
import GridLoader from "react-spinners/GridLoader";
import {LoaderSizeMarginProps} from "react-spinners/interfaces"

export const Spinner = (props: LoaderSizeMarginProps) => {
  const style = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
return <div style={style}> <GridLoader {...props} /></div>;
};
