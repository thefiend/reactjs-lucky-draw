import React from "react";
import { Card } from "tabler-react";
import "./style.css";

const FaqSection = () => {
  return (
    <>
      <h1>Frequently Asked Questions (FAQ)</h1>
      <Card>
        <Card.Body>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What tools can I use to do a lucky draw?</Card.Title>
            </Card.Header>
            <Card.Body>
              <b>
                <a href="http://luckydraw.me/">Lucky Draw Simulator</a>
              </b>{" "}
              is a great tool which many companies and individuals trust and use
              to ensure a fair and transparent drawing process. It is free and
              easy to use which requires only a few configurations to get
              started right away.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What is a lucky draw tool?</Card.Title>
            </Card.Header>
            <Card.Body>
              A software or platform for randomly selecting winners in contests
              or events.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How does a lucky draw tool work?</Card.Title>
            </Card.Header>
            <Card.Body>
              Users input participants, and the tool randomly selects winners
              based on settings.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How does a lucky draw work?</Card.Title>
            </Card.Header>
            <Card.Body>
              A lucky draw is a gambling competition in which people randomly
              obtain numbered tickets and each tickets have a chance of winning
              a prize. A numbered ticket is selected at random and the selected
              winner walks away with a prize.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>
                How can I ensure that the tool is fair and random?
              </Card.Title>
            </Card.Header>
            <Card.Body>
              Look for certified random number generators and transparency
              features.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>Does the tool support multiple winners?</Card.Title>
            </Card.Header>
            <Card.Body>
              Yes, LuckyDraw.me allow selecting multiple winners per draw.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How do you hold a lucky draw?</Card.Title>
            </Card.Header>
            <Card.Body>
              Any company or individuals can easily host a lucky draw online
              simply by setting a certain requirements and prepare rewards for
              the winners. Tools such as{" "}
              <b>
                <a href="http://luckydraw.me/">Lucky Draw Simulator</a>
              </b>{" "}
              is then used to select the winners, ensuring a fair and
              transparent drawing process.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What is a good lucky draw prize?</Card.Title>
            </Card.Header>
            <Card.Body>
              Prizes such as Electronic Devices, Gift Baskets, Seasonal
              Products, Television, Gift Vouchers and Travel Voucher are popular
              lucky draw prize ideas.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>
                How secure is the Luckydraw.me for storing data?
              </Card.Title>
            </Card.Header>
            <Card.Body>
              LuckyDraw.me uses a secure server and does not store any of the
              information used.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What are popular lucky draw tools?</Card.Title>
            </Card.Header>
            <Card.Body>
              Popular options include LuckyDraw.me, RandomPicker, and Comment
              Picker.
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </>
  );
};

export default FaqSection;
