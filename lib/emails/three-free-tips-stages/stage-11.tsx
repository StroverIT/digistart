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


export function ThreeFreeTipsStage11Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Комбинирайте локално SEO с Meta реклами и Google реклами и ще победите конкуренцията всеки път.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Преди време започнахме да работим с местна компания. Вървеше им добре, но
        искаха да вървят по-добре.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Това е страхотно начало. Така че се заехме с работа.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Първото нещо, което направихме, беше да ги класираме в топ 3 в Google.
        Това отне около 3 месеца.
      </TipsStageBodyText>

      <TipsStageBodyText>
        След това преминахме към пускане на Google реклами и Meta реклами за тях.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Всичко вървеше страхотно, всички метрики изглеждаха добре, но изведнъж
        получавам текст от клиента. Пита ме дали имам време да се обадя за
        спешен въпрос.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Организираме нещо, той се включва и в основата първото нещо, което казва,
        е:
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        „трябва да забавим, това е твърде много!"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Оказа се, че класирането в топ 3 работеше ИЗКЛЮЧИТЕЛНО добре за тях.
        Толкова добре, че имаха проблеми да успеят да се справят с обажданията и
        посещенията само от това.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И веднага щом го комбинирахме с Google реклами и Meta реклами? Нещата
        просто излязоха извън контрол. Невъзможно беше да се справят. Така че
        трябваше да го намалим, за да може той да настигне обема.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Той се справя добре сега, успяхме да включим нещата отново, всичко е
        наред.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Но това е страхотен проблем, който да имаш. Ако управлявате бизнес, това
        са видовете проблеми, с които искате да се справяте!
      </TipsStageBodyText>

      <TipsStageBodyText>
        „о, не, моята пържола е твърде сочна"
      </TipsStageBodyText>

      <TipsStageBodyText>
        „о, не, моят омар е твърде маслен"
      </TipsStageBodyText>

      <TipsStageBodyText>
        „о, не, имам твърде много клиенти, които идват"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Това е това, което се случва, когато настроите маркетинга.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Комбинирайте локално SEO с Meta реклами и Google реклами и ще победите
        конкуренцията всеки път.
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

export default ThreeFreeTipsStage11Email;
