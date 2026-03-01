export const SUPPORTED_LOCALES = ["en", "uk"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const translations: Record<SupportedLocale, Record<string, string>> = {
  en: {
    "app.modes.board": "Inbox ({{count}})",
    "app.modes.engage": "Engage",
    "app.modes.projects": "Projects",
    "app.modes.review": "Weekly Review",
    "app.modes.aria": "Work mode switcher",
    "app.contexts.all": "All contexts",
    "app.contexts.unknown": "Unknown context",
    "app.warning.dismiss": "Dismiss",
    "app.inbox.label": "Inbox",

    "header.quickCapturePlaceholder": "Quick capture to Inbox from any mode...",
    "header.quickCaptureAria": "Quick capture item to Inbox",
    "header.quickCaptureSubmit": "+ Inbox",
    "header.openSettings": "Open settings",
    "header.settingsTitle": "Settings",
    "header.openGuide": "Guide",
    "header.settings.heading": "Settings",
    "header.settings.description": "Backup and local data management.",
    "header.settings.copyBackup": "Copy backup",
    "header.settings.pasteBackup": "Paste backup",
    "header.settings.resetData": "Reset local data",
    "header.settings.close": "Close",
    "header.settings.backupPrompt": "Paste encrypted backup state:",
    "header.settings.resetConfirm":
      "Reset local board data? This will remove all custom columns and tasks.",
    "header.locale.label": "Language",
    "header.locale.en": "EN",
    "header.locale.uk": "UK",
    "header.auth.section": "Cloud account",
    "header.auth.signInGoogle": "Sign in with Google",
    "header.auth.signOut": "Sign out",
    "header.auth.signedInAs": "Signed in as {{user}}",
    "header.auth.disabled": "Cloud sync is disabled by feature flag.",
    "header.auth.error": "Authentication error. Please try again.",
    "header.sync.signedOut": "Sync status: signed out",
    "header.sync.synced": "Sync status: synced",
    "header.sync.syncing": "Sync status: syncing",
    "header.sync.reconnecting": "Sync status: reconnecting",
    "header.sync.catchingUp": "Sync status: catching up",
    "header.sync.recovered": "Sync status: recovered",
    "header.sync.needsResync": "Sync status: needs resync",
    "header.sync.offline": "Sync status: offline",
    "header.sync.error": "Sync status: error",
    "header.sync.disabled": "Sync status: disabled",
    "header.sync.needsAttention": "Sync status: choose merge strategy",

    "board.empty": "Empty",
    "board.filterByContextAria": "Filter next actions by context",
    "board.contexts.title": "Contexts",
    "board.contexts.create": "+ Context",
    "board.contexts.edit": "Edit",
    "board.contexts.delete": "Delete",
    "board.contexts.createPrompt": "Context name (for example, @office):",
    "board.contexts.createDescriptionPrompt": "Context description (optional):",
    "board.contexts.createError":
      "Unable to create context. Check name and uniqueness.",
    "board.contexts.editPrompt": "New context name:",
    "board.contexts.editDescriptionPrompt": "Context description:",
    "board.contexts.editError":
      "Unable to update context. Check name and uniqueness.",
    "board.contexts.deleteConfirm":
      'Delete context "{{name}}"? Linked next actions will be moved to another context.',
    "board.contexts.deleteError": "Cannot delete the last context.",

    "nextAction.empty.title": "No active actions",
    "nextAction.empty.description":
      "There are no active next actions in {{contextLabel}} yet.",
    "nextAction.done": "Done",
    "nextAction.unknownContext": "Unknown context",

    "task.status.todo": "To do",
    "task.status.in_progress": "In progress",
    "task.status.waiting": "Waiting",
    "task.status.done": "Done",
    "task.status.obsolete": "Obsolete",
    "task.createdAtInvalid": "Created recently",
    "task.createdAt": "Created {{date}}",
    "task.waitingFromTo": "Waiting from: {{who}} until {{deadline}}",
    "task.waitingPromptWho": "Who are we waiting for?",
    "task.waitingPromptDeadline": "Waiting deadline (for example, 2026-03-10):",
    "task.clarify": "Clarify",
    "task.delete": "Delete",
    "task.changeStatusAria": "Change task status",
    "task.moveAria": "Move task to another column",
    "task.clarifyAria": "Clarify item {{title}}",

    "guide.aria": "GTD application guide",
    "guide.title": "Guide",
    "guide.intro":
      "This app follows GTD (Getting Things Done): first capture an idea, then clarify what it means, and only then execute.",
    "guide.capture.title": "1) Capture - Inbox",
    "guide.capture.body":
      "In Inbox mode, write incoming thoughts as they are. Do not think about priority and deadlines during capture.",
    "guide.clarify.title": "2) Clarify - Clarify button",
    "guide.clarify.body":
      "For each Inbox item, run Clarify and answer two questions: is it actionable and is it one-step? Then it becomes Next Action, Project, Someday, or goes to Trash.",
    "guide.engage.title": "3) Engage - Engage mode",
    "guide.engage.body":
      "In Engage mode, pick actions by context (@computer, @phone, etc.) and mark completed steps with Done.",
    "guide.projects.title": "4) Projects - Projects mode",
    "guide.projects.body":
      "A project is a desired outcome that takes multiple steps. Keep at least one active Next Action for each active project.",
    "guide.review.title": "5) Weekly Review - Weekly Review mode",
    "guide.review.body":
      "Once a week, do a full review: clean Inbox, check projects, and capture focus for the next week.",
    "guide.quickStart.title": "Quick start (5 minutes)",
    "guide.quickStart.step1": "Add 3-5 incoming items to Inbox.",
    "guide.quickStart.step2": "Clarify each item.",
    "guide.quickStart.step3": "Open Engage and complete 1-2 Next Actions.",
    "guide.quickStart.step4":
      "Check Projects and fix items without a next step.",
    "guide.goInbox": "Go to Inbox",
    "guide.goEngage": "Go to Engage",

    "project.validation.invalidTitle": "Enter a valid project title.",
    "project.health.missing": "Missing next action",
    "project.health.healthy": "Healthy",
    "project.view.title": "Project View",
    "project.metrics.active": "Active: {{count}}",
    "project.metrics.done": "Done: {{count}}",
    "project.metrics.missing": "Missing Next Action: {{count}}",
    "project.metrics.allActions": "All Next Actions: {{count}}",
    "project.createButton": "Create project",
    "project.createPlaceholder": "New project title",
    "project.create": "Create",
    "project.cancel": "Cancel",
    "project.empty":
      "No projects yet. Create your first project and add a Next Action.",
    "project.detail.description":
      "Project detail mode: edit, link, and manage actions.",
    "project.backToList": "Back to list",
    "project.stats.totalTasks": "Total actions: {{count}}",
    "project.stats.completed": "Completed: {{count}}",
    "project.stats.active": "Active: {{count}}",
    "project.stats.health": "Health: {{health}}",

    "project.card.error.updateTitle": "Failed to update project title.",
    "project.card.error.activateWithoutAction":
      "Cannot switch project to active without a Next Action.",
    "project.card.error.noContext":
      "Add at least one context to create a Next Action.",
    "project.card.error.addAction": "Failed to add Next Action.",
    "project.card.error.selectAction": "Select a Next Action to link.",
    "project.card.error.bindAction": "Failed to link Next Action.",
    "project.card.meta.unknownContext": "Unknown context",
    "project.card.unbind": "Unbind",
    "project.card.status": "Status",
    "project.card.saveTitle": "Save title",
    "project.card.editTitle": "Edit title",
    "project.card.quickAdd": "Quick Add Linked Next Action",
    "project.card.quickAddPlaceholder": "Describe next concrete step",
    "project.card.add": "Add",
    "project.card.bindExisting": "Link existing unlinked action...",
    "project.card.bind": "Link",

    "clarify.outcome.next_action": "Next Action",
    "clarify.outcome.project": "Project",
    "clarify.outcome.someday": "Someday",
    "clarify.outcome.trash": "Trash",
    "clarify.error.needContext":
      "At least one context is required for Next Action.",
    "clarify.error.createNextAction":
      "Failed to create Next Action. Check input and retry.",
    "clarify.error.projectTitle": "Provide a project title.",
    "clarify.error.createProject":
      "Failed to create Project. Check input and retry.",
    "clarify.error.moveSomeday": "Failed to move item to Someday.",
    "clarify.error.moveTrash": "Failed to delete item from Inbox.",
    "clarify.title": "Clarify Wizard",
    "clarify.resultTitle": "Clarification result",
    "clarify.item": "Item: {{title}}",
    "clarify.actionable": "Is it actionable?",
    "clarify.oneStep": "Is it one-step?",
    "clarify.nonActionableDestination":
      "Where should this non-actionable item go?",
    "clarify.somedayNotes": "Notes for Someday (optional)",
    "clarify.someday": "Someday",
    "clarify.trash": "Trash",
    "clarify.nextActionTitle": "Next Action title",
    "clarify.context": "Context",
    "clarify.createNextAction": "Create Next Action",
    "clarify.projectTitle": "Project title",
    "clarify.notesOptional": "Notes (optional)",
    "clarify.createProject": "Create Project",
    "clarify.confirm":
      'Item "{{itemTitle}}" was processed as {{outcomeLabel}}.',
    "clarify.close": "Close",
    "clarify.cancel": "Cancel",
    "clarify.yes": "Yes",
    "clarify.no": "No",
    "clarify.back": "Back",

    "review.steps.emptyInbox.title": "Empty Inbox",
    "review.steps.emptyInbox.description":
      "Clarify all captured items and get inbox to zero.",
    "review.steps.checkProjects.title": "Check all Projects",
    "review.steps.checkProjects.description":
      "Review active outcomes and detect stale/problematic ones.",
    "review.steps.ensureNextAction.title":
      "Ensure every Project has Next Action",
    "review.steps.ensureNextAction.description":
      "Every active project must keep at least one active action.",
    "review.steps.waitingFor.title": "Review Waiting For",
    "review.steps.waitingFor.description":
      "Track delegated commitments and follow-up points.",
    "review.steps.cleanSomeday.title": "Clean Someday list",
    "review.steps.cleanSomeday.description":
      "Keep your non-committed ideas intentional.",
    "review.steps.closeLoops.title": "Close completed loops",
    "review.steps.closeLoops.description":
      "Close finished commitments and clear leftovers.",
    "review.steps.setIntention.title": "Set intention for next week",
    "review.steps.setIntention.description":
      "Capture your focus note for the coming week.",
    "review.inboxUnclarified": "Unclarified inbox items: {{count}}",
    "review.goInbox": "Go to Inbox",
    "review.projectsNeedAttention": "Projects requiring attention: {{count}}",
    "review.allProjectsHealthy": "All active projects look healthy.",
    "review.openProjectView": "Open Project View",
    "review.projectsWithoutAction":
      "Active projects without next action: {{count}}",
    "review.ruleSatisfied":
      "Rule satisfied: every active project has at least one next action.",
    "review.fixInProjects": "Fix in Projects",
    "review.waitingFollowUps": "Waiting follow-ups ready: {{count}}",
    "review.somedaySize": "Someday list size: {{count}}",
    "review.closedLoops":
      "Closed loops candidate: done actions {{actions}}, done projects {{projects}}.",
    "review.intentionLabel": "Intention note for next week",
    "review.intentionPlaceholder": "What should matter most next week?",
    "review.aria": "Weekly Review",
    "review.title": "Weekly Review",
    "review.startedAt": "Started: {{date}}",
    "review.startButton": "Start Weekly Review",
    "review.completedTitle": "Review Completed",
    "review.completedAt": "Completed at {{date}}",
    "review.snapshot":
      "Snapshot: inbox {{inbox}}, missing actions {{missing}}, waiting follow-ups {{waiting}}",
    "review.note": "Note: {{note}}",
    "review.noteFallback": "No intention note provided.",
    "review.stepIndicator": "Step {{current}} of {{total}}",
    "review.previous": "Previous",
    "review.next": "Next step",
    "review.complete": "Complete Weekly Review",
    "review.startHint":
      "Start review to walk through all 7 GTD steps and complete integrity checks before closing the week.",

    "stepper.aria": "Weekly review steps",
    "stepper.stepAria": "Step {{step}}: {{title}}",

    "ds.project.status.active": "Active",
    "ds.project.status.on_hold": "On hold",
    "ds.project.status.done": "Done",
    "ds.project.healthMissing": "Missing Next Action",
    "ds.project.statusLabel": "Status: {{status}}",
    "ds.project.linkedSection": "Linked Next Actions",
    "ds.project.noLinked": "No linked actions yet.",
    "ds.project.noContext": "No context",

    "state.projectInvariant":
      'Project "{{projectTitle}}" must keep at least one active Next Action.',
    "state.backup.copySuccess": "Encrypted backup copied to clipboard.",
    "state.backup.copyFail":
      "Unable to copy backup. Check clipboard permissions.",
    "state.backup.emptyInput": "Backup string is empty.",
    "state.backup.invalid": "Backup is corrupted or has unsupported format.",
    "state.backup.importSuccess": "Backup imported successfully.",
    "state.backup.decryptFail":
      "Unable to decrypt backup. Check backup string.",
    "sync.merge.prompt":
      "Cloud data differs from local data. Press OK to replace local data with cloud data. Press Cancel to merge local and cloud data.",
    "sync.error.init": "Unable to initialize cloud sync.",
    "sync.error.listen": "Cloud sync listener failed.",
    "sync.error.push": "Unable to upload local changes to cloud.",
    "sync.error.offline": "You are offline. Changes will sync when online.",
    "sync.error.resync":
      "Cloud sync history is inconsistent. Please force a cloud resync.",
    "state.context.customDescription": "Custom context",
    "state.review.error.inbox":
      "Cannot complete review: Inbox still has unclarified items. Run Clarify first.",
    "state.review.error.projects":
      "Cannot complete review: there are active projects without Next Action.",

    "pwa.offlineReady": "FlowAnchor Todo is ready for offline usage",
    "pwa.updateConfirm": "A new app version is available. Update now?",
    "column.create.title": "Create column",
    "column.create.placeholder": "For example: In Progress",
    "column.create.aria": "New column title",
    "column.create.button": "+ Create",
    "defaultContext.computer": "Digital work requiring a computer",
    "defaultContext.phone": "Calls and messages",
    "defaultContext.home": "Actions tied to home location",
    "defaultContext.deepWork": "Focused work requiring concentration",
    "defaultContext.fiveMin": "Quick actions that fit short windows",
  },
  uk: {
    "app.modes.board": "Вхідні ({{count}})",
    "app.modes.engage": "Виконання",
    "app.modes.projects": "Проєкти",
    "app.modes.review": "Щотижневий огляд",
    "app.modes.aria": "Перемикач режиму роботи",
    "app.contexts.all": "Усі контексти",
    "app.contexts.unknown": "Невідомий контекст",
    "app.warning.dismiss": "Закрити",
    "app.inbox.label": "Вхідні",

    "header.quickCapturePlaceholder":
      "Швидке додавання у Вхідні з будь-якого режиму...",
    "header.quickCaptureAria": "Швидко додати елемент у Вхідні",
    "header.quickCaptureSubmit": "+ Вхідні",
    "header.openSettings": "Відкрити налаштування",
    "header.settingsTitle": "Налаштування",
    "header.openGuide": "Довідник",
    "header.settings.heading": "Налаштування",
    "header.settings.description":
      "Керування резервними копіями та локальними даними.",
    "header.settings.copyBackup": "Скопіювати резервну копію",
    "header.settings.pasteBackup": "Вставити резервну копію",
    "header.settings.resetData": "Скинути локальні дані",
    "header.settings.close": "Закрити",
    "header.settings.backupPrompt":
      "Вставте зашифрований стан резервної копії:",
    "header.settings.resetConfirm":
      "Скинути локальні дані дошки? Це видалить усі користувацькі колонки й завдання.",
    "header.locale.label": "Мова",
    "header.locale.en": "EN",
    "header.locale.uk": "UK",
    "header.auth.section": "Хмарний акаунт",
    "header.auth.signInGoogle": "Увійти через Google",
    "header.auth.signOut": "Вийти",
    "header.auth.signedInAs": "Вхід виконано як {{user}}",
    "header.auth.disabled": "Хмарну синхронізацію вимкнено через feature flag.",
    "header.auth.error": "Помилка авторизації. Спробуйте ще раз.",
    "header.sync.signedOut": "Стан синхронізації: не авторизовано",
    "header.sync.synced": "Стан синхронізації: синхронізовано",
    "header.sync.syncing": "Стан синхронізації: синхронізація",
    "header.sync.reconnecting": "Стан синхронізації: повторне підключення",
    "header.sync.catchingUp": "Стан синхронізації: наздоганяємо зміни",
    "header.sync.recovered": "Стан синхронізації: відновлено",
    "header.sync.needsResync":
      "Стан синхронізації: потрібна повна ресинхронізація",
    "header.sync.offline": "Стан синхронізації: офлайн",
    "header.sync.error": "Стан синхронізації: помилка",
    "header.sync.disabled": "Стан синхронізації: вимкнено",
    "header.sync.needsAttention":
      "Стан синхронізації: оберіть стратегію злиття",

    "board.empty": "Порожньо",
    "board.filterByContextAria": "Фільтр наступних дій за контекстом",
    "board.contexts.title": "Контексти",
    "board.contexts.create": "+ Контекст",
    "board.contexts.edit": "Змінити",
    "board.contexts.delete": "Видалити",
    "board.contexts.createPrompt": "Назва контексту (наприклад, @office):",
    "board.contexts.createDescriptionPrompt": "Опис контексту (необов'язково):",
    "board.contexts.createError":
      "Не вдалося створити контекст. Перевірте назву та унікальність.",
    "board.contexts.editPrompt": "Нова назва контексту:",
    "board.contexts.editDescriptionPrompt": "Опис контексту:",
    "board.contexts.editError":
      "Не вдалося оновити контекст. Перевірте назву та унікальність.",
    "board.contexts.deleteConfirm":
      'Видалити контекст "{{name}}"? Пов\'язані наступні дії буде перенесено в інший контекст.',
    "board.contexts.deleteError": "Не можна видалити останній контекст.",

    "nextAction.empty.title": "Немає активних дій",
    "nextAction.empty.description":
      "У контексті {{contextLabel}} поки немає активних наступних дій.",
    "nextAction.done": "Готово",
    "nextAction.unknownContext": "Невідомий контекст",

    "task.status.todo": "До виконання",
    "task.status.in_progress": "У процесі",
    "task.status.waiting": "Очікує",
    "task.status.done": "Готово",
    "task.status.obsolete": "Неактуально",
    "task.createdAtInvalid": "Створено нещодавно",
    "task.createdAt": "Створено {{date}}",
    "task.waitingFromTo": "Очікуємо від: {{who}} до {{deadline}}",
    "task.waitingPromptWho": "Від кого очікуємо?",
    "task.waitingPromptDeadline":
      "Крайній термін очікування (наприклад, 2026-03-10):",
    "task.clarify": "Уточнити",
    "task.delete": "Видалити",
    "task.changeStatusAria": "Змінити статус завдання",
    "task.moveAria": "Перемістити завдання в іншу колонку",
    "task.clarifyAria": "Уточнити елемент {{title}}",

    "guide.aria": "Довідник застосунку GTD",
    "guide.title": "Довідник",
    "guide.intro":
      "Цей застосунок побудований на GTD (Getting Things Done): спочатку зафіксуйте думку, потім уточніть, що вона означає, і лише після цього виконуйте.",
    "guide.capture.title": "1) Збір - Вхідні",
    "guide.capture.body":
      "У режимі Вхідних записуйте всі думки як є. Під час збору не думайте про пріоритети чи дедлайни.",
    "guide.clarify.title": "2) Уточнення - кнопка Уточнити",
    "guide.clarify.body":
      "Для кожного елемента з Вхідних запустіть уточнення та дайте відповідь на два питання: це дієвий елемент і це один крок? Після цього елемент стане наступною дією, проєктом, списком Колись/можливо або буде видалений.",
    "guide.engage.title": "3) Виконання - режим Виконання",
    "guide.engage.body":
      "У режимі Виконання обирайте дії за контекстом (@computer, @phone тощо) і позначайте завершені кроки як Готово.",
    "guide.projects.title": "4) Проєкти - режим Проєкти",
    "guide.projects.body":
      "Проєкт - це бажаний результат, який потребує кількох кроків. Подбайте, щоб у кожного активного проєкту була щонайменше одна активна наступна дія.",
    "guide.review.title": "5) Щотижневий огляд - режим Щотижневий огляд",
    "guide.review.body":
      "Раз на тиждень проводьте повний огляд: очистіть Вхідні, перевірте проєкти й зафіксуйте фокус на наступний тиждень.",
    "guide.quickStart.title": "Швидкий старт (5 хвилин)",
    "guide.quickStart.step1": "Додайте 3-5 вхідних елементів у Вхідні.",
    "guide.quickStart.step2": "Уточніть кожен елемент через Уточнити.",
    "guide.quickStart.step3":
      "Відкрийте Виконання та виконайте 1-2 наступні дії.",
    "guide.quickStart.step4":
      "Перевірте Проєкти й виправте елементи без наступного кроку.",
    "guide.goInbox": "Перейти до Вхідних",
    "guide.goEngage": "Перейти до Виконання",

    "project.validation.invalidTitle": "Введіть коректну назву проєкту.",
    "project.health.missing": "Немає наступної дії",
    "project.health.healthy": "У нормі",
    "project.view.title": "Режим проєктів",
    "project.metrics.active": "Активні: {{count}}",
    "project.metrics.done": "Завершені: {{count}}",
    "project.metrics.missing": "Без наступної дії: {{count}}",
    "project.metrics.allActions": "Усі наступні дії: {{count}}",
    "project.createButton": "Створити проєкт",
    "project.createPlaceholder": "Назва нового проєкту",
    "project.create": "Створити",
    "project.cancel": "Скасувати",
    "project.empty":
      "Проєктів поки немає. Створіть перший проєкт і додайте наступну дію.",
    "project.detail.description":
      "Детальний режим проєкту: редагування, прив'язка та керування діями.",
    "project.backToList": "Назад до списку",
    "project.stats.totalTasks": "Усього дій: {{count}}",
    "project.stats.completed": "Виконано: {{count}}",
    "project.stats.active": "Активних: {{count}}",
    "project.stats.health": "Стан: {{health}}",

    "project.card.error.updateTitle": "Не вдалося оновити назву проєкту.",
    "project.card.error.activateWithoutAction":
      "Не можна перевести проєкт в активний стан без наступної дії.",
    "project.card.error.noContext":
      "Додайте щонайменше один контекст, щоб створити наступну дію.",
    "project.card.error.addAction": "Не вдалося додати наступну дію.",
    "project.card.error.selectAction": "Оберіть наступну дію для прив'язки.",
    "project.card.error.bindAction": "Не вдалося прив'язати наступну дію.",
    "project.card.meta.unknownContext": "Невідомий контекст",
    "project.card.unbind": "Відв'язати",
    "project.card.status": "Статус",
    "project.card.saveTitle": "Зберегти назву",
    "project.card.editTitle": "Редагувати назву",
    "project.card.quickAdd": "Швидко додати прив'язану наступну дію",
    "project.card.quickAddPlaceholder": "Опишіть наступний конкретний крок",
    "project.card.add": "Додати",
    "project.card.bindExisting": "Прив'язати наявну неприв'язану дію...",
    "project.card.bind": "Прив'язати",

    "clarify.outcome.next_action": "Наступна дія",
    "clarify.outcome.project": "Проєкт",
    "clarify.outcome.someday": "Колись/можливо",
    "clarify.outcome.trash": "Смітник",
    "clarify.error.needContext":
      "Для наступної дії потрібен щонайменше один контекст.",
    "clarify.error.createNextAction":
      "Не вдалося створити наступну дію. Перевірте дані та спробуйте ще раз.",
    "clarify.error.projectTitle": "Вкажіть назву проєкту.",
    "clarify.error.createProject":
      "Не вдалося створити проєкт. Перевірте дані та спробуйте ще раз.",
    "clarify.error.moveSomeday":
      "Не вдалося перемістити елемент до списку Колись/можливо.",
    "clarify.error.moveTrash": "Не вдалося видалити елемент із Вхідних.",
    "clarify.title": "Майстер уточнення",
    "clarify.resultTitle": "Результат уточнення",
    "clarify.item": "Елемент: {{title}}",
    "clarify.actionable": "Це потребує дії?",
    "clarify.oneStep": "Це один крок?",
    "clarify.nonActionableDestination":
      "Куди перемістити елемент, що не потребує дії?",
    "clarify.somedayNotes": "Нотатки для Колись/можливо (необов'язково)",
    "clarify.someday": "Колись/можливо",
    "clarify.trash": "Смітник",
    "clarify.nextActionTitle": "Назва наступної дії",
    "clarify.context": "Контекст",
    "clarify.createNextAction": "Створити наступну дію",
    "clarify.projectTitle": "Назва проєкту",
    "clarify.notesOptional": "Нотатки (необов'язково)",
    "clarify.createProject": "Створити проєкт",
    "clarify.confirm":
      'Елемент "{{itemTitle}}" оброблено як "{{outcomeLabel}}".',
    "clarify.close": "Закрити",
    "clarify.cancel": "Скасувати",
    "clarify.yes": "Так",
    "clarify.no": "Ні",
    "clarify.back": "Назад",

    "review.steps.emptyInbox.title": "Очистити Вхідні",
    "review.steps.emptyInbox.description":
      "Уточніть усі зібрані елементи й доведіть Вхідні до нуля.",
    "review.steps.checkProjects.title": "Перевірити всі проєкти",
    "review.steps.checkProjects.description":
      "Перегляньте активні результати та знайдіть застарілі/проблемні.",
    "review.steps.ensureNextAction.title": "Кожен проєкт має наступну дію",
    "review.steps.ensureNextAction.description":
      "Кожен активний проєкт повинен мати щонайменше одну активну дію.",
    "review.steps.waitingFor.title": "Перегляд списку Очікування",
    "review.steps.waitingFor.description":
      "Відстежуйте делеговані зобов'язання та точки подальших дій.",
    "review.steps.cleanSomeday.title": "Очистити список Колись/можливо",
    "review.steps.cleanSomeday.description":
      "Тримайте ідеї без зобовʼязань усвідомленими.",
    "review.steps.closeLoops.title": "Закрити завершені цикли",
    "review.steps.closeLoops.description":
      "Закрийте завершені зобовʼязання та хвости.",
    "review.steps.setIntention.title": "Сформувати намір на наступний тиждень",
    "review.steps.setIntention.description":
      "Зафіксуйте фокус-нотатку на наступний тиждень.",
    "review.inboxUnclarified": "Неуточнені елементи Вхідних: {{count}}",
    "review.goInbox": "Перейти до Вхідних",
    "review.projectsNeedAttention": "Проєкти, що потребують уваги: {{count}}",
    "review.allProjectsHealthy": "Усі активні проєкти в порядку.",
    "review.openProjectView": "Відкрити проєкти",
    "review.projectsWithoutAction":
      "Активні проєкти без наступної дії: {{count}}",
    "review.ruleSatisfied":
      "Правило виконано: кожен активний проєкт має хоча б одну наступну дію.",
    "review.fixInProjects": "Виправити в проєктах",
    "review.waitingFollowUps":
      "Пункти очікування, що потребують уваги: {{count}}",
    "review.somedaySize": "Розмір списку Колись/можливо: {{count}}",
    "review.closedLoops":
      "Кандидати на закриття циклів: виконані дії {{actions}}, завершені проєкти {{projects}}.",
    "review.intentionLabel": "Нотатка-наміру на наступний тиждень",
    "review.intentionPlaceholder":
      "Що має бути найважливішим наступного тижня?",
    "review.aria": "Щотижневий огляд",
    "review.title": "Щотижневий огляд",
    "review.startedAt": "Почато: {{date}}",
    "review.startButton": "Почати щотижневий огляд",
    "review.completedTitle": "Огляд завершено",
    "review.completedAt": "Завершено о {{date}}",
    "review.snapshot":
      "Знімок: вхідні {{inbox}}, без дій {{missing}}, очікування {{waiting}}",
    "review.note": "Нотатка: {{note}}",
    "review.noteFallback": "Нотатка-намір не вказана.",
    "review.stepIndicator": "Крок {{current}} з {{total}}",
    "review.previous": "Назад",
    "review.next": "Наступний крок",
    "review.complete": "Завершити щотижневий огляд",
    "review.startHint":
      "Запустіть огляд, щоб пройти всі 7 GTD кроків і завершити перевірки перед закриттям тижня.",

    "stepper.aria": "Кроки щотижневого огляду",
    "stepper.stepAria": "Крок {{step}}: {{title}}",

    "ds.project.status.active": "Активний",
    "ds.project.status.on_hold": "На паузі",
    "ds.project.status.done": "Готово",
    "ds.project.healthMissing": "Немає наступної дії",
    "ds.project.statusLabel": "Статус: {{status}}",
    "ds.project.linkedSection": "Пов'язані наступні дії",
    "ds.project.noLinked": "Поки немає повʼязаних дій.",
    "ds.project.noContext": "Без контексту",

    "state.projectInvariant":
      'Проєкт "{{projectTitle}}" має містити хоча б одну активну наступну дію.',
    "state.backup.copySuccess":
      "Зашифровану резервну копію скопійовано в буфер обміну.",
    "state.backup.copyFail":
      "Не вдалося скопіювати резервну копію. Перевірте доступ до буфера обміну.",
    "state.backup.emptyInput": "Рядок резервної копії порожній.",
    "state.backup.invalid":
      "Резервна копія пошкоджена або має непідтримуваний формат.",
    "state.backup.importSuccess": "Резервну копію успішно імпортовано.",
    "state.backup.decryptFail":
      "Не вдалося розшифрувати резервну копію. Перевірте рядок резервної копії.",
    "sync.merge.prompt":
      "Хмарні дані відрізняються від локальних. Натисніть OK, щоб замінити локальні дані хмарними. Натисніть Скасувати, щоб об'єднати локальні й хмарні дані.",
    "sync.error.init": "Не вдалося ініціалізувати хмарну синхронізацію.",
    "sync.error.listen": "Помилка слухача хмарної синхронізації.",
    "sync.error.push": "Не вдалося завантажити локальні зміни в хмару.",
    "sync.error.offline":
      "Ви офлайн. Зміни синхронізуються після відновлення мережі.",
    "sync.error.resync":
      "Історія хмарної синхронізації неконсистентна. Виконайте повну ресинхронізацію.",
    "state.context.customDescription": "Користувацький контекст",
    "state.review.error.inbox":
      "Не можна завершити огляд: у Вхідних є неуточнені елементи. Спочатку виконайте уточнення.",
    "state.review.error.projects":
      "Не можна завершити огляд: є активні проєкти без наступної дії.",

    "pwa.offlineReady": "FlowAnchor Todo готовий до офлайн-режиму",
    "pwa.updateConfirm": "Доступна нова версія застосунку. Оновити зараз?",
    "column.create.title": "Створити колонку",
    "column.create.placeholder": "Наприклад: У процесі",
    "column.create.aria": "Назва нової колонки",
    "column.create.button": "+ Створити",
    "defaultContext.computer": "Цифрова робота, що потребує комп'ютера",
    "defaultContext.phone": "Дзвінки та повідомлення",
    "defaultContext.home": "Дії, привʼязані до дому",
    "defaultContext.deepWork": "Сфокусована робота, що потребує концентрації",
    "defaultContext.fiveMin": "Швидкі дії, які вміщуються в короткі вікна",
  },
};
