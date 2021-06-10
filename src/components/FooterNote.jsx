import { Button } from 'tabler-react';

function FooterNote() {
  return (
    <>
      Raffle lucky draw online tool created to select random winners much
      easier. Randomizing a winner is now easier than ever! Random picker,
      raffle, draw, contest.
      <Button.List>
        <Button
          className="footer-social-button"
          color="primary"
          icon="facebook"
          href="https://www.facebook.com/luckydrawme/"
        />
        <Button
          className="footer-social-button"
          color="danger"
          icon="instagram"
          href="https://www.instagram.com/luckydrawme/"
        />
      </Button.List>
    </>
  );
}

export default FooterNote;
