/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    appDirectory: "app",
    future: {
      v3_fetcherPersist: true,
      v3_relativeSplatPath: true,
      v3_throwAbortReason: true,
      v3_lazyRouteDiscovery: true,
      v3_singleFetch: false,
      v3_routeConvention: "flat", // optional, abhängig von deiner Struktur
    },
  };
  