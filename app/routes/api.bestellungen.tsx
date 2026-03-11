import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { shopifyAdmin } from "~/lib/shopify.server";
import { getAuthenticatedSupabase } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Auth guard: only logged-in users can access
  const { isLoggedIn, user, response } = await getAuthenticatedSupabase(request);
  if (!isLoggedIn || !user?.email) {
    return json({ error: "Nicht authentifiziert" }, { status: 401, headers: response.headers });
  }

  // Users can only fetch their own orders
  const email = user.email;

  try {
    // Sanitize email for GraphQL query
    const safeEmail = email.replace(/[\\"\n\r]/g, "");
    const query = `
      {
        customers(first: 1, query: "email:${safeEmail}") {
          edges {
            node {
              id
              orders(first: 50, sortKey: CREATED_AT, reverse: true) {
                edges {
                  node {
                    id
                    name
                    createdAt
                    displayFinancialStatus
                    displayFulfillmentStatus
                    totalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    lineItems(first: 20) {
                      edges {
                        node {
                          title
                          quantity
                          originalUnitPriceSet {
                            shopMoney {
                              amount
                            }
                          }
                        }
                      }
                    }
                    statusPageUrl
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyAdmin(query);
    const customer = data?.data?.customers?.edges?.[0]?.node;

    if (!customer) {
      return json({ orders: [] });
    }

    const orders = customer.orders.edges.map((edge: any) => {
      const order = edge.node;
      return {
        id: order.id,
        name: order.name,
        created_at: order.createdAt,
        financial_status: (order.displayFinancialStatus || "pending").toLowerCase(),
        fulfillment_status: order.displayFulfillmentStatus
          ? order.displayFulfillmentStatus.toLowerCase()
          : null,
        total_price: order.totalPriceSet.shopMoney.amount,
        currency: order.totalPriceSet.shopMoney.currencyCode,
        line_items: order.lineItems.edges.map((li: any) => ({
          title: li.node.title,
          quantity: li.node.quantity,
          price: li.node.originalUnitPriceSet?.shopMoney?.amount || "0",
        })),
        order_status_url: order.statusPageUrl || null,
      };
    });

    return json({ orders });
  } catch (err) {
    console.error("Fehler beim Laden der Bestellungen:", err);
    return json({ error: "Fehler beim Laden der Bestellungen" }, { status: 500 });
  }
}
