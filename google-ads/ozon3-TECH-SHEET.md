# Ozon3 Google Ads — Технически лист (ръчно в браузър)

**Акаунт:** ОЗОН 3 ЕООД - ЕВРО (`ocid=7881440584`)  
**Сайт:** https://www.ozon3.bg  
**Телефон (call asset):** 087 877 0796  
**Валута:** EUR  

**Пълни ключови думи + RSA (copy-paste):**  
[`ozon3-search-categories-brands-FULL-SPEC.md`](./ozon3-search-categories-brands-FULL-SPEC.md)

---

## Какво НЕ пипаш

| Кампания | Действие |
|---|---|
| `Search-Brand` | Не пипай (вече paused) |
| `Search-General` | Не пипай |
| `Search-Brand-Izi` | Не пипай |
| `Search-General-Izi` | Не пипай |

---

## Какво създаваш (2 нови кампании)

| # | Име | Goal в UI | Цел на бизнеса | Бюджет | Статус |
|---|---|---|---|---|---|
| 1 | `Search-Categories` | **Sales** | Тип / мощност / оферта (не марка) | **€5/ден** | **Paused** |
| 2 | `Search-Brands` | **Sales** | Gree / MHI / ME / Daikin / Midea / Fujitsu / Toshiba | **€5/ден** | **Paused** |

Общо ако и двете са ON: **€10/ден**. Пускай ги само след преглед.

> **Не** избирай Website traffic — това е за кликове. За продажби/лидове ползвай **Sales**.

---

## Предварително: conversion actions (задължително за Sales)

Sales кампанията оптимизира към **конверсии**. Без работещ tracking Google няма на какво да учи.

1. **Goals** → Conversions → провери какво е Primary за акаунта.  
2. За Ozon3 реалистични primary actions (избери какво реално мериш):
   - **Purchase** / покупка (ако e-commerce е настроено), **или**
   - **Submit lead form** / заявка, **или**
   - **Calls from ads** / обаждания (важно с call asset 087 877 0796), **или**
   - Ключова страница (thank-you / „благодарност“ / успешна поръчка)
3. В кампанията при Sales: ползвай **Account-default** goals **или** изрично маркирай само sales/lead/call actions — без „page view“ като primary.
4. Ако акаунтът още дава **0 conversions** — оправи tracking **преди** Enable. Иначе Maximize conversions ще харчи на сляпо или почти няма да върти.

---

## Общи настройки (идентични за двете)

Прави ги **преди** keywords/ads. Не натискай Google **Apply** за partners / Display / Broad / AI Max.

| Setting | Стойност | Забележка |
|---|---|---|
| Campaign goal | **Sales** | Не Website traffic / Leads (освен ако нарочно искаш само лидове) |
| Campaign type | **Search** | Sales → Search |
| Networks | Search **ON** | Search partners **OFF**, Display **OFF** |
| AI Max | **OFF** | Text customisation / Final URL expansion OFF |
| Locations | **Radius 110 km around Pleven** | Advanced search → Radius → Pleven → **110** → **km** → Save |
| Location options | **Presence:** People in or regularly in… | НЕ “Presence or interest” |
| Languages | **Bulgarian** only | Махни English ако е добавен |
| Conversion goals | Sales / purchase / calls / leads (primary) | Без page-view като primary |
| Bidding | **Maximize conversions** | Старт без tCPA; после tCPA когато имаш данни |
| Daily budget | **€5** | Average daily budget |
| Match types | **Phrase + Exact only** | Без Broad |
| EU political ads | **No** | — |
| Status | **Paused** | До преглед |

**Bidding бележка:** при €5/ден + малък radius learning е бавен. След 20–30+ conversions в акаунта можеш да сложиш **Target CPA**. Дотогава Maximize conversions без target.

### Гео — точни стъпки

1. Locations → **Enter another location**  
2. **Advanced search** → radio **Radius**  
3. Place: `Pleven` / `Pleven, Bulgaria` → Include  
4. Distance: **110**, unit: **km**  
5. Save  
6. Провери: има **само** `110 km around Pleven` — **няма** Bulgaria / All countries  
7. Location options → **Presence** (не interest)

---

## Shared assets (и двете кампании)

### Negative keywords (campaign-level) — Exact предпочитано за марки/конкуренти

