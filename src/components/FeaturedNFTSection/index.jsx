import { Grid } from 'tabler-react';
import { NFTS } from '../../constants';

const FeaturedNFTSection = () => {
  return (
    <Grid.Row>
      <Grid.Col xs={12} md={12}>
        <h2>Featured NFTs</h2>
        <p>NFTs that you won't want to miss!</p>
      </Grid.Col>

      {NFTS.map(function (item, i) {
        return (
          <Grid.Col xs={12} md={6}>
            <nft-card
              width="100%"
              tokenAddress={item.tokenAddress}
              tokenId={item.tokenId}
              network="mainnet"
              referrerAddress="0x0f3cbf9d7d9949f0da801633ae706a931fc70f57"
            ></nft-card>
          </Grid.Col>
        );
      })}
    </Grid.Row>
  );
};

export default FeaturedNFTSection;
