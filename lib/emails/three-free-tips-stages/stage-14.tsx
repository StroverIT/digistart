import React from "react";
import { Text } from "@react-email/components";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { tipsEmailColors as colors } from "./colors";
import {
  TipsStageBodyText,
  TipsStageListItem,
  TipsStageVideoCta,
  TipsStageEmailShell,
  TipsStageSignOff,
} from "./layout";


export function ThreeFreeTipsStage14Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Ако можете да привлечете повече клиенти, класирането в топ 3 си заслужава.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Да видите компанията си в топ 3 в Google звучи хубаво и всичко останало,
        но...
      </TipsStageBodyText>

      <TipsStageBodyText>
        ... дали изобщо си заслужава безпокойството, усилието и работата?
      </TipsStageBodyText>

      <TipsStageBodyText>
        Имате хиляда неща в списъка си вече. И ако сте като мен, предполагам, че
        не търсите ОЩЕ ЕДНО нещо, което да добавите.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И да – знам, че се предполага, че трябва да кажа, че отговорът е
        „разбира се, това е важно, оставете всичко, което правите, и го
        направете приоритет номер 1".
      </TipsStageBodyText>

      <TipsStageBodyText>
        Защото правя това цял ден, всеки ден. И продавам услугата. Така че съм
        толкова справедлив и безпристрастен, колкото средновековен ловец на
        вещици, който току-що е пристигнал в село със съмнително лоша реколта.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Нека Ви дам просто три неща, за които знам, че са верни и които е доста
        лесно да се проверят:
      </TipsStageBodyText>

      <TipsStageListItem index={1}>
        Топ 3-те бизнеса, които се показват при търсене в Google, получават
        ЦЕЛИЯ трафик. Процентът е нещо от рода на 78% от посетителите кликват
        върху топ 3. Значи всички под това? Те се борят за трохи.
      </TipsStageListItem>

      <TipsStageListItem index={2}>
        Това също означава, че топ 3 получават почти всички обаждания, всички
        кликове, всички клиенти, цялото внимание, цялото увеличение на
        репутацията и т.н. и т.н. и т.н. Схващате идеята.
      </TipsStageListItem>

      <TipsStageBodyText>
        Което ни води до основния въпрос за милион долара:
      </TipsStageBodyText>

      <TipsStageListItem index={3}>
        ако влезете в топ 3 и започнете да получавате обажданията и кликовете,
        които Вашата конкуренция получава сега... ... бихте ли могли да
        привлечете повече клиенти?
      </TipsStageListItem>

      <TipsStageBodyText emphasis>
        Ако отговорът е ДА → класирането в топ 3 почти сигурно си заслужава.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Ако отговорът е НЕ → не се занимавайте с това. Вероятно не си заслужава
        времето Ви.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Засега въпросът се свежда до: „отворени ли сте за получаване на повече
        клиенти?"
      </TipsStageBodyText>

      <TipsStageBodyText>
        Защото ако сте, това трябва да е близо до върха на Вашия маркетингов
        списък със задачи.
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

export default ThreeFreeTipsStage14Email;
