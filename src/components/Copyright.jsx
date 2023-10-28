import React from "react";
import { APP_NAME } from '../constants.js';

const Copyright = () => {
  return (
    <>
      Copyright © 2019 - {new Date().getFullYear()}
      <a href="/"> {APP_NAME}</a>. Powered by
      <a href="https://bestwebdesign.sg" target="_blank" rel="noopener noreferrer">
        {' '}
        Best Web Design
      </a>
      {'. '}
      All rights reserved.
      <br />
      Proudly sponsored by{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://ecembroid.com/"
      >
        ECEmbroid
      </a>
      .
    </>
  );
};

export default Copyright;