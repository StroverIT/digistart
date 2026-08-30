import type { ReactElement } from "react";
import { ThreeFreeTipsStage1Email } from "./stage-1";
import { ThreeFreeTipsStage2Email } from "./stage-2";
import { ThreeFreeTipsStage3Email } from "./stage-3";
import { ThreeFreeTipsStage4Email } from "./stage-4";
import { ThreeFreeTipsStage5Email } from "./stage-5";
import { ThreeFreeTipsStage6Email } from "./stage-6";
import { ThreeFreeTipsStage7Email } from "./stage-7";
import { ThreeFreeTipsStage8Email } from "./stage-8";
import { ThreeFreeTipsStage9Email } from "./stage-9";
import { ThreeFreeTipsStage10Email } from "./stage-10";
import { ThreeFreeTipsStage11Email } from "./stage-11";
import { ThreeFreeTipsStage12Email } from "./stage-12";
import { ThreeFreeTipsStage13Email } from "./stage-13";
import { ThreeFreeTipsStage14Email } from "./stage-14";
import { ThreeFreeTipsStage15Email } from "./stage-15";
import { ThreeFreeTipsStage16Email } from "./stage-16";
import type { ThreeFreeTipsStageEmailProps } from "./types";
import { THREE_FREE_TIPS_PREVIEW_EMAIL } from "./types";

export type ThreeFreeTipsStageRenderContext = ThreeFreeTipsStageEmailProps;

export type ThreeFreeTipsStageDefinition = {
  stage: number;
  subject: string;
  previewText: string;
  render: (context: ThreeFreeTipsStageRenderContext) => ReactElement;
};

/**
 * Ordered nurture stages for "3 безплатни съвета".
 * Append a new entry + template component to add another stage.
 */
export const THREE_FREE_TIPS_STAGES: ThreeFreeTipsStageDefinition[] = [
  {
    stage: 1,
    subject: "3 неща",
    previewText: "Трите неща, които трябва да подредите за топ 3 в Google",
    render: (ctx) => <ThreeFreeTipsStage1Email {...ctx} />,
  },
  {
    stage: 2,
    subject: "всички мамят",
    previewText: "Защо конкуренцията ви се класира по-добре? Вероятно мамят.",
    render: (ctx) => <ThreeFreeTipsStage2Email {...ctx} />,
  },
  {
    stage: 3,
    subject: "единственото нещо, което има значение",
    previewText: "Фокусиране върху това, което има значение. Всичко останало е второстепенно.",
    render: (ctx) => <ThreeFreeTipsStage3Email {...ctx} />,
  },
  {
    stage: 4,
    subject: "това никога не спира",
    previewText: "Най-близкото нещо до перпетуум-мобиле в маркетинга е вашият Google Business Profile.",
    render: (ctx) => <ThreeFreeTipsStage4Email {...ctx} />,
  },
  {
    stage: 5,
    subject: "дали си заслужава?",
    previewText: "Ако можете да привлечете повече клиенти, класирането в топ 3 си заслужава.",
    render: (ctx) => <ThreeFreeTipsStage5Email {...ctx} />,
  },
  {
    stage: 6,
    subject: "просто и работи",
    previewText: "Лесен начин да се класирате по-високо в Google за 30 секунди.",
    render: (ctx) => <ThreeFreeTipsStage6Email {...ctx} />,
  },
  {
    stage: 7,
    subject: "най-добрият предсказател",
    previewText: "Ако не можете да се учите от грешките си, винаги ще се проваляте.",
    render: (ctx) => <ThreeFreeTipsStage7Email {...ctx} />,
  },
  {
    stage: 8,
    subject: "на върха на хълма",
    previewText: "Колкото по-дълго сте на върха, толкова по-трудно е да ви изхвърлят оттам.",
    render: (ctx) => <ThreeFreeTipsStage8Email {...ctx} />,
  },
  {
    stage: 9,
    subject: "всички грешат",
    previewText: "Всички грешат относно AI. Използвайте го като по-силен компютър, не го карайте да прави човешки неща.",
    render: (ctx) => <ThreeFreeTipsStage9Email {...ctx} />,
  },
  {
    stage: 10,
    subject: "breadcrumbing",
    previewText: "Спрете да се опитвате да натъпчете всичко в една реклама. Използвайте breadcrumbing.",
    render: (ctx) => <ThreeFreeTipsStage10Email {...ctx} />,
  },
  {
    stage: 11,
    subject: "накарай го да спре",
    previewText: "Комбинирайте локално SEO с Meta реклами и Google реклами и ще победите конкуренцията всеки път.",
    render: (ctx) => <ThreeFreeTipsStage11Email {...ctx} />,
  },
  {
    stage: 12,
    subject: "това никога не спира",
    previewText: "Най-близкото нещо до перпетуум-мобиле в маркетинга е вашият Google Business Profile.",
    render: (ctx) => <ThreeFreeTipsStage12Email {...ctx} />,
  },
  {
    stage: 13,
    subject: "единственото нещо, което има значение",
    previewText: "Управлението на времето се свежда до едно нещо – фокусиране върху това, което има значение.",
    render: (ctx) => <ThreeFreeTipsStage13Email {...ctx} />,
  },
  {
    stage: 14,
    subject: "дали си заслужава?",
    previewText: "Ако можете да привлечете повече клиенти, класирането в топ 3 си заслужава.",
    render: (ctx) => <ThreeFreeTipsStage14Email {...ctx} />,
  },
  {
    stage: 15,
    subject: "едното нещо",
    previewText: "Единственото нещо, което предсказва дали ще се справите добре с лийдовете, е скоростта.",
    render: (ctx) => <ThreeFreeTipsStage15Email {...ctx} />,
  },
  {
    stage: 16,
    subject: "трябва да е така",
    previewText: "Ако не Ви плаши леко, вероятно не натискате достатъчно силно.",
    render: (ctx) => <ThreeFreeTipsStage16Email {...ctx} />,
  },
];

export function getThreeFreeTipsStage(
  stage: number,
): ThreeFreeTipsStageDefinition | undefined {
  return THREE_FREE_TIPS_STAGES.find((entry) => entry.stage === stage);
}

export function getLastThreeFreeTipsStageNumber(): number {
  if (THREE_FREE_TIPS_STAGES.length === 0) return 0;
  return Math.max(...THREE_FREE_TIPS_STAGES.map((entry) => entry.stage));
}

export function listThreeFreeTipsStageNumbers(): number[] {
  return THREE_FREE_TIPS_STAGES.map((entry) => entry.stage).sort((a, b) => a - b);
}

export { THREE_FREE_TIPS_PREVIEW_EMAIL } from "./types";
export type { ThreeFreeTipsStageEmailProps } from "./types";
