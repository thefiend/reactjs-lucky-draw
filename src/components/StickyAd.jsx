import React, { useEffect } from 'react';

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    zIndex: 9999,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
};

function StickyAd() {
  useEffect(() => {
    if (window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        window.ezstandalone.displayMore(999);
      });
    }
  }, []);

  return (
    <div style={styles.wrapper}>
      <div id="ezoic-pub-ad-placeholder-sticky-footer"></div>
    </div>
  );
}

export default StickyAd;
