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


export function ThreeFreeTipsStage8Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Колкото по-дълго сте на върха, толкова по-трудно е да Ви изхвърлят оттам.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Гледах документален филм с Арнолд Шварценегер веднъж. В документалния
        филм той е голямата риба, номер 1, подготвящ се за поредно шоу по
        бодибилдинг. Уверен, че ще спечели.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Конкурентът му казва: „Арнолд, вълкът на върха на хълма никога не е
        толкова гладен, колкото вълкът, който се изкачва по хълма"
      </TipsStageBodyText>

      <TipsStageBodyText>
        И Арнолд казва: „Вярно е... той не е толкова гладен. Но когато иска
        храна... тя е точно там!"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Добра реплика. Също така вярна.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Класирането в Google е същото.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Когато проверите кой е на върха за термин за търсене във Вашия район, ще
        видите същия човек да се класира там години наред. Виждам го при почти
        всички мои клиенти.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Това е заради две неща:
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        1) Трудно е да СТИГНЕТЕ до върха. Така че повечето хора се отказват,
        преди да стигнат там.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        2) Колкото по-дълго сте на върха, правейки правилните неща, толкова
        по-трудно става да Ви изхвърлят от върха.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Ако сте на върха, получавате повече обаждания, повече посетители, повече
        клиенти, повече пари, повече внимание. Това се натрупва месец след месец
        след месец.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Разбира се, не можете просто да плувате и да си вадите окото от топката.
        Все още трябва да правите всички правилни неща. Но е по-лесно да
        запазите тази позиция.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И ако не сте на върха, трябва да започнете да атакувате този хълм ДНЕС.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Всеки ден, който минава, е ден, в който Вашият конкурент получава повече
        инерция. Позицията му просто продължава да се натрупва, което прави
        по-трудно пробиването на тази топ 3.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не позволявайте още един ден да мине. Време е да преминете в атака и да
        претендирате за това място.
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
        какво е да работите директно с мен, записах видео с малко повече
        информация по темата.
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage8Email;
