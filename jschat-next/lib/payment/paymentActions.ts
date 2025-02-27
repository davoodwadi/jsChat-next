import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function expireSession(session_id: string | string[] | undefined) {
  console.log("session_id", session_id);
  let session_id_to_use: string;
  if (!session_id) {
    return "No session_id";
  } else if (Array.isArray(session_id)) {
    // If session_id is an array, use the first element
    session_id_to_use = session_id[0];
  } else {
    // If session_id is a string, use it directly
    session_id_to_use = session_id;
  }
  let session;
  try {
    session = await stripe.checkout.sessions.expire(session_id_to_use);
    console.log("session expired", session.status);
  } catch (e) {
    if (e instanceof Stripe.errors.StripeError) {
      return e.message;
    } else {
      return e;
    }
  }
  return session?.status;
}
