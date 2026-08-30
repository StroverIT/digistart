import React from "react";
import { Text } from "@react-email/components";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageBullet,
  TipsStageVideoCta,
  TipsStageEmailShell,
  TipsStageSignOff,
} from "./layout";


export function ThreeFreeTipsStage9Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Всички грешат относно AI. Използвайте го като по-силен компютър, не го карайте да прави човешки неща.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Всички са напълно сгрешени относно AI.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Хората биха могли да го използват за велики неща и да имат огромни скокове
        в продуктивността в почти всяка работа.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Но вместо това го разбират **напълно** погрешно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Помислете за това – когато има някакъв шум около AI, ВИНАГИ е за това
        колко „човешки" звучи и колко добър започва да става в неща, които
        хората могат да правят.
      </TipsStageBodyText>

      <TipsStageBodyText>Неща като:</TipsStageBodyText>

      <TipsStageBullet>AI изкуство</TipsStageBullet>
      <TipsStageBullet>AI музика</TipsStageBullet>
      <TipsStageBullet>
        AI, приближаващ съзнанието, говорещ философия и т.н. и т.н.
      </TipsStageBullet>

      <TipsStageBodyText>
        Гледали ли сте филма „Good Will Hunting"?
      </TipsStageBodyText>

      <TipsStageBodyText>
        Ако не сте, трябва да го разгледате. Страхотен филм, страхотен диалог,
        страхотно писане като цяло.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Мат Деймън играе това момче гений. На около двадесет години е и когато е
        изправен пред авторитет, обича да ги надхитрява.
      </TipsStageBodyText>

      <TipsStageBodyText>
        В един момент той говори с психиатър (Робин Уилямс). Прави обичайното си
        нещо. След това Уилямс му казва:
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        „Момко, ако те попитам за изкуство, ще ми разкажеш всичко за ван Гог,
        Моне и Микеланджело. Ще ми дадеш техната Wikipedia история. Ще
        рецитираш всички видове факти. Като доклад за книга."
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        „Но не можеш да ми кажеш какво мирише в Сикстинската капела. Не можеш
        да ми кажеш каково е да погледнеш нагоре към този таван с възхищение и
        да бъдеш изумен от спектакъла, който се разгръща точно пред очите ти."
      </TipsStageBodyText>

      <TipsStageBodyText>
        Красива сцена. Показва ни, че преживяването да си човек е много повече
        от това просто да можеш слепо да повтаряш факти.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И все пак изглежда, че всички са фокусирани да накарат AI да прави
        човешки неща.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Но той не е човек. Никога няма да бъде човек. Количеството сложност,
        необходимо дори отдалеч да се доближи до човешки мозък, би изсмукало
        целия капацитет на дейтацентрове на планетата... и все още дори няма да
        се доближите.
      </TipsStageBodyText>

      <TipsStageBodyText>
        (и даже не говоря за особено забележителен мозък тук. Говоря за мозък
        като чичо Боб, който се напива твърде много по време на Коледната вечеря
        и започва да крещи за политика? Дори това ниво мозък е невъзможно за
        репликиране)
      </TipsStageBodyText>

      <TipsStageBodyText>
        AI е машина. Той прави машинни неща невероятно добре.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Автоматизирахме доста СОП (Стандартни оперативни процедури) в нашата
        агенция. AI ни прави по-продуктивни, защото прави компютърните неща
        по-добре от предишното поколение компютри.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че ако се чудите как можете да използвате AI? Мислете повече в
        тази посока.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Използвайте го като по-силен, по-добър, по-умен, по-ефективен компютър.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Не го карайте да прави човешки неща. Той е дърпан в човешките неща.
        Защото не е човек. И никога няма да бъде.
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
        <strong style={{ color: "#000000" }}>П.С.</strong> Винаги държа око за
        всичко ново, което се вари в света на AI, очевидно. Част от работата е.
        Класираме нашите клиенти и в Google, и в големите LLM. Така че не съм
        анти-AI. Просто го виждам такова, каквото е.
        <br />
        <br />
        Голяма мощна машина. Но все пак машина.
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
        научите повече за това как работя с клиенти – съставих това видео:
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage9Email;
