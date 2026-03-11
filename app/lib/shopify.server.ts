// app/lib/shopify.server.ts
// Zentraler Shopify API Helper – eliminiert doppelten Code

const SHOPIFY_DOMAIN = process.env.SHOP_DOMAIN!;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;

export async function shopifyStorefront<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/2024-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    throw new Response("Shopify API Fehler", { status: res.status });
  }

  const json = await res.json();
  if (json.errors) {
    console.error("[Shopify Storefront]", json.errors);
    throw new Response("Shopify GraphQL Fehler", { status: 500 });
  }

  return json.data as T;
}

export async function shopifyAdmin<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/2024-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!res.ok) {
    throw new Response("Shopify Admin API Fehler", { status: res.status });
  }

  const json = await res.json();
  return json.data as T;
}

export async function shopifyAdminRest<T = any>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/2024-04/${endpoint}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[Shopify Admin REST]", text);
    throw new Response("Shopify Admin REST Fehler", { status: res.status });
  }

  return res.json() as Promise<T>;
}

// --- Produkt-Queries ---

const PRODUCT_FIELDS = `
  id
  title
  handle
  productType
  tags
  descriptionHtml
  images(first: 5) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 10) {
    edges {
      node {
        id
        title
        price {
          amount
          currencyCode
        }
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
`;

export async function getProducts(first: number = 50, query?: string) {
  const queryFilter = query ? `, query: "${query}"` : "";
  const data = await shopifyStorefront(`{
    products(first: ${first}${queryFilter}) {
      edges {
        node {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }`);
  return data.products.edges.map((e: any) => e.node);
}

export async function getProductByHandle(handle: string) {
  const data = await shopifyStorefront(
    `query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        ${PRODUCT_FIELDS}
      }
    }`,
    { handle }
  );
  return data.productByHandle;
}

export async function getCollections() {
  const data = await shopifyStorefront(`{
    collections(first: 20) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }`);
  return data.collections.edges.map((e: any) => e.node);
}

export async function getProductsByCollection(handle: string) {
  const data = await shopifyStorefront(
    `query getCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        products(first: 50) {
          edges {
            node {
              ${PRODUCT_FIELDS}
            }
          }
        }
      }
    }`,
    { handle }
  );
  return data.collectionByHandle;
}

export async function createShopifyCheckoutUrl(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<string | null> {
  const data = await shopifyStorefront(
    `mutation createCart($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines }
  );
  return data.cartCreate?.cart?.checkoutUrl ?? null;
}
