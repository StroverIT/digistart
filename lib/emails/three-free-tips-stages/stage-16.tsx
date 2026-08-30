import React from "react";
import { Text } from "@react-email/components";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageVideoCta,
  TipsStageEmailShell,
  TipsStageSignOff,
} from "./layout";

export function ThreeFreeTipsStage16Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Ако не Ви плаши леко, вероятно не натискате достатъчно силно.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Ако сте на път да пробвате нещо ново и то изобщо не Ви плаши леко?
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Вероятно не е правилното нещо за Вас.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И не говоря да изследвате Титаник в някаква домашна подводница от гипс.
        Или онова пещерно нещо, в което хората се заклещват в тесни проходи.
      </TipsStageBodyText>

      <TipsStageBodyText>(просто да не правим това)</TipsStageBodyText>

      <TipsStageBodyText>
        Говоря за бизнес неща. Да кажем – реклама.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Ако погледнете дневния разход и не се почувствате леко притеснени, с
        мисъл от сорта: „човече... това е сериозна сума пари"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Тогава вероятно не натискате достатъчно силно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Говоря с много собственици на бизнеси и ги питам колко харчат за реклами
        на месец. И разговорът върви така:
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        „Около 250–300 евро"
      </TipsStageBodyText>

      <TipsStageBodyText>
        „Ок, колко Ви струва една средна сделка?"
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>„Около 1500 евро"</TipsStageBodyText>

      <TipsStageBodyText>
        Значи ЕДНА сделка струва 5–6 МЕСЕЦА рекламен бюджет.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Това е ясен знак, че сте прекалено предпазливи.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не Ви казвам да сте безразсъдни и просто да изгорите парите. Казвам Ви да
        сте агресивни, когато тествате неща. Защото това е единственият начин да
        съберете достатъчно данни.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Повечето компании не страдат от твърде голям рекламен бюджет. Страдат от
        твърде малък рекламен бюджет, което води до твърде малко данни, което
        води до това да не растат толкова бързо, колкото могат.
      </TipsStageBodyText>

      <TipsStageBodyText>Надявам се това да помогне.</TipsStageBodyText>

      <TipsStageSignOff>
        До скоро,
        <br />
        Емил Златинов
      </TipsStageSignOff>

      <Text
        style={{
          margin: "24px 0 12px",
          padding: "14px 16px",
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#000000",
        }}
      >
        <strong style={{ color: "#000000" }}>П.С.</strong> Ако сте любопитни
        какво е да работим заедно, разгледайте тази страница:
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage16Email;
