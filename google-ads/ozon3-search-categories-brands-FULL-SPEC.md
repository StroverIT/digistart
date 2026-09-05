# Ozon3 Google Ads — Full Spec (Categories + Brands)

**Account:** ОЗОН 3 ЕООД - ЕВРО (`ocid=7881440584`)  
**Website:** https://www.ozon3.bg  
**Phone (call asset):** 087 877 0796  
**Status when created:** Paused (review before enable)  
**Do not touch:** existing paused `Search-Brand` / `Search-General` / `Search-Brand-Izi` / `Search-General-Izi`

Use this file to rebuild everything manually in Google Ads while passkey is blocked.

---

## Why Bulgarian language?

1. **Approved plan** set campaign language to Bulgarian (`Език: български`).
2. **Market & geo:** target is people in/near **Pleven, Bulgaria**. Search demand for ACs there is overwhelmingly Bulgarian (`климатик`, `инверторни климатици`, `с монтаж`, etc.).
3. **Site & offer copy** on [ozon3.bg](https://www.ozon3.bg/) is Bulgarian — ads must match landing pages (Quality Score / relevance).
4. **Existing account signals** already showed Bulgarian queries (климатици, марки, изплащане, монтаж, конкуренти).
5. Google Ads **Languages** = language of the *query/UI preference*, not “only Bulgarians.” With Bulgarian keywords + Bulgarian language targeting you catch the right searches in the 110 km radius. Brand Latin spellings (`daikin`, `gree`) still work as keywords inside a Bulgarian-language campaign.

If you later want English/Romanian tourists, that would be a separate experiment — not the core Pleven retail intent.

---

## Shared campaign settings (both campaigns)

| Setting | Value |
|---|---|
| Type | Search only |
| Networks | Search Network **ON**; Search partners **OFF**; Display **OFF** |
| AI Max / automatically created assets | **OFF** (do not Apply Google recommendations that expand match/networks) |
| Locations | **Radius 110 km around Pleven, Bulgaria** |
| Location options | **Presence: People in or regularly in your targeted locations** (not “interested in”) |
| Languages | **Bulgarian** |
| Bid strategy | Manual CPC or Maximize clicks with €5/day (match what you prefer; plan used low fixed daily budget) |
| Daily budget | **€5 / day per campaign** |
| Campaign status | **Paused** |
| Match types | **Phrase + Exact only** (no Broad) |
| Currency | EUR (account) |

### Shared negative keywords (phrase or exact — prefer Exact for brand/competitor names)

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

### Account / campaign sitelinks (need ≥2 to show)

| Sitelink text | Description line 1 | Description line 2 | Final URL |
|---|---|---|---|
| Монтаж | Включен стандартен монтаж | Професионален екип | https://www.ozon3.bg/uslugi/ |
| Изплащане | Стоки на изплащане | 0% лихва при оферта | https://www.ozon3.bg/info/dostavka-i-plashtane/stoki-na-izplashtane |
| Гаранция | Оригинални марки | Гаранция и консултация | https://www.ozon3.bg/klimatici |

*(Adjust sitelink URLs if `/uslugi/` or warranty page differs — keep them on ozon3.bg.)*

### Call asset

- Country: Bulgaria (+359)
- Phone: **087 877 0796**
- Call reporting: ON if available

### Business name (RSA)

`Озон 3`  
(Verified advertiser name hint in UI: ОЗОН 3 ЕООД)

---

# CAMPAIGN 1 — `Search-Categories`

**Purpose:** Category / power / offer intent (not brand).  
**Campaign-level brand negatives** (so brand traffic goes to Search-Brands):

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

**Do NOT add** generic head terms alone: `климатици`, `климатик` (expensive, weak LP match).

---

## Ad group 1.1 — Inverter

**Landing URL:** https://www.ozon3.bg/klimatici/invertorni-klimatici  
**Paths:** `klimatici` / `invertorni`

### Keywords (Phrase + Exact each)

| Keyword | Phrase | Exact |
|---|---|---|
| инверторен климатик | `"инверторен климатик"` | `[инверторен климатик]` |
| инверторни климатици | `"инверторни климатици"` | `[инверторни климатици]` |

### RSA — Headlines (≤30 chars each)

1. Климатици Озон 3
2. Инверторни климатици
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Инверторен климатик
9. Монтаж включен
10. Купи с консултация
11. Озон 3 климатици
12. За дома и офиса
13. Проверени марки
14. Доставка и монтаж
15. Обадете се сега

### RSA — Descriptions (≤90 chars)

1. Инверторни климатици с включен стандартен монтаж и изплащане 0%.
2. Купете инверторен климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. Изберете инверторен климатик с монтаж от Озон 3.

---

## Ad group 1.2 — Hyperinverter

**Landing URL:** https://www.ozon3.bg/klimatici/hiperinvertorni-klimatici  
**Paths:** `klimatici` / `hiperinvert`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| хиперинверторен климатик | `"хиперинверторен климатик"` | `[хиперинверторен климатик]` |
| хиперинверторни климатици | `"хиперинверторни климатици"` | `[хиперинверторни климатици]` |

### RSA — Headlines

1. Климатици Озон 3
2. Хиперинверторни
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Хиперинвертор климатик
9. Висока ефективност
10. Монтаж включен
11. Озон 3 климатици
12. За дома и офиса
13. Проверени марки
14. Доставка и монтаж
15. Обадете се сега

### RSA — Descriptions

1. Хиперинверторни климатици с включен стандартен монтаж и изплащане 0%.
2. Купете хиперинверторен климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. Енергийно ефективни хиперинверторни климатици с монтаж.

---

## Ad group 1.3 — Floor

**Landing URL:** https://www.ozon3.bg/klimatici/podovi-klimatici  
**Paths:** `klimatici` / `podovi`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| подов климатик | `"подов климатик"` | `[подов климатик]` |
| подови климатици | `"подови климатици"` | `[подови климатици]` |

### RSA — Headlines

1. Климатици Озон 3
2. Подови климатици
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Подов климатик
9. Монтаж включен
10. За вашия дом
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Подови климатици с включен стандартен монтаж и изплащане 0%.
2. Купете подов климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. Подови климатици с монтаж — Озон 3 Плевен и регион.

---

## Ad group 1.4 — Multisplit

**Landing URL:** https://www.ozon3.bg/klimatici/multisplit-sistemi  
**Paths:** `klimatici` / `multisplit`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| мултисплит | `"мултисплит"` | `[мултисплит]` |
| мултисплит системи | `"мултисплит системи"` | `[мултисплит системи]` |
| мултисплит климатик | `"мултисплит климатик"` | `[мултисплит климатик]` |

### RSA — Headlines

1. Климатици Озон 3
2. Мултисплит системи
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Мултисплит климатик
9. За няколко стаи
10. Монтаж включен
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Мултисплит системи с включен стандартен монтаж и изплащане 0%.
2. Купете мултисплит от Озон 3 в Плевен с консултация.
3. Един външен блок за няколко стаи — монтаж и гаранция.
4. Мултисплит климатици с професионален монтаж от Озон 3.

---

## Ad group 1.5 — BTU 9k

**Landing URL:** https://www.ozon3.bg/klimatici?filterAttributes[52][8]=8  
**Paths:** `klimatici` / `9000btu`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатик 9000 btu | `"климатик 9000 btu"` | `[климатик 9000 btu]` |
| климатик 9000 | `"климатик 9000"` | `[климатик 9000]` |
| климатик 9 ки | `"климатик 9 ки"` | `[климатик 9 ки]` |
| 9000 btu климатик | `"9000 btu климатик"` | `[9000 btu климатик]` |

### RSA — Headlines

1. Климатици Озон 3
2. Климатик 9000 BTU
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. 9 ки климатик
9. Монтаж включен
10. За малка стая
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици 9000 BTU с включен стандартен монтаж и изплащане 0%.
2. Купете климатик 9 ки от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. Подходящ за по-малки помещения — монтаж от Озон 3.

---

## Ad group 1.6 — BTU 12k

**Landing URL:** https://www.ozon3.bg/klimatici?filterAttributes[52][10]=10  
**Paths:** `klimatici` / `12000btu`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатик 12000 btu | `"климатик 12000 btu"` | `[климатик 12000 btu]` |
| климатик 12000 | `"климатик 12000"` | `[климатик 12000]` |
| климатик 12 ки | `"климатик 12 ки"` | `[климатик 12 ки]` |
| 12000 btu климатик | `"12000 btu климатик"` | `[12000 btu климатик]` |

### RSA — Headlines

1. Климатици Озон 3
2. Климатик 12000 BTU
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. 12 ки климатик
9. Монтаж включен
10. За средна стая
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици 12000 BTU с включен стандартен монтаж и изплащане 0%.
2. Купете климатик 12 ки от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. Популярен размер с монтаж — Озон 3 Плевен и регион.

---

## Ad group 1.7 — BTU 18k

**Landing URL:** https://www.ozon3.bg/klimatici?filterAttributes[52][15]=15  
**Paths:** `klimatici` / `18000btu`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатик 18000 btu | `"климатик 18000 btu"` | `[климатик 18000 btu]` |
| климатик 18000 | `"климатик 18000"` | `[климатик 18000]` |
| климатик 18 ки | `"климатик 18 ки"` | `[климатик 18 ки]` |
| 18000 btu климатик | `"18000 btu климатик"` | `[18000 btu климатик]` |

### RSA — Headlines

1. Климатици Озон 3
2. Климатик 18000 BTU
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. 18 ки климатик
9. Монтаж включен
10. За голяма стая
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици 18000 BTU с включен стандартен монтаж и изплащане 0%.
2. Купете климатик 18 ки от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за вашия дом.
4. По-голяма мощност с професионален монтаж от Озон 3.

---

## Ad group 1.8 — Offer install

**Landing URL:** https://www.ozon3.bg/klimatici  
**Paths:** `klimatici` / `montazh`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатици с монтаж | `"климатици с монтаж"` | `[климатици с монтаж]` |
| климатик с монтаж | `"климатик с монтаж"` | `[климатик с монтаж]` |
| климатици с безплатен монтаж | `"климатици с безплатен монтаж"` | `[климатици с безплатен монтаж]` |
| климатик с безплатен монтаж | `"климатик с безплатен монтаж"` | `[климатик с безплатен монтаж]` |

### RSA — Headlines

1. Климатици Озон 3
2. С включен монтаж
3. Климатик с монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Монтаж включен
9. Стандартен монтаж
10. Купи с монтаж
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. За дома и офиса
15. Обадете се сега

### RSA — Descriptions

1. Климатици с включен стандартен монтаж и изплащане 0% от Озон 3.
2. Купете климатик с монтаж — консултация в Плевен.
3. Не купувате само уред — получавате професионален монтаж.
4. Гаранция, монтаж и консултация от Озон 3 Плевен.

---

## Ad group 1.9 — Offer finance

**Landing URL:** https://www.ozon3.bg/info/dostavka-i-plashtane/stoki-na-izplashtane  
**Paths:** `izplashtane` / `0procent`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатици на изплащане | `"климатици на изплащане"` | `[климатици на изплащане]` |
| климатик на изплащане | `"климатик на изплащане"` | `[климатик на изплащане]` |
| климатици на лизинг | `"климатици на лизинг"` | `[климатици на лизинг]` |
| климатик на лизинг | `"климатик на лизинг"` | `[климатик на лизинг]` |
| климатик изплащане 0 | `"климатик изплащане 0"` | `[климатик изплащане 0]` |

### RSA — Headlines

1. Климатици Озон 3
2. Изплащане 0%
3. На изплащане
4. С включен монтаж
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Климатик на лизинг
9. Лесно плащане
10. Монтаж включен
11. Озон 3 климатици
12. Проверени марки
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици на изплащане с включен стандартен монтаж от Озон 3.
2. Изплащане 0% при оферта — консултация в Плевен.
3. Купете климатик на лизинг/изплащане с монтаж и гаранция.
4. Гъвкаво плащане + професионален монтаж от Озон 3.

---

# CAMPAIGN 2 — `Search-Brands`

**Purpose:** Brand intent with dedicated LPs and cleaner CPC control.  
**Cross-brand negatives:** in each ad group, negative the *other* brand names (phrase/exact).  
**Also apply shared competitor negatives** from the top of this file.

---

## Ad group 2.1 — Gree

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=44  
**Paths:** `klimatici` / `gree`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| климатици gree | `"климатици gree"` | `[климатици gree]` |
| климатик gree | `"климатик gree"` | `[климатик gree]` |
| gree климатик | `"gree климатик"` | `[gree климатик]` |
| грее климатик | `"грее климатик"` | `[грее климатик]` |
| климатици грее | `"климатици грее"` | `[климатици грее]` |

### RSA — Headlines

1. Климатици Gree
2. Gree от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Gree климатик
9. Монтаж включен
10. Оригинален Gree
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици Gree с включен стандартен монтаж и изплащане 0%.
2. Купете Gree климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за Gree.
4. Gree с монтаж — Озон 3 Плевен и 110 км регион.

### Ad-group negatives (other brands)

```
daikin
midea
fujitsu
toshiba
mitsubishi
мицубиши
тошиба
фуджицу
дайкин
```

---

## Ad group 2.2 — Mitsubishi Heavy

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=48  
**Paths:** `klimatici` / `mhi`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| mitsubishi heavy | `"mitsubishi heavy"` | `[mitsubishi heavy]` |
| mitsubishi heavy климатик | `"mitsubishi heavy климатик"` | `[mitsubishi heavy климатик]` |
| климатици мицубиши | `"климатици мицубиши"` | `[климатици мицубиши]` |
| мицубиши климатик | `"мицубиши климатик"` | `[мицубиши климатик]` |
| мицубиши хеви | `"мицубиши хеви"` | `[мицубиши хеви]` |

### RSA — Headlines

1. Mitsubishi Heavy
2. MHI от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Мицубиши климатик
9. Монтаж включен
10. Оригинален MHI
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Mitsubishi Heavy с включен стандартен монтаж и изплащане 0%.
2. Купете мицубиши климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за MHI.
4. Mitsubishi Heavy с монтаж — Озон 3 Плевен и регион.

### Ad-group negatives

```
mitsubishi electric
daikin
gree
midea
fujitsu
toshiba
грее
дайкин
```

---

## Ad group 2.3 — Mitsubishi Electric

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=43  
**Paths:** `klimatici` / `me`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| mitsubishi electric | `"mitsubishi electric"` | `[mitsubishi electric]` |
| mitsubishi electric климатик | `"mitsubishi electric климатик"` | `[mitsubishi electric климатик]` |
| mitsubishi климатик | `"mitsubishi климатик"` | `[mitsubishi климатик]` |
| климатик mitsubishi | `"климатик mitsubishi"` | `[климатик mitsubishi]` |
| мицубиши електрик | `"мицубиши електрик"` | `[мицубиши електрик]` |

### RSA — Headlines

1. Mitsubishi Electric
2. ME от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Mitsubishi климатик
9. Монтаж включен
10. Оригинален ME
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Mitsubishi Electric с включен стандартен монтаж и изплащане 0%.
2. Купете Mitsubishi климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за ME.
4. Mitsubishi Electric с монтаж — Озон 3 Плевен и регион.

### Ad-group negatives

```
mitsubishi heavy
gree
daikin
midea
fujitsu
toshiba
грее
дайкин
```

---

## Ad group 2.4 — Daikin

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=42  
**Paths:** `klimatici` / `daikin`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| daikin климатик | `"daikin климатик"` | `[daikin климатик]` |
| климатици daikin | `"климатици daikin"` | `[климатици daikin]` |
| климатик daikin | `"климатик daikin"` | `[климатик daikin]` |
| дайкин климатик | `"дайкин климатик"` | `[дайкин климатик]` |
| климатици дайкин | `"климатици дайкин"` | `[климатици дайкин]` |

### RSA — Headlines

1. Климатици Daikin
2. Daikin от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Daikin климатик
9. Монтаж включен
10. Оригинален Daikin
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици Daikin с включен стандартен монтаж и изплащане 0%.
2. Купете Daikin климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за Daikin.
4. Daikin с монтаж — Озон 3 Плевен и 110 км регион.

### Ad-group negatives

```
gree
midea
fujitsu
toshiba
mitsubishi
грее
мицубиши
тошиба
фуджицу
```

---

## Ad group 2.5 — Midea

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=49  
**Paths:** `klimatici` / `midea`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| midea климатик | `"midea климатик"` | `[midea климатик]` |
| климатици midea | `"климатици midea"` | `[климатици midea]` |
| климатик midea | `"климатик midea"` | `[климатик midea]` |
| midea breezeless | `"midea breezeless"` | `[midea breezeless]` |
| мидея климатик | `"мидея климатик"` | `[мидея климатик]` |

### RSA — Headlines

1. Климатици Midea
2. Midea от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Midea Breezeless
9. Монтаж включен
10. Оригинален Midea
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици Midea с включен стандартен монтаж и изплащане 0%.
2. Купете Midea климатик от Озон 3 в Плевен.
3. Midea Breezeless и други модели с монтаж и гаранция.
4. Midea с монтаж — Озон 3 Плевен и регион.

### Ad-group negatives

```
gree
daikin
fujitsu
toshiba
mitsubishi
грее
дайкин
тошиба
фуджицу
```

---

## Ad group 2.6 — Fujitsu

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=50  
**Paths:** `klimatici` / `fujitsu`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| fujitsu климатик | `"fujitsu климатик"` | `[fujitsu климатик]` |
| климатици fujitsu | `"климатици fujitsu"` | `[климатици fujitsu]` |
| климатици фуджицу | `"климатици фуджицу"` | `[климатици фуджицу]` |
| фуджицу климатик | `"фуджицу климатик"` | `[фуджицу климатик]` |
| климатик fujitsu | `"климатик fujitsu"` | `[климатик fujitsu]` |

### RSA — Headlines

1. Климатици Fujitsu
2. Fujitsu от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Фуджицу климатик
9. Монтаж включен
10. Оригинален Fujitsu
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици Fujitsu с включен стандартен монтаж и изплащане 0%.
2. Купете Fujitsu / фуджицу климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за Fujitsu.
4. Fujitsu с монтаж — Озон 3 Плевен и регион.

### Ad-group negatives

```
gree
daikin
midea
toshiba
mitsubishi
грее
дайкин
тошиба
мицубиши
```

---

## Ad group 2.7 — Toshiba

**Landing URL:** https://www.ozon3.bg/klimatici?brand[]=46  
**Paths:** `klimatici` / `toshiba`

### Keywords

| Keyword | Phrase | Exact |
|---|---|---|
| toshiba климатик | `"toshiba климатик"` | `[toshiba климатик]` |
| климатици toshiba | `"климатици toshiba"` | `[климатици toshiba]` |
| климатик toshiba | `"климатик toshiba"` | `[климатик toshiba]` |
| тошиба климатик | `"тошиба климатик"` | `[тошиба климатик]` |
| климатици тошиба | `"климатици тошиба"` | `[климатици тошиба]` |

### RSA — Headlines

1. Климатици Toshiba
2. Toshiba от Озон 3
3. С включен монтаж
4. Изплащане 0%
5. Гаранция и монтаж
6. Консултация в Плевен
7. Озон 3 Плевен
8. Тошиба климатик
9. Монтаж включен
10. Оригинален Toshiba
11. Озон 3 климатици
12. Проверена марка
13. Доставка и монтаж
14. Купи с консултация
15. Обадете се сега

### RSA — Descriptions

1. Климатици Toshiba с включен стандартен монтаж и изплащане 0%.
2. Купете Toshiba / тошиба климатик от Озон 3 в Плевен.
3. Консултация, гаранция и професионален монтаж за Toshiba.
4. Toshiba с монтаж — Озон 3 Плевен и регион.

### Ad-group negatives

```
gree
daikin
midea
fujitsu
mitsubishi
грее
дайкин
фуджицу
мицубиши
```

---

# Quick paste: keyword lists only

## Search-Categories — Inverter
```
"инверторен климатик"
[инверторен климатик]
"инверторни климатици"
[инверторни климатици]
```

## Search-Categories — Hyperinverter
```
"хиперинверторен климатик"
[хиперинверторен климатик]
"хиперинверторни климатици"
[хиперинверторни климатици]
```

## Search-Categories — Floor
```
"подов климатик"
[подов климатик]
"подови климатици"
[подови климатици]
```

## Search-Categories — Multisplit
```
"мултисплит"
[мултисплит]
"мултисплит системи"
[мултисплит системи]
"мултисплит климатик"
[мултисплит климатик]
```

## Search-Categories — BTU 9k
```
"климатик 9000 btu"
[климатик 9000 btu]
"климатик 9000"
[климатик 9000]
"климатик 9 ки"
[климатик 9 ки]
"9000 btu климатик"
[9000 btu климатик]
```

## Search-Categories — BTU 12k
```
"климатик 12000 btu"
[климатик 12000 btu]
"климатик 12000"
[климатик 12000]
"климатик 12 ки"
[климатик 12 ки]
"12000 btu климатик"
[12000 btu климатик]
```

## Search-Categories — BTU 18k
```
"климатик 18000 btu"
[климатик 18000 btu]
"климатик 18000"
[климатик 18000]
"климатик 18 ки"
[климатик 18 ки]
"18000 btu климатик"
[18000 btu климатик]
```

## Search-Categories — Offer install
```
"климатици с монтаж"
[климатици с монтаж]
"климатик с монтаж"
[климатик с монтаж]
"климатици с безплатен монтаж"
[климатици с безплатен монтаж]
"климатик с безплатен монтаж"
[климатик с безплатен монтаж]
```

## Search-Categories — Offer finance
```
"климатици на изплащане"
[климатици на изплащане]
"климатик на изплащане"
[климатик на изплащане]
"климатици на лизинг"
[климатици на лизинг]
"климатик на лизинг"
[климатик на лизинг]
"климатик изплащане 0"
[климатик изплащане 0]
```

## Search-Brands — Gree
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

## Search-Brands — Mitsubishi Heavy
```
"mitsubishi heavy"
[mitsubishi heavy]
"mitsubishi heavy климатик"
[mitsubishi heavy климатик]
"климатици мицубиши"
[климатици мицубиши]
"мицубиши климатик"
[мицубиши климатик]
"мицубиши хеви"
[мицубиши хеви]
```

## Search-Brands — Mitsubishi Electric
```
"mitsubishi electric"
[mitsubishi electric]
"mitsubishi electric климатик"
[mitsubishi electric климатик]
"mitsubishi климатик"
[mitsubishi климатик]
"климатик mitsubishi"
[климатик mitsubishi]
"мицубиши електрик"
[мицубиши електрик]
```

## Search-Brands — Daikin
```
"daikin климатик"
[daikin климатик]
"климатици daikin"
[климатици daikin]
"климатик daikin"
[климатик daikin]
"дайкин климатик"
[дайкин климатик]
"климатици дайкин"
[климатици дайкин]
```

## Search-Brands — Midea
```
"midea климатик"
[midea климатик]
"климатици midea"
[климатици midea]
"климатик midea"
[климатик midea]
"midea breezeless"
[midea breezeless]
"мидея климатик"
[мидея климатик]
```

## Search-Brands — Fujitsu
```
"fujitsu климатик"
[fujitsu климатик]
"климатици fujitsu"
[климатици fujitsu]
"климатици фуджицу"
[климатици фуджицу]
"фуджицу климатик"
[фуджицу климатик]
"климатик fujitsu"
[климатик fujitsu]
```

## Search-Brands — Toshiba
```
"toshiba климатик"
[toshiba климатик]
"климатици toshiba"
[климатици toshiba]
"климатик toshiba"
[климатик toshiba]
"тошиба климатик"
[тошиба климатик]
"климатици тошиба"
[климатици тошиба]
```

---

# Checklist when rebuilding in Ads UI

1. Create `Search-Categories` — Paused, €5/day, Pleven 110 km, Bulgarian, Search only.
2. Create all 9 category ad groups + keywords + RSAs + LPs.
3. Add campaign brand negatives + shared negatives + sitelinks + call asset.
4. Create `Search-Brands` — same geo/budget/language settings.
5. Create all 7 brand ad groups + keywords + RSAs + cross-brand negatives.
6. Verify location is **radius only** (no Bulgaria-wide).
7. Leave both **Paused** until you review.
8. Do **not** enable Broad match, Display, or Search partners via recommendations.

---

# Partial state already in account (before passkey block)

| Item | Status |
|---|---|
| Campaign `Search-Categories` ID `24209549661` | Created, **Paused** |
| Ad group still named `Ad group 1` | Has Inverter keywords |
| Inverter RSA | Filled in editor; **Save blocked by passkey** |
| Search-Brands | **Not created yet** |
| Shared negatives / sitelinks full setup | Incomplete |

When passkey works again, either finish the draft campaign or delete incomplete `Search-Categories` and rebuild from this file cleanly.

---

*Source of truth: approved plan “Ozon3 Search: Categories + Brands (Плевен + 110 км)” + Toshiba add-on. No site/code changes.*
