import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
  Preview,
  Hr,
  Column,
} from "@react-email/components";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);

interface SpreedVerifyIdentityEmailProps {
  currentTokens?: number;
  status: string;
  email: string;
  sessionId: string;
  date: string;
  amount: number;
  currency: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const SpreedVerifyIdentityEmail = ({
  currentTokens,
  status,
  email,
  sessionId,
  date,
  amount,
  currency,
}: SpreedVerifyIdentityEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`https://next.spreed.chat/output.png`}
          width="88"
          height="88"
          alt="Spreed.chat"
          style={logo}
        />
        <Text style={tertiary}>Payment Details</Text>
        <Container style={{ display: "flex", justifyContent: "center" }}>
          <Heading style={secondary}>
            Your transaction&nbsp;
            {status === "success" ? "was successful" : "failed"}.
          </Heading>
        </Container>
        <Section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "10px",
            background: "rgba(0,0,0,.05)",
            borderRadius: "4px",
            margin: "16px 10px 14px 10px",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "4px",
            width: "300px",
          }}
        >
          <ul>
            <li>Date: {date}</li>
            <li>Status: {status === "success" ? "Success" : "Failure"}</li>
            <li>
              Amount: {amount / 100} {currency}
            </li>
          </ul>
        </Section>
        {/* <Container style={{ display: "flex", justifyContent: "center" }}> */}
        {/* <Section style={codeContainer}>
          <Heading style={heading2}>Current tokens:</Heading>
        </Section> */}
        {/* </Container> */}
        {/* <Container style={{ display: "flex", justifyContent: "center" }}> */}
        <Section style={codeContainer}>
          <Heading style={heading2}>Current tokens:</Heading>
          <Text style={code}>{currentTokens}</Text>
        </Section>
        {/* </Container> */}
        {/* <Hr /> */}
        <Container>
          <Text style={paragraph}>Have issues with your account?</Text>
          <Text style={paragraph}>
            Contact&nbsp;
            <Link href="mailto:support@account.spreed.chat" style={{ ...link }}>
              support
            </Link>
            &nbsp;if you have questions.
          </Text>
        </Container>
      </Container>
      <Text style={footer}>Powered by Spreed.chat</Text>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "5px",
  maxWidth: "360px",
  margin: "0 auto",
  padding: "68px 0 130px",
};

const logo = {
  margin: "0 auto",
};

const tertiary = {
  color: "#0a85ea",
  fontSize: "11px",
  fontWeight: 700,
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  height: "16px",
  letterSpacing: "0",
  lineHeight: "16px",
  margin: "16px 8px 8px 8px",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
};

const secondary = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24px",
  marginBottom: "0",
  marginTop: "0",
  textAlign: "center" as const,
};

const codeContainer = {
  // background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};
const heading2 = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "18px",
  fontWeight: 400,
  lineHeight: "24px",
  // marginBottom: "0",
  // marginTop: "10px",
  width: "100%",
  margin: "0 auto",
  textAlign: "center" as const,
};

const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",

  width: "100%",
  marginVertical: "10px",
  margin: "0 auto",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
  padding: "0 10px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#444",
  textDecoration: "underline",
  marginHorizontal: 0,
};

const footer = {
  color: "#000",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0",
  lineHeight: "23px",
  margin: "0",
  marginTop: "5px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
};
