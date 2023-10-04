import React from "react";
import { Card, Table } from "tabler-react";
import "./style.css";

const PreviouslyDrawnItemsBlock = props => (
  <Card
    title="Raffle Winners"
    className="past-drawn-block text-center justify-content-center shadow-none"
    body={
      <Table>
        <Table.Body className="past-drawn-item">
          {props.pastDrawnItems.length === 0
            ? "No previous item."
            : props.pastDrawnItems.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Col>{item}</Table.Col>
                </Table.Row>
              ))}
        </Table.Body>
      </Table>
    }
  />
);

export default PreviouslyDrawnItemsBlock;
