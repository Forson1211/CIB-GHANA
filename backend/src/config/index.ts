import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || 'https://ijfjuezgvroyhtwcnlrx.supabase.co',
    anonKey:
      process.env.SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmp1ZXpndnJveWh0d2NubHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjIzNzQsImV4cCI6MjEwNTg5ODM3NH0.cbzToWOHT5DeYbtXDqG_lt_Lfxsb3Y-eJaQkC5UJW40',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmp1ZXpndnJveWh0d2NubHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDMyMjM3NCwiZXhwIjoyMTA1ODk4Mzc0fQ.LKsElhVQb7kY4Xek5SvoTwTpZ1rsuWbjSBX7-SlMP9k',
  },

  // Access Bank Ghana WebPay Gateway (Collections WEB_ACQ)
  accessWebpay: {
    serviceCode:
      process.env.ACCESS_WEBPAY_SERVICE_CODE ||
      process.env.ACCESS_WEBPAY_API_KEY ||
      'TjBFMmVscGxlVmRhUjI0eC5kZXYuTW5sM05FNXhWamxhY1dkUQ==',
    isTest: process.env.ACCESS_WEBPAY_IS_TEST !== 'false',
    initUrl:
      process.env.ACCESS_WEBPAY_INIT_URL ||
      (process.env.ACCESS_WEBPAY_IS_TEST === 'false'
        ? 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Init'
        : 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Test/Init'),
    statusUrl:
      process.env.ACCESS_WEBPAY_STATUS_URL ||
      'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Transaction/Status',
    merchantService: process.env.ACCESS_WEBPAY_MERCHANT_SERVICE || 'WEB_ACQ',
    merchantId: process.env.ACCESS_WEBPAY_MERCHANT_ID || 'WEB_ACQ',
  },

  // Email Service (Resend or SMTP via Nodemailer)
  email: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'CIB Ghana <cibghevent@resend.dev>',
    replyTo: process.env.REPLY_TO_EMAIL || 'cibghevent@cibghana.org',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'CIB Ghana <cibghevent@cibghana.org>',
    },
  },
};

