import React from "react";
import { Button, Section } from "@react-email/components";
import { tipsEmailColors as colors } from "@/lib/emails/three-free-tips-stages/colors";
import {
  TipsStageBodyText,
  TipsStageEmailShell,
  TipsStageSignOff,
} from "@/lib/emails/three-free-tips-stages/layout";

export type GooglePromisedAnalysisEmailProps = {
  name: string;
  youtubeUrl: string;
  consultationUrl: string;
  recipientUid?: string;
};

const buttonBaseStyle = {
  borderRadius: "8px",
  padding: "12px 18px",
  fontWeight: 700,
  fontSize: "14px",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center" as const,
};

export function GooglePromisedAnalysisEmail({
  name,
  youtubeUrl,
  consultationUrl,
  recipientUid,
}: GooglePromisedAnalysisEmailProps) {
  const greetingName = name.trim() || "там";

  return (
    <TipsStageEmailShell
      recipientUid={recipientUid}
      previewText="Обещаният клип с безплатен анализ за по-добро класиране в Google"
    >
      <TipsStageBodyText>Здравейте, {greetingName},</TipsStageBodyText>

      <TipsStageBodyText>
        Това е обещаният клип с безплатен анализ за по-добро класиране в Google.
      </TipsStageBodyText>

      <Section style={{ margin: "16px 0 8px" }}>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
        >
          <tbody>
            <tr>
              <td style={{ width: "50%", paddingRight: "6px", verticalAlign: "top" }}>
                <Button
                  href={youtubeUrl}
                  style={{
                    ...buttonBaseStyle,
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: colors.primary,
                    color: colors.primaryFg,
                  }}
                >
                  Гледай анализа
                </Button>
              </td>
              <td style={{ width: "50%", paddingLeft: "6px", verticalAlign: "top" }}>
                <Button
                  href={consultationUrl}
                  style={{
                    ...buttonBaseStyle,
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                  }}
                >
                  Запази безплатна консултация
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <TipsStageSignOff>
        До скоро,
        <br />
        Емил Златинов
      </TipsStageSignOff>
    </TipsStageEmailShell>
  );
}

export default GooglePromisedAnalysisEmail;
