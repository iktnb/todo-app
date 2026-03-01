import type { TranslationMessages } from "../types";

export const workflowsUkTranslations: TranslationMessages = {
  "clarify.outcome.next_action": "Наступна дія",
  "clarify.outcome.project": "Проєкт",
  "clarify.outcome.someday": "Колись/можливо",
  "clarify.outcome.trash": "Смітник",
  "clarify.error.needContext": "Для наступної дії потрібен щонайменше один контекст.",
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
  "clarify.confirm": 'Елемент "{{itemTitle}}" оброблено як "{{outcomeLabel}}".',
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
  "review.projectsWithoutAction": "Активні проєкти без наступної дії: {{count}}",
  "review.ruleSatisfied":
    "Правило виконано: кожен активний проєкт має хоча б одну наступну дію.",
  "review.fixInProjects": "Виправити в проєктах",
  "review.waitingFollowUps": "Пункти очікування, що потребують уваги: {{count}}",
  "review.somedaySize": "Розмір списку Колись/можливо: {{count}}",
  "review.closedLoops":
    "Кандидати на закриття циклів: виконані дії {{actions}}, завершені проєкти {{projects}}.",
  "review.intentionLabel": "Нотатка-наміру на наступний тиждень",
  "review.intentionPlaceholder": "Що має бути найважливішим наступного тижня?",
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
  "state.projectInvariant":
    'Проєкт "{{projectTitle}}" має містити хоча б одну активну наступну дію.',
  "state.backup.copySuccess":
    "Зашифровану резервну копію скопійовано в буфер обміну.",
  "state.backup.copyFail":
    "Не вдалося скопіювати резервну копію. Перевірте доступ до буфера обміну.",
  "state.backup.emptyInput": "Рядок резервної копії порожній.",
  "state.backup.invalid": "Резервна копія пошкоджена або має непідтримуваний формат.",
  "state.backup.importSuccess": "Резервну копію успішно імпортовано.",
  "state.backup.decryptFail":
    "Не вдалося розшифрувати резервну копію. Перевірте рядок резервної копії.",
  "state.cloudReset.success": "Дані в хмарі видалено.",
  "state.cloudReset.fail": "Не вдалося видалити дані в хмарі. Спробуйте ще раз.",
  "state.cloudReset.noAuth":
    "Увійдіть у хмарний акаунт перед видаленням даних у хмарі.",
  "sync.merge.prompt":
    "Хмарні дані відрізняються від локальних. Натисніть OK, щоб замінити локальні дані хмарними. Натисніть Скасувати, щоб об'єднати локальні й хмарні дані.",
  "sync.error.init": "Не вдалося ініціалізувати хмарну синхронізацію.",
  "sync.error.listen": "Помилка слухача хмарної синхронізації.",
  "sync.error.push": "Не вдалося завантажити локальні зміни в хмару.",
  "sync.error.offline": "Ви офлайн. Зміни синхронізуються після відновлення мережі.",
  "sync.error.resync":
    "Історія хмарної синхронізації неконсистентна. Виконайте повну ресинхронізацію.",
  "state.context.customDescription": "Користувацький контекст",
  "state.review.error.inbox":
    "Не можна завершити огляд: у Вхідних є неуточнені елементи. Спочатку виконайте уточнення.",
  "state.review.error.projects":
    "Не можна завершити огляд: є активні проєкти без наступної дії.",
  "pwa.offlineReady": "FlowAnchor Todo готовий до офлайн-режиму",
  "pwa.updateConfirm": "Доступна нова версія застосунку. Оновити зараз?",
};