```
ремонт
сервиз
употребяван
втора ръка
наем
pdf
инструкция
форум
зора
технополис
метро
техномаркет
```

### Sitelinks (≥2)

| Текст | Desc 1 | Desc 2 | Final URL |
|---|---|---|---|
| Монтаж | Включен стандартен монтаж | Професионален екип | https://www.ozon3.bg/info/montazh-i-garanciya/montazh-na-klimatici |
| Изплащане | Стоки на изплащане | 0% лихва при оферта | https://www.ozon3.bg/info/dostavka-i-plashtane/stoki-na-izplashtane |
| Гаранция | Оригинални марки | Гаранция и консултация | https://www.ozon3.bg/info/montazh-i-garanciya/garanciya-na-klimatici |

### Call asset

- Country: Bulgaria (+359)  
- Phone: **087 877 0796**  
- Call reporting: ON ако има

### RSA Business name

`Озон 3`

---

# КАМПАНИЯ 1 — `Search-Categories`

**Цел:** категорийен / мощен / оферен intent.  
**Важно:** НЕ добавяй голи head terms `климатици` / `климатик`.

### Допълнителни campaign negatives (марки → да отиват в Brands)

```
gree
грее
daikin
дайкин
midea
fujitsu
фуджицу
toshiba
тошиба
mitsubishi
мицубиши
mitsubishi heavy
mitsubishi electric
```

### Ad groups (9)

| Ad group | Landing URL | Path 1 / Path 2 | Keywords (кратко) |
|---|---|---|---|
| **Inverter** | https://www.ozon3.bg/klimatici/invertorni-klimatici | `klimatici` / `invertorni` | инверторен климатик, инверторни климатици |
| **Hyperinverter** | https://www.ozon3.bg/klimatici/hiperinvertorni-klimatici | `klimatici` / `hiperinvert` | хиперинверторен/-и климатик/ци |
| **Floor** | https://www.ozon3.bg/klimatici/podovi-klimatici | `klimatici` / `podovi` | подов/-и климатик/ци |
| **Multisplit** | https://www.ozon3.bg/klimatici/multisplit-sistemi | `klimatici` / `multisplit` | мултисплит, multisplit |
| **BTU 9k** | https://www.ozon3.bg/klimatici?filterAttributes[52][8]=8 | `klimatici` / `9000btu` | 9000 btu / 9ка |
| **BTU 12k** | https://www.ozon3.bg/klimatici?filterAttributes[52][10]=10 | `klimatici` / `12000btu` | 12000 btu / 12ка |
| **BTU 18k** | https://www.ozon3.bg/klimatici?filterAttributes[52][15]=15 | `klimatici` / `18000btu` | 18000 btu / 18ка |
| **Offer install** | https://www.ozon3.bg/klimatici | `klimatici` / `montazh` | климатик(и) с монтаж / безплатен монтаж |
| **Offer finance** | https://www.ozon3.bg/info/dostavka-i-plashtane/stoki-na-izplashtane | `izplashtane` / `0procent` | на изплащане / лизинг / 0% |

За всяка ad group:
1. Преименувай ad group  
2. Paste **Phrase + Exact** от FULL-SPEC (секция Paste blocks / съответната ad group)  
3. RSA: 10–15 headlines + 3–4 descriptions от FULL-SPEC  
4. Final URL + paths както в таблицата  
5. Business name: `Озон 3`

---

# КАМПАНИЯ 2 — `Search-Brands`

**Цел:** brand intent с отделни LP и по-чист CPC.  
**Във всяка ad group:** negative-вай **другите** марки (виж FULL-SPEC per ad group).

### Ad groups (7)

| Ad group | Landing URL | Path 1 / Path 2 | Brand ID на сайта |
|---|---|---|---|
| **Gree** | https://www.ozon3.bg/klimatici?brand[]=44 | `klimatici` / `gree` | 44 |
| **Mitsubishi Heavy** | https://www.ozon3.bg/klimatici?brand[]=48 | `klimatici` / `mhi` | 48 |
| **Mitsubishi Electric** | https://www.ozon3.bg/klimatici?brand[]=43 | `klimatici` / `me` | 43 |
| **Daikin** | https://www.ozon3.bg/klimatici?brand[]=42 | `klimatici` / `daikin` | 42 |
| **Midea** | https://www.ozon3.bg/klimatici?brand[]=49 | `klimatici` / `midea` | 49 |
| **Fujitsu** | https://www.ozon3.bg/klimatici?brand[]=50 | `klimatici` / `fujitsu` | 50 |
| **Toshiba** | https://www.ozon3.bg/klimatici?brand[]=46 | `klimatici` / `toshiba` | 46 |

