import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { LedContainer } from "./components/led-container.component";
import { Header } from "./components/header.component";
function App() {
  return (
    <Router>
      {/* <Header /> */}
      <Route path="/" exact component={LedContainer} />
    </Router>
  );
}

export default App;
