import speakeasy from "speakeasy";
import { json } from "@sveltejs/kit"
import { env } from "$env/dynamic/private";

const {
    ENV_TOTP_SECRET
} = env

export async function GET() {
  const token = speakeasy.totp({
    secret: ENV_TOTP_SECRET,
    encoding: "base32",
  });

  const message = `Sign this message to prove ownership.\n\nnonce: ${token}`;

  return json({
    data : message,
  });
}