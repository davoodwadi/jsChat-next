export const PRICE_ID_200K = process.env.NEXT_PUBLIC_PRICE_ID_200K;
export const PRICE_ID_100K = process.env.NEXT_PUBLIC_PRICE_ID;

// Define the credit packs with their corresponding price IDs from Stripe
export const creditPacks = [
  { id: "price_1RUeOw05Yzf9GyoIEczRU2ob", credits: 200, price: 4.99 }, // Replace with your actual price_id for $4.99
  { id: "price_1RUIsP05Yzf9GyoIL8Ux8Mni", credits: 500, price: 9.99 }, // Replace with your actual price_id for $9.99
  { id: "price_1RUeUo05Yzf9GyoIT3NajigY", credits: 1000, price: 14.99 }, // Replace with your actual price_id for $14.99
];
