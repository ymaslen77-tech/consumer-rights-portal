# consumer-web — восстановление очереди Coolify и сетевых сборок (27.11.2026)

## Источник наблюдения и пределы проверки

Скриншот владельца: Coolify, consumer-rights-portal / production / consumer-web, **Running**. Два новых ручных Deploy отображаются как \`HEAD\`, **Queued / Waiting**, \`No logs yet\`. В верхней панели индикатор **4** ожидающих/выполняемых операций. **Queued — не ошибка Node, GitHub, npm или Dockerfile**: задача ещё не передана сборочному процессу.

Более ранние логи по двум попыткам этого же приложения:
- \`FROM node:22-bookworm-slim\`: ошибка \`DeadlineExceeded\` на \`registry-1.docker.io\` при получении метаданных образа;
- \`npm install -g pnpm@10.0.0\`: \`ETIMEDOUT\` на \`registry.npmjs.org/pnpm\`.

Это **две разные ступени** сбоя: (1) очередь обработчика Coolify; (2) сеть к публичным реестрам в Docker build. Исправление Dockerfile влияет только на ступень 2. Никакая GitHub CI-проверка не доказывает, что живая очередь обработана и сеть VPS исправна.

## Безопасная последовательность диагностики

1. **Не нажимать Redeploy снова, пока есть ожидающие задачи.** Открыть индикатор активных Deploy в панели Coolify и проверить, какое приложение и задание держит очередь. Просмотреть логи наиболее старого In progress. Не отменять задачи других приложений без согласования.
2. Если в **самом consumer-web** есть несколько дубликатов Queued, после сверки, что они ещё не начали обновлять контейнер, можно отменить только устаревшие дубликаты через **Cancel Deployment**. Не трогать успешно работающий контейнер consumer-web.
3. Посмотреть версию Coolify. На скриншоте ранее была **v4.7.6**. В **v4.7.7 (25.11.2026)** исправлена ситуация, когда остановившийся worker мог удерживать Deploy в состоянии in progress и блокировать последующие задачи до 24 часов; теперь Coolify признаёт такие задания неуспешными после тайм-аута Deployment + 10 минут. Официальное описание: https://coolify.io/docs/applications/deployments/overview и release notes https://github.com/coollabsio/coolify/releases/tag/v4.7.7 . **Планировать обновление глобального Coolify отдельно**: сделать резервную копию его данных и настроек, учесть влияние обновления панели на остальные проекты. Не запускать глобальный restart/reinstall ради одного сайта без диагностики и резервного копирования.
4. На VPS, **не в терминале контейнера consumer-web**, выполнить приведённые ниже команды только на чтение и **не публиковать секреты**, которые могут встретиться в логах.
5. Если ожидающая задача не сдвигается, а исправление/обновление Coolify нельзя провести безопасно, работать с логами работоспособности workers, а не изменять \`package.json\` или DNS домена.

### Диагностика VPS (без изменения состояния)

\`\`\`bash
printf '\\n=== Coolify и Docker: состояния ===\\n'
docker ps --format 'table {{.Names}}\\t{{.Status}}' | grep -Ei 'NAMES|coolify' || true

printf '\\n=== Queue worker / Horizon ===\\n'
docker exec coolify php artisan horizon:status 2>&1 || true

printf '\\n=== Ресурсы сервера ===\\n'
free -h
df -h /
docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}'

printf '\\n=== Только последние сообщения worker ===\\n'
docker logs --tail 150 coolify 2>&1 | grep -Ei 'horizon|queue|worker|deployment|timeout|exception' | tail -45 || true

printf '\\n=== Registry DNS, IPv4 ===\\n'
getent ahostsv4 registry-1.docker.io | head -3
getent ahostsv4 registry.npmjs.org | head -3

printf '\\n=== Реестр npm, IPv4 ===\\n'
curl -4 -sS -o /dev/null -w 'npm: HTTP %{http_code}, %{time_total}s\\n' --connect-timeout 10 --max-time 25 https://registry.npmjs.org/pnpm

printf '\\n=== Docker Hub, IPv4 ===\\n'
curl -4 -sS -o /dev/null -w 'Docker Hub: HTTP %{http_code}, %{time_total}s\\n' --connect-timeout 10 --max-time 25 https://registry-1.docker.io/v2/
\`\`\`

\`npm: HTTP 200\` означает, что metadata Registry доступна. \`Docker Hub: HTTP 401\` означает нормальный ответ registry без авторизации. Если VPS отвечает, а сборочный контейнер — нет, проверять Docker/BuildKit network отдельно: проверка curl на хосте **не равна** проверке из Docker.

### Что скорректировано для следующих сборок

- \`Dockerfile.coolify\` добавляет **isolated BuildKit cache** \`consumer-rights-npm-cache\` для \`npm install -g pnpm@10.0.0\` (раньше этот этап не имел отдельного сохраняемого npm cache).
- \`npm\` получает четыре повторные попытки загрузки, ограниченные интервалы, режим prefer-offline и предел времени установки.
- \`pnpm install\` получает четыре попытки вместо одной, меньшую конкуренцию сетевых запросов и более разумный тайм-аут, сохраняя project-specific cache.
- Эта настройка не переходит на другие проекты VPS, не включает публичную индексацию, не меняет переменные окружения, секреты и версии Node/pnpm. **Она не делает сборку возможной без работоспособного DNS и HTTPS-доступа к внешним Registry.**

## Перед новым ручным Deploy

- Отсутствуют зависшие/дублированные задачи **именно consumer-web**, queue worker выполняет новые задания, ресурсы сервера достаточны.
- Прошли четыре required CI на **точном merge SHA** рабочей ветки \`infra/coolify-russian-vps\`.
- Выбрать обычный Redeploy **с кешем**, не \`Redeploy (without cache)\`: последняя операция принудительно игнорирует Docker BuildKit layer cache, что хуже при нестабильной сети.
- После Deploy сравнить SHA \`SOURCE_COMMIT\`, \`/api/health\` и структуру 28/145/71/243, убедиться в \`noindex\`, работе DOCX/PDF и доступности HTTPS.
- В случае нового \`DeadlineExceeded\` или \`ETIMEDOUT\` собрать **первую** ошибку из нового лога и диагностику выше. Не отключать TLS, не добавлять публичные mirror без проверки доверия, не перезапускать Docker/Proxy на общем VPS.

*Документация Coolify*: https://coolify.io/docs/core/build-deployment-model ; https://coolify.io/docs/applications/deployments/overview .
