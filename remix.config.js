/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    appDirectory: "app",
    future: {
      v3_fetcherPersist: true,
      v3_relativeSplatPath: true,
      v3_throwAbortReason: true,
      v3_lazyRouteDiscovery: true,
      v3_singleFetch: false,
      // ❌ Entferne diese Zeile oder stelle sie auf "routes"
      // v3_routeConvention: "flat",
    },
  };
  