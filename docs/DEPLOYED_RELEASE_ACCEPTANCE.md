# Приёмка реального развёртывания consumer-web

## Контроль версии

GitHub CI проверяет **28 тем, 145 ситуаций, 71 вид документа и 243 связи**. Точный SHA выпуска определяется по итоговому коммиту ветки `infra/coolify-russian-vps` после прохождения четырёх обязательных проверок. Успешный CI **не подтверждает**, что этот коммит запущен в Coolify.

Coolify предоставляет `SOURCE_COMMIT` как предопределённую переменную в контейнере. Она не является секретом. На уже работающем контейнере откройте **Coolify → consumer-rights-portal → production → consumer-web → Terminal**, выберите контейнер и выполните:

```sh
node -e "console.log('Coolify SOURCE_COMMIT:',process.env.SOURCE_COMMIT||'unknown');console.log('Branch:',process.env.COOLIFY_BRANCH||'unknown')"
```

Ожидаемый коммит: **последний успешно проверенный SHA рабочей ветки на момент разрешённого Deploy**. Запишите его перед развёртыванием и сравните с `SOURCE_COMMIT` после него. Если переменная недоступна, сопоставьте SHA в **Deployments** Coolify и проверьте содержимое новых маршрутов. Не выводите все переменные окружения: там могут быть секреты.

## После установки нового endpoint /api/health

`GET /api/health` отвечает HTTP 200 при работоспособном процессе, с `Cache-Control: no-store`, сообщает `sourceCommit` из `SOURCE_COMMIT` и счётчики контента:

- `content.topics` — 28.
- `content.situations` — 145.
- `content.documents` — 71.
- `content.situationDocumentChoices` — 243.
- `content.news` — 5.

Если `sourceCommit` равен `null`, endpoint **не подтверждает версию**. Если `deployment` равен `reported`, это сведения Coolify о текущем контейнере, а не цифровая подпись сборки. Сравнивайте с SHA успешного выпуска из GitHub. Счётчики позволяют обнаруживать устаревшее содержимое, но не подменяют проверку точного коммита.

## HTTP-проверка действующего контейнера

Из Terminal *работающего контейнера* можно проверить страницы без установки пакетов:

```sh
node -e "(async()=>{const paths=['/api/health','/','/situacii/zhkh','/razbor/zhkh-11','/razbor/banki-strahovanie-7','/razbor/medicina-6','/razbor/marketpleysy-5','/razbor/transport-7','/razbor/turizm-gostinicy-6','/razbor/avtomobili-5','/razbor/podpiski-cifrovye-5','/razbor/obrazovanie-6','/razbor/produkty-pitanie-7','/dokumenty/zhaloba-gzhi','/dokumenty/zayavlenie-rastorzhenie-svyaz','/robots.txt'];let fail=0;for(const path of paths){try{const r=await fetch('http://127.0.0.1:3000'+path,{signal:AbortSignal.timeout(6000)});const tag=r.headers.get('x-robots-tag')||'';const ok=r.status===200&&/noindex/i.test(tag);console.log(ok?'OK':'FAIL',r.status,path,'robots:',tag||'-');if(!ok)fail++;}catch(e){console.log('ERROR',path,e.message);fail++;}}console.log('SOURCE_COMMIT',process.env.SOURCE_COMMIT||'unknown','FAILED',fail);process.exitCode=fail?1:0})()"
```

Успех: 16 ответов 200, каждый с `noindex`, идентификатор коммита соответствует ожидаемому. Это выборочно проверяет страницы и защиту индексации, но **не** клиентскую генерацию файлов. Полный smoke для всех 145 ситуаций, 71 документа, 28 каталогов, межстраничных ссылок и генераторов выполняется в GitHub CI до Deploy.

## Генераторы и безопасность

Проверьте в браузере на реальном адресе: один маршрут по ЖКХ и один по финансовым услугам, заполнение вымышленными тестовыми данными, скачивание DOCX, сохранение PDF через печать и кнопку проверки юристом. Кнопка проверки должна сообщать, что приём заявок не подключён, пока нет HTTPS и реального защищённого обработчика.

Не включайте индексацию, `SITE_CUTOVER`, `SITE_RELEASE_APPROVED`, сторонние секреты или Auto Deploy при выполнении этой приёмки. **После deploy обязательно**: сравните SHA с GitHub, проверьте `/api/health` (28/145/71/243), работоспособность нового культурного маршрута `/razbor/kulturnye-meropriyatiya-4`, финансового `/razbor/banki-strahovanie-4`, платформы `/razbor/marketpleysy-4`, ДДУ `/razbor/dolevoe-stroitelstvo-1`, скачивание DOCX и сохранение через печать PDF. Отдельная индивидуальная юридическая приёмка пользовательских фактов остаётся необходимой.

Официальная документация Coolify по SOURCE_COMMIT: https://coolify.io/docs/applications/configuration/environment-variables
