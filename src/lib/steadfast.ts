/**
 * Steadfast Courier API helper.
 * Docs: https://steadfast.com.bd/user/api
 *
 * All functions are server-only — never import in client components.
 */

export interface SteadfastOrderPayload {
  invoice:           string;
  recipient_name:    string;
  recipient_phone:   string;
  recipient_address: string;
  cod_amount:        number;
  note?:             string;
  // Dynamic sender/pickup — Steadfast uses these to dispatch the rider
  sender_name?:      string;
  sender_phone?:     string;
  sender_address?:   string;
}

export interface SteadfastOrderResponse {
  status:          number;   // HTTP-style: 200 = success
  message:         string;
  consignment: {
    tracking_code:    string;
    delivery_status?: string;
    [key: string]:    unknown;
  };
}

function getConfig() {
  const baseUrl   = process.env.STEADFAST_BASE_URL;
  const apiKey    = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;

  if (!baseUrl || !apiKey || !secretKey) {
    throw new Error(
      "STEADFAST_BASE_URL, STEADFAST_API_KEY, and STEADFAST_SECRET_KEY must be set in environment variables."
    );
  }

  return { baseUrl, apiKey, secretKey };
}

/**
 * Book a new parcel with Steadfast.
 * Returns the full parsed API response.
 */
export async function createSteadfastOrder(
  payload: SteadfastOrderPayload
): Promise<SteadfastOrderResponse> {
  const { baseUrl, apiKey, secretKey } = getConfig();

  const res = await fetch(`${baseUrl}/create_order`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key":      apiKey,
      "Secret-Key":   secretKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Steadfast API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<SteadfastOrderResponse>;
}

/**
 * Check the current delivery status of a consignment by tracking code.
 */
export async function trackSteadfastOrder(
  trackingCode: string
): Promise<{ status: number; delivery_status: string }> {
  const { baseUrl, apiKey, secretKey } = getConfig();

  const res = await fetch(
    `${baseUrl}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`,
    {
      headers: {
        "Api-Key":    apiKey,
        "Secret-Key": secretKey,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Steadfast tracking error (${res.status}): ${text}`);
  }

  return res.json();
}
