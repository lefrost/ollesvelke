import type { RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import speakeasy from "speakeasy";
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { env } from "$env/dynamic/private";

const {
    ENV_TOTP_SECRET
} = env;

export async function POST({ params, locals, request }: RequestEvent) {
  const {
    message = "",
    publicKey = "",
    signature = "",
  } = await request.json();

  const verifiedMessage = nacl
    .sign
    .detached
    .verify(
        new TextEncoder().encode(message),
        bs58.decode(signature),
        bs58.decode(publicKey)
    );

  const extractedTOTP = message.substring(message.length - 6, message.length);

  const verifiedTOTP = speakeasy.totp.verify({
    secret: ENV_TOTP_SECRET,
    encoding: "base32",
    token: extractedTOTP
  });

  if(!verifiedTOTP) {
    throw new Error("Invalid TOTP");
  }

  if(!verifiedMessage) {
    throw new Error("Invalid message");
  }

  return json({});
}