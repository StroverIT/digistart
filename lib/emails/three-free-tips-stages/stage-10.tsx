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


export function ThreeFreeTipsStage10Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Спрете да се опитвате да натъпчете всичко в една реклама. Използвайте breadcrumbing.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Ако пускате реклами в момента и не използвате breadcrumbing, хвърляте
        пари.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Изплаквате ги в мивката, запалвате ги, ги подлагате на ядрена атака.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Това, което се опитвам да кажа, е, че е доста лошо. Така че нека поправим
        това.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Преди четяхме книги и гледахме филми. Аз все още съм човек на дългата
        форма. Обичам тези неща.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Но... това вече не е свят на дългата форма. Това време свърши. Обхватът
        на вниманието е бил до голяма степен изкоренен.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че трябва да се откажем от тази идея, че трябва да имаме цялата си
        информация в една реклама. Защото просто няма да проработи.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Те няма да я преглеждат! И дори в малко вероятния случай, че го направят,
        няма да запазят информацията.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Единственият най-добър начин да накарате маркетинга да работи е чрез
        използване на breadcrumbing.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Те виждат Вашата реклама и това е първата трошица. След това оставяте
        следа, като ги преориентирате последователно.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Няма значение дали скролват Instagram, Facebook, YouTube... те продължават
        да се натъкват на Вашите неща.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        И най-хубавото е, че този вид трафик е ЕВТИН.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Преориентирайте ги. Инсталирайте пиксела. Малко е досадно, но важно е да
        го направите.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И след това ги преориентирайте, докато не КУПЯТ от Вас.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Спрете да се опитвате да се борите с факта, че социалните медии са
        среда с нисък обхват на внимание. Капитализирайте го чрез breadcrumbing.
      </TipsStageBodyText>

      <TipsStageBodyText>Работи. Страхотно е.</TipsStageBodyText>

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
        <strong style={{ color: "#000000" }}>П.С.</strong> Ако искате да
        работите с нас и да поговорите за това как бихме маркетирали Вашия
        бизнес, разгледайте това видео. Има всякакви информация за това как
        работи.
      </Text>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage10Email;
