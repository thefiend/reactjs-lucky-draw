import Script from "next/script";

const GA_ID = "UA-48215481-21";
const MEDIANET_CID = "8CUR14JKF";

/**
 * Third-party tags, all `afterInteractive` so none of them sits on the render
 * path. Deliberately not carried over from the old build: the AddThis widget
 * (service shut down), the Powr reviews embed, the Facebook page SDK, and the
 * NFT card script — four blocking origins that served no one.
 */
export default function Analytics() {
  return (
    <>
      <Script
        id="ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      <Script id="medianet-init" strategy="afterInteractive">
        {`window._mNHandle = window._mNHandle || {};
window._mNHandle.queue = window._mNHandle.queue || [];
window.medianet_versionId = '3121199';`}
      </Script>
      <Script
        id="medianet-loader"
        src={`https://contextual.media.net/dmedianet.js?cid=${MEDIANET_CID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
