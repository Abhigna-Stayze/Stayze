import Script from "next/script";

/**
 * Analytics loader — inert until an ID is set.
 *
 * Reads the (public) measurement IDs from the environment and injects the
 * matching tag with `next/script` (`afterInteractive`, so it never blocks
 * paint). With none set — the state today — it renders nothing, so no
 * third-party script ships and there is no cookie/consent surface yet. Adding
 * analytics later is an env change, not a code change:
 *
 *   NEXT_PUBLIC_GA_ID       → Google Analytics 4
 *   NEXT_PUBLIC_GTM_ID      → Google Tag Manager
 *   NEXT_PUBLIC_CLARITY_ID  → Microsoft Clarity
 *
 * A Server Component: it emits the tags into the document but holds no state.
 * `src/lib/analytics.ts` is the matching call-site API (`track`, `pageview`).
 */
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID;

  if (!ga && !gtm && !clarity) return null;

  return (
    <>
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}

      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {clarity && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
    </>
  );
}
