import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useFetcher, useActionData, Form, useNavigate, useSearchParams, Link as Link$1, useRouteError } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { Page, Layout, Card, BlockStack, Text, Link, List, Box, InlineStack, Button, AppProvider, FormLayout, TextField } from "@shopify/polaris";
import { TitleBar, useAppBridge, NavMenu } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.April24,
  // Nutze aktuelle stabile Version
  scopes: process.env.SCOPES.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  sessionStorage: new MemorySessionStorage(),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: false
    // REST API brauchst du weiterhin für Produkte!
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.April24;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function App$2() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$2
}, Symbol.toStringTag, { value: "Module" }));
const action$5 = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await db.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
const action$4 = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4
}, Symbol.toStringTag, { value: "Module" }));
const action$3 = async ({ request }) => {
  var _a, _b;
  const { admin } = await authenticate.admin(request);
  try {
    const body = await request.json();
    const { school, klasse, deliveryDate, items, total } = body;
    if (!school || !klasse || !deliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      return json({ error: "❌ Ungültige Anfrage: Bitte alle Felder ausfüllen und mindestens ein Produkt hinzufügen." }, { status: 400 });
    }
    const title = `Schulbox – ${school} – ${klasse}`;
    const description = `Diese Schulbox enthält ${items.length} Artikel für die Klasse ${klasse} der ${school}. Lieferdatum: ${deliveryDate}.`;
    const productData = {
      product: {
        title,
        body_html: description,
        vendor: "Schulbox",
        product_type: "Schulmaterial",
        tags: ["Schulbox", school, klasse],
        variants: [
          {
            price: total.toFixed(2),
            title: "Standard",
            sku: `SB-${klasse}-${Date.now()}`
          }
        ]
      }
    };
    const response = await admin.rest.post({
      path: "products",
      data: productData,
      type: "application/json"
    });
    return json({
      success: true,
      message: "✅ Schulbox erfolgreich erstellt.",
      productId: (_b = (_a = response == null ? void 0 : response.body) == null ? void 0 : _a.product) == null ? void 0 : _b.id
    });
  } catch (err) {
    console.error("❌ Fehler beim Erstellen der Schulbox:", err);
    return json({ error: "Ein Fehler ist beim Erstellen der Schulbox aufgetreten." }, { status: 500 });
  }
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
function AdditionalPage() {
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx(TitleBar, { title: "Additional page" }),
    /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
          "The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              url: "https://shopify.dev/docs/apps/tools/app-bridge",
              target: "_blank",
              removeUnderline: true,
              children: "App Bridge"
            }
          ),
          "."
        ] }),
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
          "To create your own page and have it show up in the app navigation, add a page inside ",
          /* @__PURE__ */ jsx(Code, { children: "app/routes" }),
          ", and a link to it in the ",
          /* @__PURE__ */ jsx(Code, { children: "<NavMenu>" }),
          " component found in ",
          /* @__PURE__ */ jsx(Code, { children: "app/routes/app.jsx" }),
          "."
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Resources" }),
        /* @__PURE__ */ jsx(List, { children: /* @__PURE__ */ jsx(List.Item, { children: /* @__PURE__ */ jsx(
          Link,
          {
            url: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            removeUnderline: true,
            children: "App nav best practices"
          }
        ) }) })
      ] }) }) })
    ] })
  ] });
}
function Code({ children }) {
  return /* @__PURE__ */ jsx(
    Box,
    {
      as: "span",
      padding: "025",
      paddingInlineStart: "100",
      paddingInlineEnd: "100",
      background: "bg-surface-active",
      borderWidth: "025",
      borderColor: "border",
      borderRadius: "100",
      children: /* @__PURE__ */ jsx("code", { children })
    }
  );
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdditionalPage
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
  var _a, _b;
  try {
    const { admin } = await authenticate.admin(request);
    console.log("📦 Lade Produkte via Shopify Admin API");
    const response = await admin.rest.get({
      path: "products"
    });
    const products = (_b = (_a = response == null ? void 0 : response.body) == null ? void 0 : _a.products) == null ? void 0 : _b.map((product) => {
      var _a2, _b2;
      return {
        id: product.id,
        title: product.title,
        price: parseFloat(((_b2 = (_a2 = product.variants) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.price) || "0")
      };
    });
    if (!products) {
      throw new Error("❌ Keine Produkte gefunden oder Format ungültig.");
    }
    return json({ products });
  } catch (error) {
    console.error("💥 Fehler im loader:", error);
    throw new Response("Fehler beim Laden der Produkte", { status: 500 });
  }
};
function ConfiguratorRoute() {
  const { products } = useLoaderData();
  const [selectedItems, setSelectedItems] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const surcharge = 5;
  const addToBox = (product) => {
    setSelectedItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map(
          (item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) + surcharge;
  const createBox = () => {
    alert(
      `📦 Schulbox erstellt!

🧑‍🏫 Schule: ${schoolName}
📚 Klasse: ${schoolClass}
📅 Lieferung: ${deliveryDate}
🛍️ Artikel: ${selectedItems.length}
💶 Gesamt: ${total.toFixed(2)} €`
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "📦 Schulbox-Konfigurator" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: products.map((product) => /* @__PURE__ */ jsxs("div", { className: "border rounded p-4 shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: product.title }),
      /* @__PURE__ */ jsxs("p", { children: [
        product.price.toFixed(2),
        " €"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "mt-2 bg-blue-600 text-white px-4 py-1 rounded",
          onClick: () => addToBox(product),
          children: "Hinzufügen"
        }
      )
    ] }, product.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "🛒 Deine Schulbox" }),
      /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5", children: selectedItems.map((item) => /* @__PURE__ */ jsxs("li", { children: [
        item.quantity,
        "x ",
        item.title,
        " – ",
        item.price.toFixed(2),
        " €"
      ] }, item.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          "Schule:",
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "border p-1 ml-2",
              value: schoolName,
              onChange: (e) => setSchoolName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          "Klasse:",
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "border p-1 ml-2",
              value: schoolClass,
              onChange: (e) => setSchoolClass(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          "Lieferdatum:",
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "border p-1 ml-2",
              value: deliveryDate,
              onChange: (e) => setDeliveryDate(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 font-semibold", children: [
        "💰 Gesamt inkl. Aufschlag: ",
        total.toFixed(2),
        " €"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: createBox,
          className: "mt-2 bg-green-600 text-white px-4 py-2 rounded",
          children: "📦 Schulbox erstellen"
        }
      )
    ] })
  ] });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConfiguratorRoute,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const action$2 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][Math.floor(Math.random() * 4)];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`
        }
      }
    }
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }]
      }
    }
  );
  const variantResponseJson = await variantResponse.json();
  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants
  };
};
function Index() {
  var _a, _b, _c, _d;
  const fetcher = useFetcher();
  const shopify2 = useAppBridge();
  const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
  const productId = (_b = (_a = fetcher.data) == null ? void 0 : _a.product) == null ? void 0 : _b.id.replace(
    "gid://shopify/Product/",
    ""
  );
  useEffect(() => {
    if (productId) {
      shopify2.toast.show("Product created");
    }
  }, [productId, shopify2]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });
  return /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsx(TitleBar, { title: "Remix app template", children: /* @__PURE__ */ jsx("button", { variant: "primary", onClick: generateProduct, children: "Generate a product" }) }),
    /* @__PURE__ */ jsx(BlockStack, { gap: "500", children: /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Congrats on creating a new Shopify app 🎉" }),
          /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", as: "p", children: [
            "This embedded app template uses",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                url: "https://shopify.dev/docs/apps/tools/app-bridge",
                target: "_blank",
                removeUnderline: true,
                children: "App Bridge"
              }
            ),
            " ",
            "interface examples like an",
            " ",
            /* @__PURE__ */ jsx(Link, { url: "/app/additional", removeUnderline: true, children: "additional page in the app nav" }),
            ", as well as an",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                url: "https://shopify.dev/docs/api/admin-graphql",
                target: "_blank",
                removeUnderline: true,
                children: "Admin GraphQL"
              }
            ),
            " ",
            "mutation demo, to provide a starting point for app development."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
          /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Get started with products" }),
          /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
            "Generate a product with GraphQL and get the JSON output for that product. Learn more about the",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                url: "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
                target: "_blank",
                removeUnderline: true,
                children: "productCreate"
              }
            ),
            " ",
            "mutation in our API references."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(InlineStack, { gap: "300", children: [
          /* @__PURE__ */ jsx(Button, { loading: isLoading, onClick: generateProduct, children: "Generate a product" }),
          ((_c = fetcher.data) == null ? void 0 : _c.product) && /* @__PURE__ */ jsx(
            Button,
            {
              url: `shopify:admin/products/${productId}`,
              target: "_blank",
              variant: "plain",
              children: "View product"
            }
          )
        ] }),
        ((_d = fetcher.data) == null ? void 0 : _d.product) && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Text, { as: "h3", variant: "headingMd", children: [
            " ",
            "productCreate mutation"
          ] }),
          /* @__PURE__ */ jsx(
            Box,
            {
              padding: "400",
              background: "bg-surface-active",
              borderWidth: "025",
              borderRadius: "200",
              borderColor: "border",
              overflowX: "scroll",
              children: /* @__PURE__ */ jsx("pre", { style: { margin: 0 }, children: /* @__PURE__ */ jsx("code", { children: JSON.stringify(fetcher.data.product, null, 2) }) })
            }
          ),
          /* @__PURE__ */ jsxs(Text, { as: "h3", variant: "headingMd", children: [
            " ",
            "productVariantsBulkUpdate mutation"
          ] }),
          /* @__PURE__ */ jsx(
            Box,
            {
              padding: "400",
              background: "bg-surface-active",
              borderWidth: "025",
              borderRadius: "200",
              borderColor: "border",
              overflowX: "scroll",
              children: /* @__PURE__ */ jsx("pre", { style: { margin: 0 }, children: /* @__PURE__ */ jsx("code", { children: JSON.stringify(fetcher.data.variant, null, 2) }) })
            }
          )
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "App template specs" }),
          /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "span", variant: "bodyMd", children: "Framework" }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  url: "https://remix.run",
                  target: "_blank",
                  removeUnderline: true,
                  children: "Remix"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "span", variant: "bodyMd", children: "Database" }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  url: "https://www.prisma.io/",
                  target: "_blank",
                  removeUnderline: true,
                  children: "Prisma"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "span", variant: "bodyMd", children: "Interface" }),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    url: "https://polaris.shopify.com",
                    target: "_blank",
                    removeUnderline: true,
                    children: "Polaris"
                  }
                ),
                ", ",
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    url: "https://shopify.dev/docs/apps/tools/app-bridge",
                    target: "_blank",
                    removeUnderline: true,
                    children: "App Bridge"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "span", variant: "bodyMd", children: "API" }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  url: "https://shopify.dev/docs/api/admin-graphql",
                  target: "_blank",
                  removeUnderline: true,
                  children: "GraphQL API"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Next steps" }),
          /* @__PURE__ */ jsxs(List, { children: [
            /* @__PURE__ */ jsxs(List.Item, { children: [
              "Build an",
              " ",
              /* @__PURE__ */ jsxs(
                Link,
                {
                  url: "https://shopify.dev/docs/apps/getting-started/build-app-example",
                  target: "_blank",
                  removeUnderline: true,
                  children: [
                    " ",
                    "example app"
                  ]
                }
              ),
              " ",
              "to get started"
            ] }),
            /* @__PURE__ */ jsxs(List.Item, { children: [
              "Explore Shopify’s API with",
              " ",
              /* @__PURE__ */ jsx(
                Link,
                {
                  url: "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
                  target: "_blank",
                  removeUnderline: true,
                  children: "GraphiQL"
                }
              )
            ] })
          ] })
        ] }) })
      ] }) })
    ] }) })
  ] });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Index,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = /* @__PURE__ */ JSON.parse('{"ActionMenu":{"Actions":{"moreActions":"More actions"},"RollupActions":{"rollupButton":"View actions"}},"ActionList":{"SearchField":{"clearButtonLabel":"Clear","search":"Search","placeholder":"Search actions"}},"Avatar":{"label":"Avatar","labelWithInitials":"Avatar with initials {initials}"},"Autocomplete":{"spinnerAccessibilityLabel":"Loading","ellipsis":"{content}…"},"Badge":{"PROGRESS_LABELS":{"incomplete":"Incomplete","partiallyComplete":"Partially complete","complete":"Complete"},"TONE_LABELS":{"info":"Info","success":"Success","warning":"Warning","critical":"Critical","attention":"Attention","new":"New","readOnly":"Read-only","enabled":"Enabled"},"progressAndTone":"{toneLabel} {progressLabel}"},"Banner":{"dismissButton":"Dismiss notification"},"Button":{"spinnerAccessibilityLabel":"Loading"},"Common":{"checkbox":"checkbox","undo":"Undo","cancel":"Cancel","clear":"Clear","close":"Close","submit":"Submit","more":"More"},"ContextualSaveBar":{"save":"Save","discard":"Discard"},"DataTable":{"sortAccessibilityLabel":"sort {direction} by","navAccessibilityLabel":"Scroll table {direction} one column","totalsRowHeading":"Totals","totalRowHeading":"Total"},"DatePicker":{"previousMonth":"Show previous month, {previousMonthName} {showPreviousYear}","nextMonth":"Show next month, {nextMonth} {nextYear}","today":"Today ","start":"Start of range","end":"End of range","months":{"january":"January","february":"February","march":"March","april":"April","may":"May","june":"June","july":"July","august":"August","september":"September","october":"October","november":"November","december":"December"},"days":{"monday":"Monday","tuesday":"Tuesday","wednesday":"Wednesday","thursday":"Thursday","friday":"Friday","saturday":"Saturday","sunday":"Sunday"},"daysAbbreviated":{"monday":"Mo","tuesday":"Tu","wednesday":"We","thursday":"Th","friday":"Fr","saturday":"Sa","sunday":"Su"}},"DiscardConfirmationModal":{"title":"Discard all unsaved changes","message":"If you discard changes, you’ll delete any edits you made since you last saved.","primaryAction":"Discard changes","secondaryAction":"Continue editing"},"DropZone":{"single":{"overlayTextFile":"Drop file to upload","overlayTextImage":"Drop image to upload","overlayTextVideo":"Drop video to upload","actionTitleFile":"Add file","actionTitleImage":"Add image","actionTitleVideo":"Add video","actionHintFile":"or drop file to upload","actionHintImage":"or drop image to upload","actionHintVideo":"or drop video to upload","labelFile":"Upload file","labelImage":"Upload image","labelVideo":"Upload video"},"allowMultiple":{"overlayTextFile":"Drop files to upload","overlayTextImage":"Drop images to upload","overlayTextVideo":"Drop videos to upload","actionTitleFile":"Add files","actionTitleImage":"Add images","actionTitleVideo":"Add videos","actionHintFile":"or drop files to upload","actionHintImage":"or drop images to upload","actionHintVideo":"or drop videos to upload","labelFile":"Upload files","labelImage":"Upload images","labelVideo":"Upload videos"},"errorOverlayTextFile":"File type is not valid","errorOverlayTextImage":"Image type is not valid","errorOverlayTextVideo":"Video type is not valid"},"EmptySearchResult":{"altText":"Empty search results"},"Frame":{"skipToContent":"Skip to content","navigationLabel":"Navigation","Navigation":{"closeMobileNavigationLabel":"Close navigation"}},"FullscreenBar":{"back":"Back","accessibilityLabel":"Exit fullscreen mode"},"Filters":{"moreFilters":"More filters","moreFiltersWithCount":"More filters ({count})","filter":"Filter {resourceName}","noFiltersApplied":"No filters applied","cancel":"Cancel","done":"Done","clearAllFilters":"Clear all filters","clear":"Clear","clearLabel":"Clear {filterName}","addFilter":"Add filter","clearFilters":"Clear all","searchInView":"in:{viewName}"},"FilterPill":{"clear":"Clear","unsavedChanges":"Unsaved changes - {label}"},"IndexFilters":{"searchFilterTooltip":"Search and filter","searchFilterTooltipWithShortcut":"Search and filter (F)","searchFilterAccessibilityLabel":"Search and filter results","sort":"Sort your results","addView":"Add a new view","newView":"Custom search","SortButton":{"ariaLabel":"Sort the results","tooltip":"Sort","title":"Sort by","sorting":{"asc":"Ascending","desc":"Descending","az":"A-Z","za":"Z-A"}},"EditColumnsButton":{"tooltip":"Edit columns","accessibilityLabel":"Customize table column order and visibility"},"UpdateButtons":{"cancel":"Cancel","update":"Update","save":"Save","saveAs":"Save as","modal":{"title":"Save view as","label":"Name","sameName":"A view with this name already exists. Please choose a different name.","save":"Save","cancel":"Cancel"}}},"IndexProvider":{"defaultItemSingular":"Item","defaultItemPlural":"Items","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} are selected","selected":"{selectedItemsCount} selected","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}"},"IndexTable":{"emptySearchTitle":"No {resourceNamePlural} found","emptySearchDescription":"Try changing the filters or search term","onboardingBadgeText":"New","resourceLoadingAccessibilityLabel":"Loading {resourceNamePlural}…","selectAllLabel":"Select all {resourceNamePlural}","selected":"{selectedItemsCount} selected","undo":"Undo","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural}","selectItem":"Select {resourceName}","selectButtonText":"Select","sortAccessibilityLabel":"sort {direction} by"},"Loading":{"label":"Page loading bar"},"Modal":{"iFrameTitle":"body markup","modalWarning":"These required properties are missing from Modal: {missingProps}"},"Page":{"Header":{"rollupActionsLabel":"View actions for {title}","pageReadyAccessibilityLabel":"{title}. This page is ready"}},"Pagination":{"previous":"Previous","next":"Next","pagination":"Pagination"},"ProgressBar":{"negativeWarningMessage":"Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.","exceedWarningMessage":"Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."},"ResourceList":{"sortingLabel":"Sort by","defaultItemSingular":"item","defaultItemPlural":"items","showing":"Showing {itemsCount} {resource}","showingTotalCount":"Showing {itemsCount} of {totalItemsCount} {resource}","loading":"Loading {resource}","selected":"{selectedItemsCount} selected","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} in your store are selected","allFilteredItemsSelected":"All {itemsLength}+ {resourceNamePlural} in this filter are selected","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural} in your store","selectAllFilteredItems":"Select all {itemsLength}+ {resourceNamePlural} in this filter","emptySearchResultTitle":"No {resourceNamePlural} found","emptySearchResultDescription":"Try changing the filters or search term","selectButtonText":"Select","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}","Item":{"actionsDropdownLabel":"Actions for {accessibilityLabel}","actionsDropdown":"Actions dropdown","viewItem":"View details for {itemName}"},"BulkActions":{"actionsActivatorLabel":"Actions","moreActionsActivatorLabel":"More actions"}},"SkeletonPage":{"loadingLabel":"Page loading"},"Tabs":{"newViewAccessibilityLabel":"Create new view","newViewTooltip":"Create view","toggleTabsLabel":"More views","Tab":{"rename":"Rename view","duplicate":"Duplicate view","edit":"Edit view","editColumns":"Edit columns","delete":"Delete view","copy":"Copy of {name}","deleteModal":{"title":"Delete view?","description":"This can’t be undone. {viewName} view will no longer be available in your admin.","cancel":"Cancel","delete":"Delete view"}},"RenameModal":{"title":"Rename view","label":"Name","cancel":"Cancel","create":"Save","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"DuplicateModal":{"title":"Duplicate view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"CreateViewModal":{"title":"Create new view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}}},"Tag":{"ariaLabel":"Remove {children}"},"TextField":{"characterCount":"{count} characters","characterCountWithMaxLength":"{count} of {limit} characters used"},"TooltipOverlay":{"accessibilityLabel":"Tooltip: {label}"},"TopBar":{"toggleMenuLabel":"Toggle menu","SearchField":{"clearButtonLabel":"Clear","search":"Search"}},"MediaCard":{"dismissButton":"Dismiss","popoverButton":"Actions"},"VideoThumbnail":{"playButtonA11yLabel":{"default":"Play video","defaultWithDuration":"Play video of length {duration}","duration":{"hours":{"other":{"only":"{hourCount} hours","andMinutes":"{hourCount} hours and {minuteCount} minutes","andMinute":"{hourCount} hours and {minuteCount} minute","minutesAndSeconds":"{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hours, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hours, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hours, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hours and {secondCount} seconds","andSecond":"{hourCount} hours and {secondCount} second"},"one":{"only":"{hourCount} hour","andMinutes":"{hourCount} hour and {minuteCount} minutes","andMinute":"{hourCount} hour and {minuteCount} minute","minutesAndSeconds":"{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hour, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hour, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hour, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hour and {secondCount} seconds","andSecond":"{hourCount} hour and {secondCount} second"}},"minutes":{"other":{"only":"{minuteCount} minutes","andSeconds":"{minuteCount} minutes and {secondCount} seconds","andSecond":"{minuteCount} minutes and {secondCount} second"},"one":{"only":"{minuteCount} minute","andSeconds":"{minuteCount} minute and {secondCount} seconds","andSecond":"{minuteCount} minute and {secondCount} second"}},"seconds":{"other":"{secondCount} seconds","one":"{secondCount} second"}}}}}');
const polarisTranslations = {
  Polaris
};
const polarisStyles = "/assets/styles-BeiPL2RV.css";
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const links$1 = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$3 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors, polarisTranslations };
};
const action$1 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, { i18n: loaderData.polarisTranslations, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs(FormLayout, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Log in" }),
    /* @__PURE__ */ jsx(
      TextField,
      {
        type: "text",
        name: "shop",
        label: "Shop domain",
        helpText: "example.myshopify.com",
        value: shop,
        onChange: setShop,
        autoComplete: "on",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx(Button, { submit: true, children: "Log in" })
  ] }) }) }) }) });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Auth,
  links: links$1,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
function AuthForm({
  mode: mode2
}) {
  const actionData = useActionData();
  const isRegister = mode2 === "register";
  return /* @__PURE__ */ jsxs("form", { method: "post", children: [
    isRegister && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("input", { name: "vorname", placeholder: "Vorname", required: true }),
      /* @__PURE__ */ jsx("input", { name: "nachname", placeholder: "Nachname", required: true })
    ] }),
    /* @__PURE__ */ jsx("input", { name: "email", type: "email", placeholder: "E-Mail", required: true }),
    /* @__PURE__ */ jsx("input", { name: "password", type: "password", placeholder: "Passwort", required: true }),
    /* @__PURE__ */ jsx("button", { type: "submit", children: isRegister ? "Registrieren" : "Einloggen" }),
    (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("p", { className: "text-red-500", children: actionData.error })
  ] });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AuthForm
}, Symbol.toStringTag, { value: "Module" }));
const SUPABASE_URL = "https://smbtuojsbjkaewxnebas.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is not defined in the environment variables");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
const action = async ({ request }) => {
  const form2 = await request.formData();
  const email = form2.get("email");
  const password = form2.get("password");
  form2.get("vorname");
  form2.get("nachname");
  const { data, error } = await supabase.auth.signUp({
    email: String(email),
    password: String(password)
  });
  if (error) return json({ error: error.message });
  return null;
};
function RegisterRoute() {
  return /* @__PURE__ */ jsx(AuthForm, { mode: "register" });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: RegisterRoute
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
function Profil() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate(`/login?redirectTo=${window.location.pathname}`);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const user = sessionData.session.user;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
        return;
      }
      setProfile(data);
    }
    loadProfile();
  }, [navigate]);
  if (!profile) {
    return /* @__PURE__ */ jsx("p", { children: "Lade Profil..." });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h1", { children: [
      "Willkommen ",
      profile.Vorname,
      " ",
      profile.Nachname
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Adresse: ",
      profile.Straße,
      " ",
      profile.Hausnummer,
      ", ",
      profile.Postleitzahl,
      " ",
      profile.Ort
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Telefon: ",
      profile.Telefonnummer
    ] }),
    /* @__PURE__ */ jsxs("p", { children: [
      "E-Mail: ",
      profile.email
    ] })
  ] });
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Profil
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_1hqgz_1";
const heading = "_heading_1hqgz_21";
const text = "_text_1hqgz_23";
const content = "_content_1hqgz_43";
const form = "_form_1hqgz_53";
const label = "_label_1hqgz_69";
const input = "_input_1hqgz_85";
const button = "_button_1hqgz_93";
const list = "_list_1hqgz_101";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$1 = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return { showForm: Boolean(login) };
};
function App$1() {
  const { showForm } = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: styles.index, children: /* @__PURE__ */ jsxs("div", { className: styles.content, children: [
    /* @__PURE__ */ jsx("h1", { className: styles.heading, children: "A short heading about [your app]" }),
    /* @__PURE__ */ jsx("p", { className: styles.text, children: "A tagline about [your app] that describes your value proposition." }),
    showForm && /* @__PURE__ */ jsxs(Form, { className: styles.form, method: "post", action: "/auth/login", children: [
      /* @__PURE__ */ jsxs("label", { className: styles.label, children: [
        /* @__PURE__ */ jsx("span", { children: "Shop domain" }),
        /* @__PURE__ */ jsx("input", { className: styles.input, type: "text", name: "shop" }),
        /* @__PURE__ */ jsx("span", { children: "e.g: my-shop-domain.myshopify.com" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles.button, type: "submit", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: styles.list, children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] })
    ] })
  ] }) });
}
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error: error2 } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error2) {
      setError(error2.message);
    } else {
      window.location.href = redirectTo;
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { children: "Login" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "E-Mail",
          required: true
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          placeholder: "Passwort",
          required: true
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", children: "Login" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { style: { color: "red" }, children: error })
  ] });
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider$1, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link$1, { to: "/app", rel: "home", children: "Home" }),
      /* @__PURE__ */ jsx(Link$1, { to: "/app/additional", children: "Additional page" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-CiESaanM.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js", "/assets/index-C38EnwDo.js", "/assets/components-BMtjqD3P.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-SdZ89jEf.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js", "/assets/index-C38EnwDo.js", "/assets/components-BMtjqD3P.js"], "css": [] }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.create-box": { "id": "routes/api.create-box", "parentId": "root", "path": "api/create-box", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.create-box-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.additional-6rp91bly.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/index-BX_Ozi1w.js", "/assets/Page-BEGjlRVU.js", "/assets/List-BpoT0Xuu.js", "/assets/index-BkUYTdRf.js", "/assets/context-Dnjp4kKx.js"], "css": [] }, "routes/configurator": { "id": "routes/configurator", "parentId": "root", "path": "configurator", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/configurator-CDUT7F9s.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/components-BMtjqD3P.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-CTnTQdW9.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/index-BX_Ozi1w.js", "/assets/components-BMtjqD3P.js", "/assets/Page-BEGjlRVU.js", "/assets/List-BpoT0Xuu.js", "/assets/index-BkUYTdRf.js", "/assets/index-C38EnwDo.js", "/assets/index-CebVLIw1.js", "/assets/context-Dnjp4kKx.js"], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-TufXweCV.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/styles-D7QnGEGN.js", "/assets/components-BMtjqD3P.js", "/assets/Page-BEGjlRVU.js", "/assets/context-Dnjp4kKx.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/AuthForm": { "id": "routes/AuthForm", "parentId": "root", "path": "AuthForm", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/AuthForm-DHiY6zqV.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/components-BMtjqD3P.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/register": { "id": "routes/register", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/register-Dpm94EVt.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/AuthForm-DHiY6zqV.js", "/assets/components-BMtjqD3P.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/profil": { "id": "routes/profil", "parentId": "root", "path": "profil", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/profil-B53Nvu93.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/supabaseClient-D4IyPCTA.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CxkNbsYd.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/components-BMtjqD3P.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": ["/assets/route-Cnm7FvdT.css"] }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/login-BLiJ5fnu.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/supabaseClient-D4IyPCTA.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/index-CebVLIw1.js"], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-C09FJ-5F.js", "imports": ["/assets/index-B3ts7GOF.js", "/assets/components-BMtjqD3P.js", "/assets/styles-D7QnGEGN.js", "/assets/index-BX_Ozi1w.js", "/assets/index-CebVLIw1.js", "/assets/index-C38EnwDo.js", "/assets/index-BkUYTdRf.js", "/assets/context-Dnjp4kKx.js"], "css": [] } }, "url": "/assets/manifest-45f687b1.js", "version": "45f687b1" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/api.create-box": {
    id: "routes/api.create-box",
    parentId: "root",
    path: "api/create-box",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/configurator": {
    id: "routes/configurator",
    parentId: "root",
    path: "configurator",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/AuthForm": {
    id: "routes/AuthForm",
    parentId: "root",
    path: "AuthForm",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/register": {
    id: "routes/register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/profil": {
    id: "routes/profil",
    parentId: "root",
    path: "profil",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route13
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
