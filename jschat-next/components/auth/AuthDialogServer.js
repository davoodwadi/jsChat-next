import { AuthDialogClient } from "./AuthDialogClient";
export const AuthDialogServer = async (props) => {
  const p = await getProviders();
  const pm = p
    .map((provider) => {
      if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
      } else {
        // console.log("provider in auth.config", provider);
        return provider;
        // return { id: provider.id, name: provider.name };
      }
    })
    .filter((provider) => provider.id !== "credentials");
  return (
    <>
      <AuthDialogClient props={props} pm={pm} />
    </>
  );
};
