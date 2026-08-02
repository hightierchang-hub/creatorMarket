import crypto from "crypto";

// eSewa's ePay v2 integration:
// 1. We build a signed HTML form and the browser POSTs it straight to eSewa.
// 2. eSewa redirects the browser back to our success/failure URL with a
//    base64-encoded `data` query param containing a signature.
// 3. We verify that signature AND independently call eSewa's status-check
//    API before ever marking a transaction paid - the redirect payload alone
//    is never trusted (a browser redirect can be replayed or forged).

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

const isLive = process.env.ESEWA_ENV === "live";

const ESEWA_GATEWAY_URL = isLive
  ? "https://epay.esewa.com.np/api/epay/main/v2/form"
  : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const ESEWA_STATUS_URL = isLive
  ? "https://epay.esewa.com.np/api/epay/transaction/status/"
  : "https://rc.esewa.com.np/api/epay/transaction/status/";

const sign = (message) => crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");

export const buildEsewaFormFields = ({ amount, transactionUuid, successUrl, failureUrl }) => {
  const totalAmount = amount.toFixed(2);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = sign(message);

  return {
    gatewayUrl: ESEWA_GATEWAY_URL,
    fields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    },
  };
};

export const verifyEsewaSignature = (decoded) => {
  if (!decoded?.signed_field_names || !decoded?.signature) return false;
  const fields = decoded.signed_field_names.split(",");
  const message = fields.map((field) => `${field}=${decoded[field]}`).join(",");
  const expected = sign(message);
  // Use timing-safe comparison since this guards a financial decision.
  const a = Buffer.from(expected);
  const b = Buffer.from(decoded.signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const checkEsewaStatus = async ({ productCode, transactionUuid, totalAmount }) => {
  const url = `${ESEWA_STATUS_URL}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(
    totalAmount
  )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const response = await fetch(url);
  const data = await response.json();
  return data; // { status: "COMPLETE" | "PENDING" | "FULL_REFUND" | ... }
};

// eSewa settles only in NPR. Until you wire up a live FX feed, set
// USD_TO_NPR_RATE in .env to a rate you're comfortable with (update it
// periodically) - this keeps the conversion explicit and auditable rather
// than silently guessing.
export const convertUsdToNpr = (usdAmount) => {
  const rate = parseFloat(process.env.USD_TO_NPR_RATE) || 133;
  return Math.round(usdAmount * rate * 100) / 100;
};
