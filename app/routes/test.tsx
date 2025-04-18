import { shopifyApp } from "@shopify/shopify-app-remix/server";

export const loader = async () => {
  const result = shopifyApp;
  return null;
};
