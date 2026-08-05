import React from "react";
import { Text } from "@react-email/components";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageCta,
  TipsStageEmailShell,
  TipsStageSignOff,
} from "./layout";

const GOOGLE_BUSINESS_URL = "https://digistart.bg/services/google-business";

export function ThreeFreeTipsStage13Email() {
  return (
    <TipsStageEmailShell previewText="Управлението на времето се свежда до едно нещо – фокусиране върху това, което има значение.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Продуктивността ми скочи до небесата, когато най-накрая осъзнах нещо.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Казвам го на хората постоянно и обикновено не им прави впечатление.
        Толкова е просто, толкова праволинейно и толкова... делнично. Дори
        скучно.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Но не е. Невероятно е.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Мноооооооого отдавна четох една книга от Михай Чиксентмихай. (Представете
        си да трябва да спелувате това име на някого)
      </TipsStageBodyText>

      <TipsStageBodyText>
        Книгата се казваше „Поток" (Flow). Добра е, но е тежка за четене. Личи
        си, че е академик. Затова нека Ви я обобщя. Основното му послание е, че
        човешките същества са най-щастливи, когато могат да се фокусират върху
        ЕДНО НЕЩО. И това едно нещо трябва да е предизвикателно, но по силите им.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Твърде просто? Губим фокус, защото можем да го направим със затворени
        очи и вместо това се отегчаваме.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Твърде трудно? Губим фокус, защото не е по силите ни и вместо това се
        фрустрираме.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Губите себе си, докато спортувате, докато вършите работа, която изисква
        пълната Ви концентрация, докато усъвършенствате занаята си. Но „да
        изгубиш себе си" не е точният израз. Просто спирате шума и мисленето. И
        Вие просто... СТЕ.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Обожавам това чувство. И когато се опитвах да разбера как работи
        управлението на времето, се сетих за него. После го използвах.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Управлението на времето се свежда до едно-единствено нещо. Фокусиране
        върху това, което има значение. Всичко останало е второстепенно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че напоследък планирам дните си по възможно най-лесния начин.
        Поглеждам списъка си със задачи и избирам топ 3 неща. След това започвам
        работа по номер 1. След това по номер 2. Накрая завършвам номер 3.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И след това избирам нови топ 3.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Невероятно е. Позволява Ви да бъдете напълно погълнати от това, което
        правите. Елиминира прекаленото обмисляне и отлагането. Трябва да го
        опитате.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Влезте в потока.
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
        <strong style={{ color: "#000000" }}>П.С.</strong> Мултитаскингът не е
        реален, може да си поговорим за това в близко бъдеще.
      </Text>

      <Text
        style={{
          margin: "0 0 12px",
          padding: "14px 16px",
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#000000",
        }}
      >
        <strong style={{ color: "#000000" }}>П.П.С.</strong> Ако сте любопитни
        какво е да работите директно с мен – така че аз да се занимавам с
        маркетинга, а Вие да се фокусирате върху това, което правите най-добре –
        записах видео с малко повече информация по темата.
      </Text>

      <TipsStageCta href={GOOGLE_BUSINESS_URL} label="Гледай видеото" />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage13Email;
