export const APP_NAME = 'Lucky Draw Simulator';

export const NAVBAR_ITEMS = [
  {
    value: 'Home',
    to: '/',
    icon: 'home',
    useExact: true,
  },
  {
    value: 'Lucky Draw',
    icon: 'box',
    to: '/',
  },
  {
    value: 'FAQ',
    icon: 'list',
    to: '/faq',
  },
];

const TOKEN_ADDRESS = {
  abstracto: '0x495f947276749ce646f68ac8c248420045cb7b5e',
};

export const NFTS = [
  {
    id: 111,
    tokenAddress: TOKEN_ADDRESS.abstracto,
    tokenId:
      '6892026032126658451935152639010948463078151507551751331963617821034278813697',
  },
  {
    id: 112,
    tokenAddress: TOKEN_ADDRESS.abstracto,
    tokenId:
      '6892026032126658451935152639010948463078151507551751331963617822133790441473',
  },
  {
    id: 113,
    tokenAddress: TOKEN_ADDRESS.abstracto,
    tokenId:
      '6892026032126658451935152639010948463078151507551751331963617823233302069249',
  },
  {
    id: 115,
    tokenAddress: TOKEN_ADDRESS.abstracto,
    tokenId:
      '6892026032126658451935152639010948463078151507551751331963617825432325324801',
  },
  // {
  //   id: 116,
  //   tokenAddress: TOKEN_ADDRESS.abstracto,
  //   tokenId:"6892026032126658451935152639010948463078151507551751331963617826531836952577"
  // },
  // {
  //   id: 117,
  //   tokenAddress: TOKEN_ADDRESS.abstracto,
  //   tokenId:"6892026032126658451935152639010948463078151507551751331963617827631348580353"
  // },
  // {
  //   id: 118,
  //   tokenAddress: TOKEN_ADDRESS.abstracto,
  //   tokenId:"6892026032126658451935152639010948463078151507551751331963617828730860208129"
  // },
  // {
  //   id: 119,
  //   tokenAddress: TOKEN_ADDRESS.abstracto,
  //   tokenId:"6892026032126658451935152639010948463078151507551751331963617829830371835905"
  // },
  // {
  //   id: 121,
  //   tokenAddress: TOKEN_ADDRESS.abstracto,
  //   tokenId:"6892026032126658451935152639010948463078151507551751331963617832029395091457"
  // },
];

export const SPONSORS = [
  {
    name: 'ECEmbroid',
    url: 'https://www.ecembroid.com',
    img: './images/ecembroid.png',
  },
  {
    name: 'The Roofing Specialist',
    url: 'http://theroofingspecialist.sg/',
    img: './images/theroofingspecialist.png',
  },
  {
    name: 'J&K Roof Contractors',
    url: 'https://www.jkroof.com.sg/',
    img: './images/JKRoof.png',
  },
];
