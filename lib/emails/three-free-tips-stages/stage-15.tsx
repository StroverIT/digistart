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

export function ThreeFreeTipsStage15Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Единственото нещо, което предсказва дали ще се справите добре с лийдовете, е скоростта.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        През последните години работих с куп собственици на бизнеси. И можете да
        предскажете с почти хирургична точност кой ще се справи добре и кой ще се
        провали ужасно – само по едно нещо.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Това е най-добрият предсказател за успех. Нека Ви кажа какво е.
      </TipsStageBodyText>

      <TipsStageBodyText>
        В момента организирам едно събитие. Опитвам се да взема оферти от
        локации.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Има места, които Ви отговарят в рамките на ден. Това е страхотно. Те
        са и изключението.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Почти всички останали или изобщо не отговарят. Или пишат след около пет
        дни.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>ПЕТ РАБОТНИ ДНИ.</TipsStageBodyText>

      <TipsStageBodyText>
        И после е: „А, благодаря за запитването. Иначе – с какво можем да Ви
        помогнем?"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Аз съм доста точен в комуникацията. Вече им казах ТОЧНО какво ми трябва.
        И пак ме питат какво ми трябва.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Едното нещо, което определя провал или успех в повечето продажби, когато
        получавате входящи лийдове, е скоростта, с която им отговаряте.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Скоростта е гигантският определящ фактор.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Има огромна разлика между да им отговорите в рамките на час, на ден или
        след пет дни.
      </TipsStageBodyText>

      <TipsStageBodyText>
        След пет дни? Те вече дори не знаят, че съществувате.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не знаят, че изобщо са Ви питали за информация. Нямат идея кой сте.
        Трябва да им отговорите бързо.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>Скорост.</TipsStageBodyText>

      <TipsStageBodyText>
        Едното нещо, което можете да направите веднага, за да оправите повечето
        си проблеми с генерирането на лийдове, е да им отговорите със скорост.
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
        <strong style={{ color: "#000000" }}>П.С.</strong> Ако сте любопитни
        какво е да работим заедно, разгледайте тази страница:
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage15Email;
