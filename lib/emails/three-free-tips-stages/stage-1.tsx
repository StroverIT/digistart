import React from "react";
import { Text } from "@react-email/components";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageBullet,
  TipsStageVideoCta,
  TipsStageEmailShell,
  TipsStageListItem,
  TipsStageSignOff,
} from "./layout";


export function ThreeFreeTipsStage1Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Трите неща, които трябва да подредите за топ 3 в Google">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Да класирате бизнеса си в топ 3 на Google е просто.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Просто е... но не е лесно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Казвам, че е просто, защото трябва да подредите само три неща:
      </TipsStageBodyText>

      <TipsStageListItem index={1}>
        Напълно завършен Google Business Profile (GBP)
      </TipsStageListItem>
      <TipsStageListItem index={2}>
        Уебсайт, който показва и подчертава Име, Адрес и Телефонен номер (NAP) +
        местна експертиза
      </TipsStageListItem>
      <TipsStageListItem index={3}>
        Citations / Споменавания (други уебсайтове, които Ви споменават) със
        същия NAP като на уебсайта Ви и в GBP
      </TipsStageListItem>

      <TipsStageBodyText>
        Ако направите това? Ще се класирате на първа страница в 99,99% от местата
        и индустриите на ЗЕМЯТА.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И когато някой клиент ни попита: „Можете ли да ме класирате в топ 3 в
        Google?“, това са нещата, които проверяваме първо.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Виждаме колко са съгласувани тези елементи. Колко силна е конкуренцията
        им. Проверяваме слабите места. Определяме дали задачата е изпълнима.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че, когато сведете нещата до същността им, всичко е доста просто.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Просто не е лесно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Защото изисква доста работа:
      </TipsStageBodyText>

      <TipsStageBullet>
        Първо трябва да синхронизирате и трите точки.
      </TipsStageBullet>
      <TipsStageBullet>
        След това да коригирате каквото е било изградено преди това.
      </TipsStageBullet>
      <TipsStageBullet>
        След това да надграждате уебсайта си с течение на времето.
      </TipsStageBullet>
      <TipsStageBullet>
        След това да изграждате профила си от цитирания (citations) с течение на
        времето.
      </TipsStageBullet>
      <TipsStageBullet>
        В същото време се уверявате, че всичко остава синхронизирано, за да не
        паднете в класирането.
      </TipsStageBullet>

      <TipsStageBodyText>
        Така че, ако се опитвате да се класирате по-добре в Google или не можете
        да разберете защо нещата не се получават, вижте дали можете да откриете
        кой от тези три фактора е виновникът.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И ако искате аз да проверя, пишете ми и ще хвърля един поглед!
      </TipsStageBodyText>

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
        <strong style={{ color: "#000000" }}>П.С.</strong> Също така –
        ако искате да научите повече за това как работя с клиенти – подготвих
        това видео:
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage1Email;
