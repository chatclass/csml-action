import crypto from 'crypto';
import { appConfig } from '../config/appConfig';

export type ICredentials = {
  'x-api-key': string;
  'x-api-signature': string;
};
/**
 * By default, read the credentials from the .env file,
 * which can be overridden by the -k/-s arguments
 *
 * @param {*} argv
 * @returns {'x-api-key': String, 'x-api-signature': String}
 */
export default function auth() {
  const key = appConfig.apiKey
  const secret = appConfig.apiSecret

  if (!key)
    throw new Error(
      'Missing CSML Studio API key. Visit https://studio.csml.dev to generate your credentials.'
    );
  if (!secret)
    throw new Error(
      'Missing CSML Studio API secret. Visit https://studio.csml.dev to generate your credentials.'
    );

  const UNIX_TIMESTAMP = Math.floor(Date.now() / 1000);
  const XApiKey = `${key}|${UNIX_TIMESTAMP}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(XApiKey, 'utf-8')
    .digest('hex');
  const XApiSignature = `sha256=${signature}`;
  return {
    'x-api-key': XApiKey,
    'x-api-signature': XApiSignature,
  };
}
