"use server";

import { Resend } from "resend";
import { connectToDatabase } from "@/lib/db";
import { wait } from "@/lib/actions";

const resend = new Resend(process.env.RESEND_API_KEY);
const audienceID = "508d40bf-007d-4511-a740-492392ff8ee7";

export async function getEmails() {
  const usersList = await getAllUsers();
  // console.log("usersList[0]", usersList[0]);
  const contactList = await getContactList();

  // Get difference
  const newContacts = findDifference(usersList, contactList);
  // const newContacts = [
  //   {
  //     email: "delivered@resend.dev",
  //     givenName: "Resend",
  //     familyName: "Test Email",
  //   },
  // ];
  console.log("newContacts.length", newContacts.length); // Output: [{ email: 'jack@gmail.com' }]

  await createContacts(newContacts);
}

async function getAllUsers() {
  const client = await connectToDatabase();
  const plansCollection = client.db("chat").collection("plans");
  let result = await plansCollection.find({}).toArray();
  result = result.filter((user) => user.email);
  return result;
}
async function getContactList() {
  const contactList = await resend.contacts.list({
    audienceId: audienceID,
  });
  if (contactList.error) {
    console.error("error occurred fetching contacts");
    return;
  }
  return contactList?.data?.data;
}
const findDifference = (users, contacts) => {
  return users.filter(
    (user) => !contacts.some((contact) => contact.email === user.email)
  );
};
async function createContacts(contacts) {
  let count = 0;
  for (const u of contacts) {
    let givenName;
    let familyName;
    let fullName;
    if (u?.givenName) {
      givenName = u?.givenName;
      familyName = u?.familyName;
      fullName = `${givenName} ${familyName ? familyName : ""}`;
      // console.log("fullName", fullName);
    } else if (u?.googleInfo?.given_name) {
      // console.log(u?.googleInfo?.given_name);
      givenName = u?.googleInfo?.given_name;
      familyName = u?.googleInfo?.family_name;
      fullName = `${givenName} ${familyName ? familyName : ""}`;
    } else if (u?.googleInfo?.name) {
      // console.log(u?.googleInfo?.name);
      fullName = u?.googleInfo?.name;
      [givenName, familyName] = fullName.split(" ");
    } else if (u?.name) {
      fullName = u?.name;
      [givenName, familyName] = fullName.split(" ");
    } else {
      fullName = u.email;
    }
    console.log(`Processing: ${fullName}`);
    await wait(3000);
    console.log("wait(3000)");
    const createResults = await resend.contacts.create({
      email: u.email,
      firstName: givenName,
      lastName: familyName ? familyName : "",
      unsubscribed: false,
      audienceId: audienceID,
    });
    count += 1;
    console.log("createResults ", createResults);
  }
  console.log("Created new users:", count);
}

export async function addUserToMailingListIfNotExists({ profile, provider }) {
  // console.log("profile", profile);
  const contactList = await getContactList();
  const difference = findDifference([profile], contactList);
  // console.log("difference", difference);
  const fullName = profile?.name;
  if (!fullName) {
    return;
  }
  const [givenName, familyName] = fullName.split(" ");
  // console.log("fullName", fullName);
  // console.log("givenName", givenName);
  // console.log("familyName", familyName);
  const createResults = await resend.contacts.create({
    email: profile.email,
    firstName: givenName,
    lastName: familyName,
    unsubscribed: false,
    audienceId: audienceID,
  });
  console.log("createResults ", createResults);
}
