import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { tipsEmailColors as colors, tipsEmailFontFamily } from "./colors";

const textBlack = "#000000";

export function TipsStageEmailShell({
  previewText,
  children,
}: {
  previewText: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: colors.pageBg,
          fontFamily: tipsEmailFontFamily,
          margin: 0,
          padding: "32px 16px",
          color: textBlack,
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            maxWidth: "560px",
            backgroundColor: colors.cardBg,
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Section style={{ padding: "28px 28px 24px" }}>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
}

export function TipsStageBodyText({
  children,
  emphasis,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <Text
      style={{
        margin: "0 0 16px",
        fontSize: "15px",
        lineHeight: "1.65",
        color: textBlack,
        fontWeight: emphasis ? 700 : 400,
      }}
    >
      {children}
    </Text>
  );
}

export function TipsStageListItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <Section
      style={{
        margin: "0 0 12px",
        padding: "14px 16px",
        backgroundColor: "#f8fafc",
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
      }}
    >
      <Text
        style={{
          margin: "0 0 6px",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: textBlack,
        }}
      >
        {String(index).padStart(2, "0")}
      </Text>
      <Text
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: "1.55",
          color: textBlack,
          fontWeight: 500,
        }}
      >
        {children}
      </Text>
    </Section>
  );
}

export function TipsStageBullet({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 10px",
        paddingLeft: "4px",
        fontSize: "14px",
        lineHeight: "1.55",
        color: textBlack,
      }}
    >
      <span style={{ color: textBlack, fontWeight: 700 }}>→ </span>
      {children}
    </Text>
  );
}

export function TipsStageCta({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ margin: "8px 0 4px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: textBlack,
          color: "#ffffff",
          borderRadius: "8px",
          padding: "12px 22px",
          fontWeight: 700,
          fontSize: "14px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {label}
      </Button>
    </Section>
  );
}

export function TipsStageSignOff({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text
      style={{
        margin: "20px 0 0",
        fontSize: "15px",
        lineHeight: "1.6",
        color: textBlack,
      }}
    >
      {children}
    </Text>
  );
}
