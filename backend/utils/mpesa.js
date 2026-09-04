const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

export const formatPhoneNumber = (phone) => {
  const cleaned = String(phone).replace(/[\s-+]/g, '');
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return `254${cleaned}`;
  return cleaned;
};

export const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const base = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = `${base}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`M-Pesa OAuth failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token received');
  return data.access_token;
};

export const initiateSTKPush = async (phone, amount, accountRef, description, token) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const base = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const formattedPhone = formatPhoneNumber(phone);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: description,
  };

  const url = `${base}/mpesa/stkpush/v1/processrequest`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
};
