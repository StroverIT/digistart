import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

export async function renderSupportChatAdminEmailHtml(params: {
  customerName: string;
  customerEmail: string;
  problemSummary: string;
  chatUrl: string;
}) {
  return await render(
    React.createElement(
      Html,
      null,
      React.createElement(Head),
      React.createElement(Preview, null, `Нова заявка за помощ: ${params.customerName}`),
      React.createElement(
        Body,
        { style: { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" } },
        React.createElement(
          Container,
          {
            style: {
              margin: "24px auto",
              padding: "24px",
              maxWidth: "560px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
            },
          },
          React.createElement(Heading, { style: { marginTop: 0 } }, "Нова заявка за помощ"),
          React.createElement(
            Text,
            null,
            `Клиент: ${params.customerName} (${params.customerEmail})`,
          ),
          React.createElement(Text, null, "Описание на проблема:"),
          React.createElement(
            Text,
            { style: { whiteSpace: "pre-wrap", backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" } },
            params.problemSummary,
          ),
          React.createElement(
            Section,
            { style: { marginTop: "24px" } },
            React.createElement(
              Link,
              { href: params.chatUrl, style: { color: "#2563eb" } },
              "Отвори чата",
            ),
          ),
          React.createElement(
            Text,
            { style: { color: "#6b7280", fontSize: "12px", marginTop: "24px" } },
            "При отваряне на линка клиентът ще види, че служител е влязъл в чата.",
          ),
        ),
      ),
    ),
  );
}
