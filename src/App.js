import "tabler-react/dist/Tabler.css";

import * as React from "react";

import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import Faq from "./pages/faq/Faq";
import Home from "./pages/home/Home";
import List from "./pages/list/List";

type Props = {||};

function App(props: Props): React.Node {
  return (
    <React.StrictMode>
      <Router>
        <Switch>
          <Route path="/list" component={List} />
          <Route path="/faq" component={Faq} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
}

export default App;