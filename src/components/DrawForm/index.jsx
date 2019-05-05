import React, { Component } from "react";
import { Form, Button, Header } from "tabler-react";
import style from "./style.jsx";

class DrawForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onChange(e.target);
  }

  render() {
    return (
      <div style={this.props.style}>
        <Header.H3>Configuration</Header.H3>
        <div style={style.form}>
          <Form onSubmit={this.props.onSubmit}>
            <Form.FieldSet>
              <Form.Group label="List of Items" isRequired>
                <Form.Textarea
                  name="drawItems"
                  placeholder={this.props.placeholder}
                  value={this.props.value}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Checkbox
                  name="skipAnimation"
                  label="Skip Animation"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Checkbox
                  name="noRepeat"
                  label="Remove Drawn Item"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Button color="primary" type="submit">
                Submit
              </Button>
            </Form.FieldSet>
          </Form>
        </div>
      </div>
    );
  }
}

export default DrawForm;
