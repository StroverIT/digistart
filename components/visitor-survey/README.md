# Visitor survey

Onboarding questionnaire on the homepage (`/`). Answers are saved in the browser and used to personalize service pages and analytics.

## Components

| File                   | Role                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home-page-client.tsx` | Reads URL params, decides whether to show the survey or redirect returning visitors. Wraps the survey in `Suspense` (required for `useSearchParams`). |
| `visitor-survey.tsx`   | Multi-step UI, animations, analytics, and `localStorage` persistence.                                                                                 |

The homepage server component renders `HomePageClient`:

```tsx
// app/(site)/page.tsx
import { HomePageClient } from "@/components/visitor-survey/home-page-client";

export default function HomePage() {
  return <HomePageClient />;
}
```

## Survey flow

| Step          | Question                              | Notes                                                                                                        |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1. Investment | Желаеш ли да инвестираш в бизнеса си? | **Не** → redirect to TikTok (exit). **Да** → continue.                                                       |
| 2. Channels   | Къде продаваш в момента?              | Multi-select. **Друго** requires a text label.                                                               |
| 3. Orders     | Грубо колко поръчки правиш на месец?  | Single choice.                                                                                               |
| 4. Services   | От кои услуги се интересуваш?         | Multi-select; first selection becomes `primaryService`. **Skipped** when `chosenService` is set (see below). |

After completion, the user is redirected to the service page for `primaryService` (e.g. `/services/online-store`).

## Service IDs

Use the **ID** in URLs (`?chosenService=…`), `localStorage` (`primaryService`, `selectedServices`), and TypeScript (`VisitorServiceId`).

| ID                | Услуга (въпросник) | Описание във въпросника                  | Страница                    | Примерен линк за реклама          |
| ----------------- | ------------------ | ---------------------------------------- | --------------------------- | --------------------------------- |
| `online-store`    | Онлайн магазин     | Готов магазин за поръчки извън чата      | `/services/online-store`    | `/?chosenService=online-store`    |
| `ai-automation`   | AI Automation      | Автоматизирай съобщенията в Instagram    | `/services/ai-automation`   | `/?chosenService=ai-automation`   |
| `ads`             | Реклами            | Facebook и Instagram реклами             | `/services/ads`             | `/?chosenService=ads`             |
| `social-media`    | Социални мрежи     | Подредено присъствие и съдържание        | `/services/social-media`    | `/?chosenService=social-media`    |
| `google-business` | Google My Business | Профил, който изглежда надежден в Google | `/services/google-business` | `/?chosenService=google-business` |

**Кратко:** ID-то е slug-ът в URL-а и в кода; името на услугата в сайта/въпросника е колоната „Услуга“.

- **Онлайн магазин** → `online-store`
- **AI Automation** → `ai-automation`
- **Реклами** → `ads`
- **Социални мрежи** → `social-media`
- **Google My Business** → `google-business`

Източник: `SERVICE_SURVEY_OPTIONS` в `lib/visitor-preferences/constants.ts`.

## URL query parameters

### `chosenService` - service-specific ads

Use when the ad already targets one service. The visitor does not see step 4; after step 3 the survey finishes and redirects to that service.

**Example**

```
https://your-domain.com/?chosenService=online-store
```

**Valid values:** any ID from [Service IDs](#service-ids) (must match exactly).

Invalid or missing values → full survey including the services step.

Service interest is still sent to analytics when the survey completes via this param.

### `edit=1` - change answers

Shows the survey starting at **channels** (step 2), with previous answers pre-filled from storage. The services step is always shown; `chosenService` is ignored in edit mode.

**Example**

```
https://your-domain.com/?edit=1
```

## Returning visitors

If the user has already completed the survey (`localStorage` key `digistart_visitor_preferences`), visiting `/` redirects them to their saved `primaryService` page. Query params on `/` do not override that (they are not sent through the redirect).

To run the survey again, clear preferences (e.g. **Промени мнението си** in the site menu) or use devtools to remove `digistart_visitor_preferences`.

## `VisitorSurvey` props

Use only via `HomePageClient` on the homepage unless you have a special case.

```tsx
<VisitorSurvey
  isEditMode={false}
  chosenService="online-store" // optional
/>
```

| Prop            | Type               | Description                                                |
| --------------- | ------------------ | ---------------------------------------------------------- |
| `isEditMode`    | `boolean`          | Skip investment step; start at channels; load saved prefs. |
| `chosenService` | `VisitorServiceId` | Pre-select service and skip the services step.             |

## Stored data

Preferences live in `localStorage` under `digistart_visitor_preferences` (see `lib/visitor-preferences/storage.ts`). Shape:

- `salesChannels`, `otherChannelLabel?`, `monthlyOrders`
- `selectedServices`, `primaryService`
- `completedAt`, `version`

Service pages read this via `VisitorPreferencesProvider` and `useVisitorPreferences()` for copy personalization.

## Related code

- `lib/visitor-preferences/` - types, constants, paths, analytics, personalization
- `components/visitor-preferences/` - React context for the rest of the site
- `e2e/visitor-survey.spec.ts` - Playwright flows

## E2E testing

```bash
# from repo root, with app running as your project expects
npx playwright test e2e/visitor-survey.spec.ts
```

Helpers: `e2e/helpers/survey.ts` (`completeVisitorSurvey`, `seedCompletedSurveyPreferences`, etc.).

## Ad link checklist

1. Pick the correct `chosenService` id from [Service IDs](#service-ids).
2. Point the ad to `/?chosenService=<id>` on your production domain.
3. Do not rely on `chosenService` for users who already completed the survey-they will go straight to their saved service.
