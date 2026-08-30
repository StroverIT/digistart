import React from "react";
import { Img } from "@react-email/components";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { TipsStageBodyText, TipsStageVideoCta, TipsStageEmailShell, TipsStageSignOff } from "./layout";

const IMAGE_URL = "/assets/unnamed-e0117071-572d-4a8a-ac65-1d7f1b457edb.png";

export function ThreeFreeTipsStage6Email({ email, stage }: ThreeFreeTipsStageEmailProps) {
  return (
    <TipsStageEmailShell previewText="Лесен начин да се класирате по-високо в Google за 30 секунди.">
      <TipsStageBodyText>Здравейте,</TipsStageBodyText>

      <TipsStageBodyText>
        Има няколко неща, които можете да направите, за да се класирате по-добре
        в Google. Някои са много сложни, замесени, технически и досадни.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Нека пропуснем тези за днес. Ще Ви дам един от най-лесните начини да се
        класирате по-високо за нула време.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Отнема 30 секунди за внедряване. Може би 5 минути, ако не сте докосвали
        уебсайта си от известно време.
      </TipsStageBodyText>

      <TipsStageBodyText>Ето пример за уебсайт:</TipsStageBodyText>

      <Img
        src={IMAGE_URL}
        alt="Website homepage example"
        style={{
          width: "100%",
          maxWidth: "560px",
          height: "auto",
          margin: "16px 0",
          borderRadius: "8px",
        }}
      />

      <TipsStageBodyText>
        Това е началната страница на клиника за грижа за кожата. Печелили са
        награди, дизайнът изглежда много елегантен, всичко е наред.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Да кажем, че искате да се класирате за „клиника за грижа за кожата" в
        Лондон.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Имате клиника за грижа за кожата. Находите се в Лондон. Това е страхотно
        начало.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>НО</TipsStageBodyText>

      <TipsStageBodyText>
        Google е машина. Тя не разбира дизайн. Не я интересува дизайн. И не се
        справя много добре с контекста. По-добре е просто да ѝ дадете това,
        което ѝ трябва.
      </TipsStageBodyText>

      <TipsStageBodyText>
        Така че вместо да използвате името на Вашия бизнес като заглавие, бихте
        го заменили с нещо като:
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>
        Клиника за грижа за кожата в Лондон
      </TipsStageBodyText>

      <TipsStageBodyText>или, ако наистина, наистина, наистина чувствате нуждата да поставите името на Вашия бизнес там:</TipsStageBodyText>

      <TipsStageBodyText emphasis>
        {"<"}име на бизнеса{">"}, Вашата Клиника за грижа за кожата в Лондон
      </TipsStageBodyText>

      <TipsStageBodyText>
        (Не съм голям фен на името на бизнеса в заглавието, защото те вече са на
        нашата страница. Има лого, има много място другаде, за да покажете името
        на бизнеса, но понякога клиентите настояват така или иначе)
      </TipsStageBodyText>

      <TipsStageBodyText>
        Просто като направите тази малка промяна, ще започнете да се класирате
        по-високо. Защото правите КРИСТАЛНО ЯСНО за Google за какво се занимавате.
      </TipsStageBodyText>

      <TipsStageBodyText>
        И като бонус също правите кристално ясно за Вашите клиенти.
      </TipsStageBodyText>

      <TipsStageBodyText emphasis>Win-Win.</TipsStageBodyText>

      <TipsStageBodyText>
        Опитайте го. След това му дайте няколко дни, преди да проверите
        класирането отново. Отнема малко време на Google да обходи промените и да
        актуализира нещата.
      </TipsStageBodyText>

      <TipsStageSignOff>
        До скоро,
        <br />
        Емил Златинов
      </TipsStageSignOff>

      <TipsStageBodyText>
        <strong>П.С.</strong> Ако искате ние да се занимаваме с този вид неща за
        Вас, свържете се с нас тук:
      </TipsStageBodyText>

      <TipsStageVideoCta email={email} stage={stage} />
    </TipsStageEmailShell>
  );
}

export default ThreeFreeTipsStage6Email;
