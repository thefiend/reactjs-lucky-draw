import React, { Component } from "react";
import TextLoop from "react-text-loop";
import { Button, Card, Table, Grid } from "tabler-react";
import "./App.css";

import DrawForm from "./components/DrawForm";
import SiteWrapper from "./SiteWrapper";
import "tabler-react/dist/Tabler.css";

const style = {
  resultsBlock: {
    textAlign: "center",
    alignItems: "center",
  },
};

class App extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      items: [],
      pastDrawnItems: [],
      result: "",
      animation: true,
      animationInterval: 150,
      showResult: false,
      disableDrawButton: false,
      value: "",
      placeholder: "Please enter the draw items here. One item per line.",
      valid: false,
      touched: false,
      validationRules: {
        minLength: 3,
        isRequired: true,
      },
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    let formInputItems = this.state.drawItems;
    let addItems = formInputItems.split("\n");
    this.setState({
      ...this.state,
      items: addItems,
    });
  }

  handleChange(e) {
    this.setState({ [e.name]: e.value });
  }

  sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  randomDrawItem = () => {
    this.setState({
      ...this.state,
      showResult: false,
      disableDrawButton: true,
    });

    let maxItemIndex = this.state.items.length;
    const randomIndex = Math.floor(Math.random() * maxItemIndex);
    this.sleep(3000).then(() => {
      this.setState({
        ...this.state,
        result: this.state.items[randomIndex],
        pastDrawnItems: [
          ...this.state.pastDrawnItems,
          this.state.items[randomIndex],
        ],
        showResult: true,
        disableDrawButton: false,
      });
    });
  };

  render() {
    return (
      <SiteWrapper>
        <div className="container">
          {this.state.items.length !== 0 && (
            <div
              style={{
                textAlign: "center",
                paddingTop: "32px",
                paddingBottom: "32px",
              }}
            >
              <Grid.Row className="Result-section">
                <Grid.Col md={2} sm={0} />
                <Grid.Col md={6} sm={12} className={style.resultsBlock}>
                  <div
                    style={{
                      textAlign: "left",
                      fontSize: "40px",
                      paddingBottom: "40px",
                      paddingTop: "40px",
                    }}
                  >
                    {!this.state.showResult &&
                    this.state.items && (
                      <TextLoop
                        interval={100}
                        springConfig={{ stiffness: 180, damping: 8 }}
                        children={this.state.items}
                      />
                    )}
                    {this.state.showResult && this.state.result}
                  </div>
                  <Button
                    name="drawButton"
                    color="primary"
                    onClick={this.randomDrawItem}
                    disabled={this.state.disableDrawButton}
                  >
                    {this.state.disableDrawButton ? "Drawing..." : "Draw"}
                  </Button>
                </Grid.Col>
                <Grid.Col md={4} sm={12}>
                  <Card
                    title="Previously Drawn"
                    body={
                      <Table>
                        <Table.Body>
                          {this.state.pastDrawnItems.length == 0 ? (
                            <p>No previous item.</p>
                          ) : (
                            this.state.pastDrawnItems.map((item, index) => (
                              <Table.Row>
                                <Table.Col>{item}</Table.Col>
                              </Table.Row>
                            ))
                          )}
                        </Table.Body>
                      </Table>
                    }
                  />
                </Grid.Col>
              </Grid.Row>
            </div>
          )}
          <Grid.Row>
            <Grid.Col sm={12} md={8}>
              <DrawForm
                onSubmit={this.handleSubmit}
                onChange={this.handleChange}
                placeholder={this.state.placeholder}
                style={{
                  paddingTop: "64px",
                  paddingBottom: "64px",
                  width: "100%",
                }}
              />
            </Grid.Col>
          </Grid.Row>
        </div>
      </SiteWrapper>
    );
  }
}

export default App;
