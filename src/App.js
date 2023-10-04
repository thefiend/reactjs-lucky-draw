import "tabler-react/dist/Tabler.css";

import * as React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

import Faq from "./pages/faq/Faq";
import Home from "./pages/home/Home";
import List from "./pages/list/List";

function App() {
  return (
    <React.StrictMode>
      <Router>
        <Switch>
          <Route path="/list" element={<List />} />
          <Route path="/faq" element={<Faq />} />
          <Route exact path="/" element={<Home />} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
}

export default App;