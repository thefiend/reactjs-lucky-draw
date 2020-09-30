import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./pages/home/Home";
import Faq from "./pages/faq/Faq";
import Donate from "./pages/donate/Donate";

import "tabler-react/dist/Tabler.css";

type Props = {||};

function App(props: Props): React.Node {
  return (
    <React.StrictMode>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/donate" component={Donate} />
          <Route exact path="/faq" component={Faq} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
}

export default App;