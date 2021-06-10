import { Nav, Button } from 'tabler-react';

const NavItems = () => {
  return (
    <Nav.Item type="div" className="d-none d-md-flex">
      <Button
        className="social-button"
        color="primary"
        icon="facebook"
        href="https://www.facebook.com/luckydrawme/"
        target="_blank"
        RootComponent="a"
      />
      <Button
        className="social-button"
        color="danger"
        icon="instagram"
        href="https://www.instagram.com/luckydrawme/"
        target="_blank"
        RootComponent="a"
      />
      <Button
      className="social-button"
        href="https://github.com/thefiend/random-draw"
        target="_blank"
        outline
        size="md"
        RootComponent="a"
        color="primary"
      >
        Source code
      </Button>
      <Button
        className="social-button"
        pill
        icon="heart"
        href="https://www.buymeacoffee.com/jasonkam"
        target="_blank"
        size="md"
        RootComponent="a"
        color="orange"
      >
        Donate
      </Button>
    </Nav.Item>
  );
};

export default NavItems;
