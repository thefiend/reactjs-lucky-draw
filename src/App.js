import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./pages/home/Home";
import Faq from "./pages/faq/Faq";

import "tabler-react/dist/Tabler.css";

type Props = {||};

function App(props: Props): React.Node {
  return (
    <React.StrictMode>
      <Router>
        <Switch>
          <Route path="/faq" component={Faq} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
}

export default App;