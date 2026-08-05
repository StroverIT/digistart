import React from "react";
import { Text } from "@react-email/components";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageBullet,
  TipsStageCta,
  TipsStageEmailShell,
  TipsStageListItem,
  TipsStageSignOff,
} from "./layout";

const GOOGLE_BUSINESS_URL = "https://digistart.bg/services/google-business";

export function ThreeFreeTipsStage2Email() {
  return (
    <TipsStageEmailShell previewText="Защо конкуренцията Ви се класира по-добре? Вероятно мамят.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Вчера получих лично съобщение от фирма за покриви.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        „Можете ли да ни класирате в топ 3 на Google?“
      </TipsStageBodyText>

      <TipsStageBodyText>Проверих конкуренцията.</TipsStageBodyText>

      <TipsStageBodyText>
        ЦЯЛАТА първа страница беше пълна с хора, които мамят по различни начини:
      </TipsStageBodyText>

      <TipsStageBullet>някои имат фалшиви адреси</TipsStageBullet>
      <TipsStageBullet>
        някои имат имена на фирми, претъпкани с ключови думи
      </TipsStageBullet>
      <TipsStageBullet>
        някои имат бизнес, който не е истински, а е просто генератор на
        запитвания (lead generator)
      </TipsStageBullet>
      <TipsStageBullet>
        някои имат двойни обяви, преструвайки се на две компании, когато в
        действителност са една
      </TipsStageBullet>

      <TipsStageBodyText>И списъкът продължава.</TipsStageBodyText>

      <TipsStageBodyText>
        Така че, ако някога сте се чудили: „Защо конкуренцията ми се класира
        по-добре от мен?“
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>Ами... вероятно мамят.</TipsStageBodyText>

      <TipsStageBodyText>
        Предполага се, че Google трябва да направи нещо по въпроса. Но е малко
        като в Тур дьо Франс.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Предполага се, че трябва да следят всички спортисти да са чисти и да не
        използват допинг. Но всички знаем, че в действителност не се случва точно
        това.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И така, как да спечелите, ако опонентите Ви мамят?
      </TipsStageBodyText>

      <TipsStageBodyText>
        Като се уверите, че ги превъзхождате и в трите области, които имат
        значение за локалното класиране:
      </TipsStageBodyText>

      <TipsStageListItem index={1}>
        Вашият Google Business Profile е по-добър и по-активен
      </TipsStageListItem>
      <TipsStageListItem index={2}>
        Вашият уебсайт е по-добре структуриран и има повече съдържание
      </TipsStageListItem>
      <TipsStageListItem index={3}>
        Вашият профил от цитирания (други сайтове, които споменават името на
        бизнеса Ви) е по-обширен и пълен
      </TipsStageListItem>

      <TipsStageBodyText>
        Причината това да работи е, че измамниците ВИНАГИ търсят преки пътища.
        Нито веднъж не съм виждал компания да мами и същевременно всичко да ѝ е
        напълно изрядно във всяка една област.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че, ако се чудите дали можем да Ви класираме в топ 3, отговорът е
        „да“.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Не е въпрос на АКО, а само въпрос на КОГА.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Ако има огромна конкуренция, отнема малко повече време. Ако конкуренцията
        е слаба, обикновено можем да Ви класираме там за месец до три.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Но в крайна сметка ние просто работим по-усърдно от измамниците. И това
        работи.
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
        <strong style={{ color: "#000000" }}>П.С.</strong> Ако искате да научите
        повече за това как работим заедно, изгледайте това видео:
      </Text>

      <TipsStageCta href={GOOGLE_BUSINESS_URL} label="Гледай видеото" />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage2Email;
