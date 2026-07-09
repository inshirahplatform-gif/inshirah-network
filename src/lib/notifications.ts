// Notification service for email and SMS
// Integrated with Brevo for email delivery via HTTP API
// Integrated with SMS Adapter Service for SMS delivery

import { sendSMS } from "@/services/smsService";

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

if (!BREVO_API_KEY) {
  console.warn("BREVO_API_KEY not set - email notifications will be disabled");
}

interface NotificationConfig {
  email?: {
    to: string;
    subject: string;
    body: string;
    html?: string;
  };
  sms?: {
    to: string;
    message: string;
  };
}

export async function sendNotification(config: NotificationConfig) {
  try {
    // Email notification using Brevo HTTP API
    if (config.email) {
      if (!BREVO_API_KEY) {
        console.warn("Brevo not configured - skipping email notification");
        return { success: false, error: "Brevo not configured" };
      }

      if (!process.env.FROM_EMAIL) {
        console.warn("FROM_EMAIL not set - skipping email notification");
        return { success: false, error: "FROM_EMAIL not configured" };
      }

      try {
        const payload = {
          sender: {
            email: process.env.FROM_EMAIL,
            name: "ইনশিরাহ নেটওয়ার্ক"
          },
          to: [{ email: config.email.to }],
          subject: config.email.subject,
          textContent: config.email.body,
          htmlContent: config.email.html || config.email.body,
        };

        const response = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Brevo email error:", errorText);
          return { success: false, error: "Email send failed" };
        }

        console.log("Email sent successfully to:", config.email.to);
      } catch (emailError) {
        console.error("Brevo email error:", emailError);
        // Don't throw - return error so the calling process can continue
        return { success: false, error: "Email send failed" };
      }
    }

    // SMS notification using SMS Adapter Service
    if (config.sms) {
      try {
        const smsResult = await sendSMS(config.sms.to, config.sms.message);
        if (!smsResult.success) {
          console.error("SMS send failed:", smsResult.error);
          // Don't throw - return error so the calling process can continue
          return { success: false, error: "SMS send failed" };
        }
        console.log("SMS sent successfully to:", config.sms.to);
      } catch (smsError) {
        console.error("SMS notification error:", smsError);
        // Don't throw - return error so the calling process can continue
        return { success: false, error: "SMS send failed" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Notification error:", error);
    return { success: false, error };
  }
}

// Pre-defined notification templates
export const notificationTemplates = {
  orderConfirmation: (orderId: string, amount: number, customerName: string = "গ্রাহক", customerPhone?: string) => ({
    email: {
      subject: "অর্ডার কনফার্মেশন - ইনশিরাহ নেটওয়ার্ক",
      body: `আপনার অর্ডার #${orderId} কনফার্ম হয়েছে। মোট পরিমাণ: ${amount} টাকা।`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-id { background: #e5e7eb; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
            .amount { font-size: 24px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>অর্ডার কনফার্মেশন</h1>
              <p>ইনশিরাহ নেটওয়ার্ক</p>
            </div>
            <div class="content">
              <p>প্রিয় ${customerName},</p>
              <p>আপনার অর্ডার সফলভাবে কনফার্ম হয়েছে। আমরা আপনার প্রোডাক্ট প্রস্তুত করছি।</p>
              
              <div class="order-id">অর্ডার নম্বর: #${orderId}</div>
              
              <div class="amount">${amount} টাকা</div>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://inshirah-network.com/orders/${orderId}" class="btn">অর্ডার ট্র্যাক করুন</a>
              </p>
              
              <p style="margin-top: 30px;">আপনার অর্ডার সম্পর্কে কোন প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।</p>
            </div>
            <div class="footer">
              <p>শরিয়াহ-সম্মত ই-কমার্স প্ল্যাটফর্ম</p>
              <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে উত্তর দবেন না।</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    sms: customerPhone ? {
      to: customerPhone,
      message: `আপনার অর্ডার #${orderId} কনফার্ম হয়েছে। মোট: ${amount} টাকা। ইনশিরাহ নেটওয়ার্ক`,
    } : undefined,
  }),
  orderShipped: (orderId: string, trackingNumber: string, customerName: string = "গ্রাহক", customerPhone?: string) => ({
    email: {
      subject: "অর্ডার পাঠানো হয়েছে - ইনশিরাহ নেটওয়ার্ক",
      body: `আপনার অর্ডার #${orderId} পাঠানো হয়েছে। ট্র্যাকিং নম্বর: ${trackingNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .tracking-box { background: #e5e7eb; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .tracking-number { font-size: 18px; font-weight: bold; color: #7c3aed; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .btn { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>অর্ডার পাঠানো হয়েছে</h1>
              <p>ইনশিরাহ নেটওয়ার্ক</p>
            </div>
            <div class="content">
              <p>প্রিয় ${customerName},</p>
              <p>আপনার অর্ডার সফলভাবে পাঠানো হয়েছে। আপনি শীঘ্রই আপনার প্রোডাক্ট পাবেন।</p>
              
              <div class="tracking-box">
                <p>ট্র্যাকিং নম্বর</p>
                <div class="tracking-number">${trackingNumber}</div>
              </div>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://inshirah-network.com/orders/${orderId}" class="btn">অর্ডার ট্র্যাক করুন</a>
              </p>
              
              <p style="margin-top: 30px;">ডেলিভারি সম্পর্কে কোন প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।</p>
            </div>
            <div class="footer">
              <p>শরিয়াহ-সম্মত ই-কমার্স প্ল্যাটফর্ম</p>
              <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে উত্তর দবেন না।</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    sms: customerPhone ? {
      to: customerPhone,
      message: `অর্ডার #${orderId} পাঠানো হয়েছে। ট্র্যাকিং: ${trackingNumber}। ইনশিরাহ নেটওয়ার্ক`,
    } : undefined,
  }),
  orderDelivered: (orderId: string, customerName: string = "গ্রাহক", customerPhone?: string) => ({
    email: {
      subject: "অর্ডার ডেলিভারড - ইনশিরাহ নেটওয়ার্ক",
      body: `আপনার অর্ডার #${orderId} সফলভাবে ডেলিভার হয়েছে।`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .order-id { background: #e5e7eb; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>অর্ডার ডেলিভারড</h1>
              <p>ইনশিরাহ নেটওয়ার্ক</p>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <p style="text-align: center; font-size: 18px; color: #10b981; font-weight: bold;">আপনার অর্ডার সফলভাবে ডেলিভার হয়েছে!</p>
              
              <p>প্রিয় ${customerName},</p>
              <p>আপনার অর্ডার #${orderId} সফলভাবে ডেলিভার হয়েছে। আমরা আশা করি আপনি প্রোডাক্টে সন্তুষ্ট হবেন।</p>
              
              <div class="order-id">অর্ডার নম্বর: #${orderId}</div>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://inshirah-network.com/products" class="btn">আরও প্রোডাক্ট দেখুন</a>
              </p>
              
              <p style="margin-top: 30px;">প্রোডাক্ট সম্পর্কে আপনার মতামত আমাদের জানান।</p>
            </div>
            <div class="footer">
              <p>শরিয়াহ-সম্মত ই-কমার্স প্ল্যাটফর্ম</p>
              <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে উত্তর দবেন না।</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    sms: customerPhone ? {
      to: customerPhone,
      message: `অর্ডার #${orderId} ডেলিভার হয়েছে। ধন্যবাদ! ইনশিরাহ নেটওয়ার্ক`,
    } : undefined,
  }),
  priceDrop: (productName: string, newPrice: number, customerName: string = "গ্রাহক", customerPhone?: string) => ({
    email: {
      subject: "প্রাইস ড্রপ এলার্ট - ইনশিরাহ নেটওয়ার্ক",
      body: `${productName} এর দাম কমে ${newPrice} টাকা হয়েছে।`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .price-box { background: #fef3c7; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .old-price { text-decoration: line-through; color: #9ca3af; font-size: 18px; }
            .new-price { font-size: 32px; color: #d97706; font-weight: bold; }
            .product-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>প্রাইস ড্রপ এলার্ট</h1>
              <p>ইনশিরাহ নেটওয়ার্ক</p>
            </div>
            <div class="content">
              <p>প্রিয় ${customerName},</p>
              <p>আপনি যে প্রোডাক্টের জন্য এলার্ট সেট করেছিলেন, তার দাম কমে গেছে!</p>
              
              <div class="price-box">
                <div class="product-name">${productName}</div>
                <div class="old-price">আগের দাম</div>
                <div class="new-price">${newPrice} টাকা</div>
              </div>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://inshirah-network.com/products" class="btn">এখনই কিনুন</a>
              </p>
              
              <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">এই অফার সীমিত সময়ের জন্য থাকতে পারে।</p>
            </div>
            <div class="footer">
              <p>শরিয়াহ-সম্মত ই-কমার্স প্ল্যাটফর্ম</p>
              <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে। অনুগ্রহ করে উত্তর দবেন না।</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    sms: customerPhone ? {
      to: customerPhone,
      message: `${productName} এর দাম কমে ${newPrice} টাকা হয়েছে। ইনশিরাহ নেটওয়ার্ক`,
    } : undefined,
  }),
};
