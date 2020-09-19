import React from "react";
import CSS from "csstype";
import logo from "../resources/circles.png"
import '../App.css'
export const Header = () => {
  const style: CSS.Properties = {
    height: "23px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "20px"
  };
  const logoStyle: CSS.Properties = {
      maxHeight: '100%',
      height: 'auto',
      width: 'auto',
    //   paddingRight: "20px"
  }
  const typeStyle: CSS.Properties = {
      color: "#fff",
      fontSize: "36px",
  }
  return (
    <header style={style}>
        <img style={logoStyle} src={logo}/>
        {/* <div className={"headerText"} style={typeStyle}>Lighter</div> */}
    </header>
  );
};
