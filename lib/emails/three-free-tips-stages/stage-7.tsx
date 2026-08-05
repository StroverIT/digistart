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

export function ThreeFreeTipsStage7Email() {
  return (
    <TipsStageEmailShell previewText="Ако не можете да се учите от грешките си, винаги ще се проваляте.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Ако искате да знаете дали някой ще се провали, има една черта на
        характера, която е 100% точен предсказател.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не става въпрос за интелигентност, защото съм срещал много успешни хора,
        които не са много интелигентни.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не става въпрос за външност или морален компас или колко гладко можете да
        говорите. Също така не става въпрос колко упорити сте или колко сте
        отдадени на „Мелницата".
      </TipsStageBodyText>

      <TipsStageBodyText>
        Това е нещо напълно различно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Нека илюстрирам с реален пример от живота.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Познавах един човек, нека го наречем Франк. Имаше семейна връзка, така
        че го познавах около 15 години.
      </TipsStageBodyText>

      <TipsStageBodyText>
        През този период Франк започна множество хобита и проекти. И всеки път
        се разигра една и съща странна последователност.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Да кажем, че взе пинг-понг като хоби, нали? Той започна да играе и да
        тренира религиозно. Рядко пропускаше тренировка.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Правеше го ГОДИНИ. И след 5 години игра той беше толкова лош, колкото
        беше след 5 седмици игра.
      </TipsStageBodyText>

      <TipsStageBodyText>Беше зловещо.</TipsStageBodyText>

      <TipsStageBodyText>Просто никога не се подобряваше.</TipsStageBodyText>

      <TipsStageBodyText>
        Без значение колко тренираше, без значение колко време прекарваше в хоби
        или проект... винаги оставаше на същото ниво, на което беше, когато
        започна да го прави.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Затова нищо никога не се получаваше за него.
      </TipsStageBodyText>

      <TipsStageBodyText>Ако не можете да:</TipsStageBodyText>

      <TipsStageBodyText emphasis>
        1) Се учите от грешките си
      </TipsStageBodyText>

      <TipsStageBodyText>и</TipsStageBodyText>

      <TipsStageBodyText emphasis>
        2) Измисляте нови предложения / идеи / планове за действие, за да се
        справите по-добре в бъдеще...
      </TipsStageBodyText>

      <TipsStageBodyText>
        ...никога няма да се получи. Защото се зацикляте в безкрайна примка на
        провал.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Като муха, която се блъска в стъклен прозорец отново и отново.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че ако се опитвате най-усилено за нещо от известно време, проверете
        какво може да Ви липсва. Животът и бизнесът не се свеждат само до
        „мелницата". Може би просто лаете на грешното дърво и това, от което
        имате нужда, е да се отдалечите малко.
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
        <strong style={{ color: "#000000" }}>П.С.</strong> Същото важи и за
        рекламите и класирането в Google между другото. Рядко щрака веднага. Но
        ако продължите да го настройвате, продължавате да се учите от грешките,
        в крайна сметка ще спечелите. Това е, което правим за клиентите.
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
        <strong style={{ color: "#000000" }}>П.П.С.</strong> Ако искате да
        работим заедно, разгледайте това видео:
      </Text>

      <TipsStageCta href={GOOGLE_BUSINESS_URL} label="Гледай видеото" />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage7Email;
