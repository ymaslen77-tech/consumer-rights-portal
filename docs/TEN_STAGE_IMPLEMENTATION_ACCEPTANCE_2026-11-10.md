# Приёмка десяти этапов наполнения портала — 10 ноября 2026

## Статус

В ветке `feature/culture-events-legal-routes-20261110` подготовлено **28 тем, 145 ситуаций, 71 тип документа, 243 сочетания «ситуация — документ»**. От прежнего объёма 20/101/46 это +8 новых тем, +44 ситуационных маршрута и +25 типов документов.

Эти количества относятся к **исходному коду отдельной ветки** до объединения, обязательных проверок CI и ручного обновления Coolify. Наличие шаблона не гарантирует его пригодности к конкретному спору. Правовой статус 44 новых маршрутов: `sector_sources_checked_individual_facts_required_2026-11-10` — отраслевые источники сверены, индивидуальные факты и применимость права нужно проверить.

## Исполненные блоки и основные источники

| Этап | Направление | Добавлено ситуаций | Источник |
|---|---|---:|---|
| 1 | Билеты, концерты, музеи | 4 | [Статья 52.1 Основ законодательства о культуре, Правила № 1491, разъяснения Роспотребнадзора](https://www.consultant.ru/document/cons_doc_LAW_1870/d55b86da3738c083ec198a9f9a700bf326007607/) |
| 2 | Фитнес и спортивные услуги | 4 | [Правила № 129, статья 32 Закона № 2300-1, Роспотребнадзор 2026](https://zpp.rospotrebnadzor.ru/news/federal/576800) |
| 3 | Заказная мебель и кухни | 4 | [Статьи 27–29 Закона № 2300-1, Правила № 1514, Роспотребнадзор 2026](https://zpp.rospotrebnadzor.ru/news/federal/576015) |
| 4 | Салоны красоты | 4 | [Статьи 28–32 Закона № 2300-1, Правила № 1514; медицинские услуги отдельно](https://zpp.rospotrebnadzor.ru/news/federal/573688) |
| 5 | Долевое строительство | 4 | [Закон № 214-ФЗ, статьи 6–8; временные ограничения и редакции 2026 года требуют отдельной проверки](https://zpp.rospotrebnadzor.ru/news/federal/573466) |
| 6 | Платные юридические услуги | 4 | [Закон № 2300-1, статьи 28, 29, 32; ГК РФ статья 782; Роспотребнадзор](https://zpp.rospotrebnadzor.ru/news/federal/576625) |
| 7 | Риелторские услуги | 4 | [Закон № 2300-1, статьи 16, 28–32; ГК РФ статья 782; Роспотребнадзор](https://zpp.rospotrebnadzor.ru/news/federal/594367) |
| 8 | Такси и службы заказа | 4 | [Закон № 580-ФЗ, Устав № 259-ФЗ, Правила Минтранса № 161 с 01.09.2026](https://www.consultant.ru/document/cons_doc_LAW_535865/) |
| 9 | Торговля, ЖКХ и связь | 6 | [Закон № 2300-1, Правила № 657, ЖК РФ и Правила № 354, Закон № 126-ФЗ](https://zpp.rospotrebnadzor.ru/news/federal/593901) |
| 10 | Финансы, медицина и туризм | 6 | [Закон № 353-ФЗ, медицинские Правила № 659, закон № 132-ФЗ и Правила № 551](https://www.cbr.ru/protection_rights/behavioral_surveillance/ko_cases/ko_cases_28/) |

## Правовой стандарт

1. **Текст закона**: устанавливать действующую редакцию на дату правоотношения; проверять специальные ограничения, исключения и отраслевое регулирование.
2. **Независимое подтверждение**: по возможности использовать законодательный первоисточник, специальный нормативный акт и отдельное разъяснение профильного органа. Несколько заголовков ссылок на один закон не являются независимой правовой проверкой.
3. **Необязательные факты**: не утверждать без подтверждения причинение вреда, незаконность комиссии, отсутствие лицензии, ответственность организации, срок или размер неустойки.
4. **Адресат**: исполнителю направляется требование; компетентному надзору — жалоба; суду — иск. Риелтор, туроператор, турагент, площадка, УК, региональный оператор и поставщик связи могут быть разными должниками.
5. **Документы**: `documents.json` содержит индивидуальные `recipient`, `legalBasis`, `requestHint`, `scope`; `DocumentBuilder.tsx` — отдельное примерное требование для каждого из 25 новых типов и тематические поля формы. Текст формального документа не включает служебный список ссылок.
6. **Консультация**: на страницах остаётся существующий виджет запроса консультации и кнопка проверки документов; передача данных на небезопасном HTTP запрещена.
7. **Публикация**: обязательны content-checks, web-checks, docker-build-check, approval-policy и отдельный ручной Redeploy. До этих проверок ветка не подлежит слиянию.

## 44 новых маршрута: документы и источники
| Маршрут | Первый генератор | Правовая база и дополнительные подтверждения |
|---|---|---|
| `kulturnye-meropriyatiya-1` | `zayavlenie-vozvrat-otmena-meropriyatiya` | [1](https://www.consultant.ru/document/cons_doc_LAW_1870/d55b86da3738c083ec198a9f9a700bf326007607/) [2](https://zpp.rospotrebnadzor.ru/news/federal/594003) [3](https://zpp.rospotrebnadzor.ru/news/federal/573826) |
| `kulturnye-meropriyatiya-2` | `zayavlenie-vozvrat-otmena-meropriyatiya` | [1](https://www.consultant.ru/document/cons_doc_LAW_1870/d55b86da3738c083ec198a9f9a700bf326007607/) [2](https://zpp.rospotrebnadzor.ru/news/federal/573826) [3](https://zpp.rospotrebnadzor.ru/news/federal/594003) |
| `kulturnye-meropriyatiya-3` | `zayavlenie-vozvrat-bileta-po-otkazu` | [1](https://www.consultant.ru/document/cons_doc_LAW_1870/d55b86da3738c083ec198a9f9a700bf326007607/) [2](https://base.garant.ru/74672542/) [3](https://zpp.rospotrebnadzor.ru/news/federal/594003) |
| `kulturnye-meropriyatiya-4` | `zayavlenie-vozvrat-bileta-bolezn` | [1](https://www.consultant.ru/document/cons_doc_LAW_1870/d55b86da3738c083ec198a9f9a700bf326007607/) [2](https://base.garant.ru/74672542/) [3](https://zpp.rospotrebnadzor.ru/news/federal/570955) |
| `fitnes-sport-1` | `zayavlenie-otkaz-fitnes` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://base.garant.ru/406291477/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576800) |
| `fitnes-sport-2` | `pretenziya-neokazanny-fitnes` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://base.garant.ru/406291477/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576800) |
| `fitnes-sport-3` | `pretenziya-neokazanny-fitnes` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://base.garant.ru/406291477/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576800) |
| `fitnes-sport-4` | `zayavlenie-otkaz-fitnes` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://base.garant.ru/406291477/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576800) |
| `mebel-na-zakaz-1` | `pretenziya-srok-izgotovleniya-mebeli` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576015) [4](https://zpp.rospotrebnadzor.ru/news/federal/572987) |
| `mebel-na-zakaz-2` | `pretenziya-nedostatki-mebeli` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576015) [4](https://zpp.rospotrebnadzor.ru/news/federal/572987) |
| `mebel-na-zakaz-3` | `pretenziya-nedostatki-mebeli` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576015) [4](https://zpp.rospotrebnadzor.ru/news/federal/572987) |
| `mebel-na-zakaz-4` | `pretenziya-nedostatki-mebeli` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576015) [4](https://zpp.rospotrebnadzor.ru/news/federal/572987) |
| `salony-krasoty-1` | `pretenziya-kachestvo-salon` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573688) [4](https://zpp.rospotrebnadzor.ru/news/regional/574651) [5](https://www.consultant.ru/document/cons_doc_LAW_121895/) |
| `salony-krasoty-2` | `pretenziya-kachestvo-salon` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573688) [4](https://zpp.rospotrebnadzor.ru/news/regional/574651) [5](https://www.consultant.ru/document/cons_doc_LAW_121895/) |
| `salony-krasoty-3` | `zayavlenie-otkaz-salon` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573688) [4](https://zpp.rospotrebnadzor.ru/news/regional/574651) [5](https://www.consultant.ru/document/cons_doc_LAW_121895/) |
| `salony-krasoty-4` | `pretenziya-kachestvo-salon` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_363382/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573688) [4](https://zpp.rospotrebnadzor.ru/news/regional/574651) [5](https://www.consultant.ru/document/cons_doc_LAW_121895/) |
| `dolevoe-stroitelstvo-1` | `uvedomlenie-prosrochka-ddu` | [1](https://www.consultant.ru/document/cons_doc_LAW_51038/) [2](https://www.consultant.ru/document/cons_doc_LAW_51038/aeb9f2327f835ecc02fb71b9a0312ead0b844204/) [3](https://www.consultant.ru/document/cons_doc_LAW_51038/817620cd3c49f19912fc1ac0f98b10d17f65b75b/) [4](https://zpp.rospotrebnadzor.ru/news/federal/573466) |
| `dolevoe-stroitelstvo-2` | `pretenziya-defekty-ddu` | [1](https://www.consultant.ru/document/cons_doc_LAW_51038/) [2](https://www.consultant.ru/document/cons_doc_LAW_51038/aeb9f2327f835ecc02fb71b9a0312ead0b844204/) [3](https://www.consultant.ru/document/cons_doc_LAW_51038/817620cd3c49f19912fc1ac0f98b10d17f65b75b/) [4](https://zpp.rospotrebnadzor.ru/news/federal/573466) |
| `dolevoe-stroitelstvo-3` | `zayavlenie-akt-osmotra-ddu` | [1](https://www.consultant.ru/document/cons_doc_LAW_51038/) [2](https://www.consultant.ru/document/cons_doc_LAW_51038/aeb9f2327f835ecc02fb71b9a0312ead0b844204/) [3](https://www.consultant.ru/document/cons_doc_LAW_51038/817620cd3c49f19912fc1ac0f98b10d17f65b75b/) [4](https://zpp.rospotrebnadzor.ru/news/federal/573466) |
| `dolevoe-stroitelstvo-4` | `pretenziya-defekty-ddu` | [1](https://www.consultant.ru/document/cons_doc_LAW_51038/) [2](https://www.consultant.ru/document/cons_doc_LAW_51038/aeb9f2327f835ecc02fb71b9a0312ead0b844204/) [3](https://www.consultant.ru/document/cons_doc_LAW_51038/817620cd3c49f19912fc1ac0f98b10d17f65b75b/) [4](https://zpp.rospotrebnadzor.ru/news/federal/573466) |
| `yuridicheskie-uslugi-1` | `pretenziya-neokazanny-urist` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576625) |
| `yuridicheskie-uslugi-2` | `pretenziya-neokazanny-urist` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576625) |
| `yuridicheskie-uslugi-3` | `zayavlenie-otkaz-urist` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576625) |
| `yuridicheskie-uslugi-4` | `pretenziya-neokazanny-urist` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/576625) |
| `rieltorskie-uslugi-1` | `pretenziya-rielter-neokazal` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/594367) |
| `rieltorskie-uslugi-2` | `zayavlenie-otkaz-rielter` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/594367) |
| `rieltorskie-uslugi-3` | `pretenziya-rielter-neokazal` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/594367) |
| `rieltorskie-uslugi-4` | `pretenziya-rielter-neokazal` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_9027/) [3](https://zpp.rospotrebnadzor.ru/news/federal/594367) |
| `taksi-agregatory-1` | `pretenziya-neokazannaya-poezdka` | [1](https://www.consultant.ru/document/cons_doc_LAW_436124/) [2](https://www.consultant.ru/document/cons_doc_LAW_535865/) [3](https://www.consultant.ru/document/cons_doc_LAW_72388/) [4](https://zpp.rospotrebnadzor.ru/news/federal/575598) |
| `taksi-agregatory-2` | `pretenziya-spornaya-summa-taksi` | [1](https://www.consultant.ru/document/cons_doc_LAW_436124/) [2](https://www.consultant.ru/document/cons_doc_LAW_535865/) [3](https://www.consultant.ru/document/cons_doc_LAW_72388/) [4](https://zpp.rospotrebnadzor.ru/news/federal/575598) |
| `taksi-agregatory-3` | `pretenziya-spornaya-summa-taksi` | [1](https://www.consultant.ru/document/cons_doc_LAW_436124/) [2](https://www.consultant.ru/document/cons_doc_LAW_535865/) [3](https://www.consultant.ru/document/cons_doc_LAW_72388/) [4](https://zpp.rospotrebnadzor.ru/news/federal/575598) |
| `taksi-agregatory-4` | `pretenziya-spornaya-summa-taksi` | [1](https://www.consultant.ru/document/cons_doc_LAW_436124/) [2](https://www.consultant.ru/document/cons_doc_LAW_535865/) [3](https://www.consultant.ru/document/cons_doc_LAW_72388/) [4](https://zpp.rospotrebnadzor.ru/news/federal/575598) |
| `tehnicheski-slozhnye-4` | `pretenziya-povtornyy-defekt` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_535649/) [3](https://zpp.rospotrebnadzor.ru/Core/Content/ShowContentById/575311) |
| `garantiya-servis-4` | `trebovanie-podmenny-tovar` | [1](https://www.consultant.ru/document/cons_doc_LAW_305/) [2](https://www.consultant.ru/document/cons_doc_LAW_535649/) [3](https://zpp.rospotrebnadzor.ru/news/federal/593901) |
| `zhkh-12` | `zayavlenie-proverka-kachestva-zhkh` | [1](https://www.consultant.ru/document/cons_doc_LAW_114247/) [2](https://www.consultant.ru/document/cons_doc_LAW_51057/) [3](https://zpp.rospotrebnadzor.ru/news/federal/531774) |
| `zhkh-13` | `zayavlenie-elektro-ushcherb` | [1](https://www.consultant.ru/document/cons_doc_LAW_114247/) [2](https://www.consultant.ru/document/cons_doc_LAW_51057/) [3](https://zpp.rospotrebnadzor.ru/news/regional/570251) |
| `zhkh-14` | `zayavlenie-proverka-kachestva-zhkh` | [1](https://www.consultant.ru/document/cons_doc_LAW_114247/) [2](https://www.consultant.ru/document/cons_doc_LAW_114247/e7e2bf71a6bbcc95b41bd0d1eaa94be371c57c8c/) [3](https://www.consultant.ru/document/cons_doc_LAW_546936/) |
| `svyaz-internet-6` | `pretenziya-dopuslugi-svyaz` | [1](https://www.consultant.ru/document/cons_doc_LAW_43224/) [2](https://www.consultant.ru/document/cons_doc_LAW_305/) [3](https://zpp.rospotrebnadzor.ru/news/federal/557732) [4](https://zpp.rospotrebnadzor.ru/news/regional/593931) |
| `banki-strahovanie-8` | `pretenziya-dosrochnoe-pogashenie` | [1](https://www.consultant.ru/document/cons_doc_LAW_155986/) [2](https://www.cbr.ru/protection_rights/behavioral_surveillance/ko_cases/ko_cases_28/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573098) |
| `banki-strahovanie-9` | `pretenziya-dosrochnoe-pogashenie` | [1](https://www.consultant.ru/document/cons_doc_LAW_155986/) [2](https://www.cbr.ru/protection_rights/behavioral_surveillance/ko_cases/ko_cases_28/) [3](https://zpp.rospotrebnadzor.ru/news/federal/573098) |
| `medicina-7` | `zapros-soglasie-smeta-med` | [1](https://www.consultant.ru/document/cons_doc_LAW_121895/) [2](https://www.consultant.ru/document/cons_doc_LAW_121895/0b1cadf39ebeb0f1fed2ef0b8ebab5973197d7f1/) [3](https://www.consultant.ru/document/cons_doc_LAW_535622/) [4](https://zpp.rospotrebnadzor.ru/news/federal/593682) |
| `medicina-8` | `zapros-soglasie-smeta-med` | [1](https://www.consultant.ru/document/cons_doc_LAW_535622/) [2](https://zpp.rospotrebnadzor.ru/news/federal/593682) [3](https://www.consultant.ru/document/cons_doc_LAW_305/) [4](https://www.consultant.ru/document/cons_doc_LAW_121895/) |
| `turizm-gostinicy-7` | `zapros-turagent-turoperator` | [1](https://www.consultant.ru/document/cons_doc_LAW_12462/) [2](https://www.consultant.ru/document/cons_doc_LAW_534242/) [3](https://zpp.rospotrebnadzor.ru/news/federal/593887) |
| `turizm-gostinicy-8` | `pretenziya-turprodukt` | [1](https://www.consultant.ru/document/cons_doc_LAW_12462/) [2](https://www.consultant.ru/document/cons_doc_LAW_534242/) [3](https://zpp.rospotrebnadzor.ru/news/federal/593887) [4](https://zpp.rospotrebnadzor.ru/news/federal/574260) |

## Примечания и ограничения

Уточнены пересекавшиеся старые случаи про повреждение автомобиля, дополнительные работы подрядчика и изменение образовательной программы. Удаления старых URL не проводилось, чтобы не разрушать ссылки и существующие маршруты.

Не оформлено правовое заключение о каждой конкретной неустойке, судебной перспективе, наличии дефекта, размере страховой выплаты или праве на полный возврат. Эти обстоятельства устанавливаются индивидуально. Особенно осторожно: ДДУ и специальные временные меры 2026 года; медицинские согласия и лицензирование; исключения из подмены товара; возврат билетов по болезни; обязанности платформ, агрегаторов и посредников.

Документы не обещают автоматического расчёта денежной санкции. Проверки документов на синтаксис, формирование DOCX и PDF и отсутствие технической информации описаны в CI. Запуск CI должен быть подтверждён отдельно.
