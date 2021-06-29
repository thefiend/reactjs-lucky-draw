import { ContactCard, Grid } from 'tabler-react';
import { NFTS } from '../../constants';

const FeaturedNFTSection = () => {
  return (
    <Grid.Row>
      <Grid.Col xs={12} md={12}>
        <h2>Featured NFTs</h2>
        <p>NFTs that you won't want to miss!</p>
      </Grid.Col>
      <Grid.Col xs={12} md={12}>
        <ContactCard
          cardTitle="Elohim AI"
          rounded
          objectURL="images/elohim-ai.gif"
          alt="Elohim AI"
          name={'Elohim AI'}
          address={{
            line1: 'The AI created NFTs. 8K resolution NFT in distributed IPFS. Sick!',
          }}
          details={[
            { title: 'OpenSea', content: <a href="https://opensea.io/assets/elohim-ai-abstracto/">https://opensea.io/collection/elohim-ai-abstracto/</a> },
            { title: 'Instagram', content: <a href="https://www.instagram.com/elohim.ai.nft/">https://www.instagram.com/elohim.ai.nft/</a> },
            { title: 'Twitter', content: <a href="https://twitter.com/AiElohim/">https://twitter.com/AiElohim/</a> },
            { title: 'Facebook', content: <a href="https://www.facebook.com/elohim.ai.nft/">https://www.facebook.com/elohim.ai.nft/</a> },
          ]}
          description={`Abstracto Series are AI created abstract NFT artworks created by Elohim AI. The AI learns from 1000 of the top renown artists' artwork and creates top quality pieces based on them.

          The first 100 are reserved for future plans and to ensure the integrity of the artwork series. A maximum of 10,000 artwork will be created. First 100 pieces were created on Day 1 - 26 May 2021. Subsequently, 10 NFT artwork will be created and minted daily until the 10,000 cap is reached.
          
          `}
        />
      </Grid.Col>
      {NFTS.map(function (item, i) {
        return (
          <Grid.Col key={i} xs={12} md={6}>
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
