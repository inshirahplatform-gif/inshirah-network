// SMS Adapter Service for Bangladeshi SMS Providers
// Supports multiple providers via environment variables

type SMSProvider = "greenweb" | "bulksmsbd" | "generic";

interface SMSConfig {
  provider: SMSProvider;
  apiUrl: string;
  apiToken: string;
  senderId?: string;
}

interface SMSSendResult {
  success: boolean;
  error?: string;
  providerResponse?: any;
}

/**
 * Format phone number to Bangladeshi standard (880 prefix)
 * @param phone - Phone number in any format
 * @returns Formatted phone number with 880 prefix
 */
function formatBangladeshiPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // If already starts with 880 and has 13 digits, return as is
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    return cleaned;
  }
  
  // If starts with 0 and has 11 digits, replace 0 with 880
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "880" + cleaned.substring(1);
  }
  
  // If has 10 digits (without 0), add 880 prefix
  if (cleaned.length === 10) {
    return "880" + cleaned;
  }
  
  // If already starts with 880 but wrong length, return as is
  if (cleaned.startsWith("880")) {
    return cleaned;
  }
  
  // Default: add 880 prefix
  return "880" + cleaned;
}

/**
 * Get SMS configuration from environment variables
 */
function getSMSConfig(): SMSConfig | null {
  const provider = (process.env.SMS_PROVIDER || "generic") as SMSProvider;
  const apiUrl = process.env.SMS_API_URL;
  const apiToken = process.env.SMS_API_TOKEN;
  const senderId = process.env.SMS_SENDER_ID;

  if (!apiUrl || !apiToken) {
    console.warn("SMS_API_URL or SMS_API_TOKEN not set - SMS notifications will be disabled");
    return null;
  }

  return { provider, apiUrl, apiToken, senderId };
}

/**
 * Send SMS using GreenWeb provider
 * @param config - SMS configuration
 * @param to - Recipient phone number
 * @param message - SMS message
 */
async function sendViaGreenWeb(
  config: SMSConfig,
  to: string,
  message: string
): Promise<SMSSendResult> {
  try {
    const formattedPhone = formatBangladeshiPhone(to);
    
    const payload = new URLSearchParams({
      token: config.apiToken,
      to: formattedPhone,
      message: message,
    });

    // Add sender ID if provided
    if (config.senderId) {
      payload.append("from", config.senderId);
    }

    const response = await fetch(`${config.apiUrl}?${payload.toString()}`, {
      method: "GET",
    });

    const result = await response.text();
    
    if (!response.ok) {
      console.error("GreenWeb SMS error:", result);
      return { success: false, error: "SMS send failed", providerResponse: result };
    }

    console.log("GreenWeb SMS sent successfully to:", formattedPhone);
    return { success: true, providerResponse: result };
  } catch (error) {
    console.error("GreenWeb SMS error:", error);
    return { success: false, error: "SMS send failed" };
  }
}

/**
 * Send SMS using BulkSMSBD provider
 * @param config - SMS configuration
 * @param to - Recipient phone number
 * @param message - SMS message
 */
async function sendViaBulkSMSBD(
  config: SMSConfig,
  to: string,
  message: string
): Promise<SMSSendResult> {
  try {
    const formattedPhone = formatBangladeshiPhone(to);
    
    const payload: any = {
      api_key: config.apiToken,
      number: formattedPhone,
      message: message,
    };

    // Add sender ID if provided
    if (config.senderId) {
      payload.sender_id = config.senderId;
    }

    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("BulkSMSBD SMS error:", result);
      return { success: false, error: "SMS send failed", providerResponse: result };
    }

    console.log("BulkSMSBD SMS sent successfully to:", formattedPhone);
    return { success: true, providerResponse: result };
  } catch (error) {
    console.error("BulkSMSBD SMS error:", error);
    return { success: false, error: "SMS send failed" };
  }
}

/**
 * Send SMS using generic provider
 * @param config - SMS configuration
 * @param to - Recipient phone number
 * @param message - SMS message
 */
async function sendViaGeneric(
  config: SMSConfig,
  to: string,
  message: string
): Promise<SMSSendResult> {
  try {
    const formattedPhone = formatBangladeshiPhone(to);
    
    // Try POST with JSON first
    const payload: any = {
      api_key: config.apiToken,
      to: formattedPhone,
      message: message,
    };

    // Add sender ID if provided
    if (config.senderId) {
      payload.sender_id = config.senderId;
    }

    let response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // If POST fails, try GET with query params
    if (!response.ok) {
      const queryParams = new URLSearchParams({
        api_key: config.apiToken,
        to: formattedPhone,
        message: message,
      });

      if (config.senderId) {
        queryParams.append("sender_id", config.senderId);
      }

      response = await fetch(`${config.apiUrl}?${queryParams.toString()}`, {
        method: "GET",
      });
    }

    const result = await response.text();
    
    if (!response.ok) {
      console.error("Generic SMS error:", result);
      return { success: false, error: "SMS send failed", providerResponse: result };
    }

    console.log("Generic SMS sent successfully to:", formattedPhone);
    return { success: true, providerResponse: result };
  } catch (error) {
    console.error("Generic SMS error:", error);
    return { success: false, error: "SMS send failed" };
  }
}

/**
 * Unified SMS send function
 * Automatically routes to the appropriate provider based on SMS_PROVIDER environment variable
 * @param to - Recipient phone number (will be formatted to Bangladeshi standard)
 * @param message - SMS message content
 * @returns Promise with success status and error details if failed
 */
export async function sendSMS(to: string, message: string): Promise<SMSSendResult> {
  const config = getSMSConfig();

  if (!config) {
    return { success: false, error: "SMS not configured" };
  }

  switch (config.provider) {
    case "greenweb":
      return sendViaGreenWeb(config, to, message);
    case "bulksmsbd":
      return sendViaBulkSMSBD(config, to, message);
    case "generic":
    default:
      return sendViaGeneric(config, to, message);
  }
}

/**
 * Test SMS configuration
 * @returns Configuration status
 */
export function testSMSConfig(): {
  configured: boolean;
  provider?: SMSProvider;
  apiUrl?: string;
  hasToken: boolean;
} {
  const config = getSMSConfig();
  
  if (!config) {
    return { configured: false, hasToken: false };
  }

  return {
    configured: true,
    provider: config.provider,
    apiUrl: config.apiUrl,
    hasToken: !!config.apiToken,
  };
}
