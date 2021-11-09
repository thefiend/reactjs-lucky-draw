import { Button, Grid } from 'tabler-react';

import { SPONSORS } from '../../constants';

const SponsorsSection = () => {
  return (
    <>
      <Grid.Row>
        <Grid.Col xs={12} md={8}>
          <h2>Sponsors</h2>
          <p>Special thanks to the following companies.</p>
          <h3>
            Platinum Tier
            <Button
              className="contribute-button"
              href="./list"
              target="_blank"
              outline
              size="sm"
              RootComponent="a"
              color="primary"
            >
              Contribute to List
            </Button>
          </h3>
          <p>Contribute $300 or more to be featured.</p>
          <p>
            <b>Crypto:</b> 0x52D646D040E832D074e062ddf540584788cEd026
          </p>
        </Grid.Col>
      </Grid.Row>
      <Grid.Row>
        {SPONSORS.map(function (sponsor, i) {
          return (
            <Grid.Col key={i} xs={12} md={3}>
              <a className="margin-auto" href={sponsor.url}>
                <img src={sponsor.img} alt={sponsor.name} />
                <h3>{sponsor.name}</h3>
              </a>
            </Grid.Col>
          );
        })}
      </Grid.Row>
    </>
  );
};

export default SponsorsSection;