Keywords пример (Gree) — останалите в FULL-SPEC:

```
"климатици gree"
[климатици gree]
"климатик gree"
[климатик gree]
"gree климатик"
[gree климатик]
"грее климатик"
[грее климатик]
"климатици грее"
[климатици грее]
```

---

## Ред на работа в UI (checklist)

### A. Подготовка
- [ ] Логин в правилния акаунт: **ОЗОН 3 ЕООД - ЕВРО**
- [ ] Отвори FULL-SPEC до себе си за copy-paste
- [ ] Реши дали да **довършиш** съществуващия `Search-Categories` (`24209549661`) / draft, или да **изтриеш непълното** и да създадеш на чисто

### B. `Search-Categories`
- [ ] New campaign → **Sales** → Search
- [ ] Conversion goals: primary sales/lead/call (не page view)
- [ ] Bidding: **Maximize conversions**
- [ ] Име: `Search-Categories`
- [ ] Partners OFF, Display OFF, AI Max OFF
- [ ] Geo: **110 km Pleven**, Presence only, Bulgarian
- [ ] Budget: **€5/day**, status **Paused**
- [ ] 9 ad groups + keywords + RSA + LP
- [ ] Campaign negatives: shared + brand list
- [ ] Sitelinks + Call

### C. `Search-Brands`
- [ ] Същите settings като Categories (**Sales**, не Website traffic)
- [ ] Име: `Search-Brands`
- [ ] Budget: **€5/day**, status **Paused**
- [ ] 7 brand ad groups + keywords + RSA + LP
- [ ] Cross-brand negatives per ad group
- [ ] Shared negatives + sitelinks + call

### D. Финален QA (преди Enable)
- [ ] И двете са **Paused** и goal = **Sales**
- [ ] Bidding = Maximize conversions
- [ ] Location = **само** radius 110 km (не Bulgaria-wide)
- [ ] Няма Broad keywords
- [ ] Partners / Display / AI Max са OFF
- [ ] Categories има brand negatives
- [ ] Brands има правилни brand LP (`brand[]=…`)
- [ ] Call: 087 877 0796
- [ ] Conversion tracking работи (тестов fire) преди Enable

---

## Текущо състояние в акаунта (към последната сесия)

| Item | Статус |
|---|---|
| `Search-Categories` ID `24209549661` | Създадена, **Paused**; непълна (Inverter keywords; RSA save блокиран от passkey) |
| Categories draft | Може да има `Search-Categories-build` / подобен draft |
| `Search-Brands` draft `10212642275` | Wizard: geo 110 km + €5 + Gree keywords частично; **не е Publish** |
| Shared negatives / sitelinks | Недовършени |

**Препоръка за чист резултат:** ако непълните draft/кампании те объркват — изтрий/архивирай непълното и създай двете кампании начисто по този лист + FULL-SPEC.

### Директни линкове (същият Google акаунт)

- Campaigns: `https://ads.google.com/aw/campaigns?ocid=7881440584`  
- Brands draft (ако още съществува):  
  `https://ads.google.com/aw/campaigns/new/search/draft?ocid=7881440584&draftId=10212642275`  
- Drafts: Campaigns → **Drafts**

---

## Особености / капани

1. **Goal = Sales**, не Website traffic — иначе оптимизираш към клик, не към продажба/обаждане.  
2. **Conversion tracking първо** — без primary conversions Maximize conversions е сляпо.  
3. **Passkey** — Save често иска Confirm в реален Chrome. Не Skip.  
4. **Radius UI** е капризен — след Save провери, че радиусът е останал.  
5. **Не Apply** препоръки за Search partners / Display / Broad / AI Max.  
6. **Език Bulgarian** ≠ само българи; латински брандове работят като keywords.  
7. Categories ↔ Brands се разделят с brand negatives + отделни brand ad groups.  
8. След Publish остави **Paused**, прегледай, после Enable.

---

*Източник: одобрен план „Ozon3 Search: Categories + Brands (Плевен + 110 км)“ + FULL-SPEC.*
