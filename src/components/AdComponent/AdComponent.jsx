import React from "react";

export default class AdComponent extends React.Component {
  componentDidMount() {
    try {
      window._mNHandle.queue.push(function () {
        window._mNDetails.loadTag("175212434", "300x250", "175212434");
      });
    } catch (error) {}
  }

  render() {
    return (
      <div id="175212434">
      </div>
    );
  }
}
