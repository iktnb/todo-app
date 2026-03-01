import { useEffect, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import type { BoardHeaderProps } from "../types/interfaces";
import { QuickCaptureForm } from "./QuickCaptureForm";
import { BoardHeaderActions } from "./board-header/BoardHeaderActions";
import { BoardHeaderCloudResetConfirmModal } from "./board-header/BoardHeaderCloudResetConfirmModal";
import { BoardHeaderResetConfirmModal } from "./board-header/BoardHeaderResetConfirmModal";
import { BoardHeaderSettingsModal } from "./board-header/BoardHeaderSettingsModal";
import { BoardHeaderArchiveModal } from "./board-header/BoardHeaderArchiveModal";
import { BoardHeaderSomedayModal } from "./board-header/BoardHeaderSomedayModal";

export function BoardHeader({
  onResetLocalData,
  onResetCloudData,
  onOpenGuide,
  onOpenReview,
  taskInput,
  setTaskInput,
  onCaptureItem,
  isCloudSyncEnabled,
  onSignOut,
  cloudSyncStatusLabel,
  cloudSyncQueueLength,
  cloudSyncPendingUploads,
  archivedTasks,
  somedayItems,
  onUnarchiveTask,
  onMoveSomedayToInbox,
}: BoardHeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isCloudResetPending, setIsCloudResetPending] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCloudResetConfirmOpen, setIsCloudResetConfirmOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSomedayOpen, setIsSomedayOpen] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [cloudResetConfirmInput, setCloudResetConfirmInput] = useState("");
  const cloudResetPhrase = t("header.settings.cloudResetConfirmPhrase");
  const canResetCloudData = isCloudSyncEnabled;
  const isCloudResetPhraseValid =
    cloudResetConfirmInput.trim().toLocaleLowerCase() ===
    cloudResetPhrase.toLocaleLowerCase();

  function closeCloudResetConfirm() {
    setCloudResetConfirmInput("");
    setIsCloudResetConfirmOpen(false);
  }

  function closeSettings() {
    setIsSettingsOpen(false);
    setIsResetConfirmOpen(false);
    setIsCloudResetConfirmOpen(false);
    setIsDangerZoneOpen(false);
    setCloudResetConfirmInput("");
  }

  useEffect(() => {
    if (!isSettingsOpen && !isArchiveOpen && !isSomedayOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isArchiveOpen) {
          setIsArchiveOpen(false);
          return;
        }

        if (isSomedayOpen) {
          setIsSomedayOpen(false);
          return;
        }

        if (isCloudResetConfirmOpen) {
          closeCloudResetConfirm();
          return;
        }

        if (isDangerZoneOpen) {
          setIsDangerZoneOpen(false);
          return;
        }

        if (isResetConfirmOpen) {
          setIsResetConfirmOpen(false);
          return;
        }

        closeSettings();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    isCloudResetConfirmOpen,
    isDangerZoneOpen,
    isArchiveOpen,
    isSomedayOpen,
    isResetConfirmOpen,
    isSettingsOpen,
  ]);

  function handleResetClick() {
    setIsResetConfirmOpen(true);
  }

  function handleResetCancel() {
    setIsResetConfirmOpen(false);
  }

  function handleResetConfirm() {
    closeSettings();
    onResetLocalData();
  }

  function handleCloudResetClick() {
    if (!canResetCloudData) {
      return;
    }

    setCloudResetConfirmInput("");
    setIsCloudResetConfirmOpen(true);
  }

  function handleCloudResetCancel() {
    closeCloudResetConfirm();
  }

  async function handleCloudResetConfirm() {
    if (!isCloudResetPhraseValid) {
      return;
    }

    setIsCloudResetPending(true);
    try {
      const result = await onResetCloudData();
      setBackupStatus(result.message);
      if (result.ok) {
        closeCloudResetConfirm();
      }
    } finally {
      setIsCloudResetPending(false);
    }
  }

  return (
    <header className="mx-auto w-full max-w-6xl rounded-xl border border-sky-400/25 bg-[linear-gradient(155deg,rgba(17,24,39,0.95),rgba(15,23,42,0.92))] px-3 py-2.5 shadow-[0_0_16px_rgba(56,189,248,0.12),0_0_28px_rgba(56,189,248,0.06)] max-md:px-2.5 max-md:py-2">
      <div className="flex items-center gap-2 md:grid-cols-[1fr_minmax(360px,760px)_1fr]">
        <div className="hidden md:block" aria-hidden="true" />
        <QuickCaptureForm
          taskInput={taskInput}
          setTaskInput={setTaskInput}
          onSubmit={onCaptureItem}
        />
        <BoardHeaderActions
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGuide={onOpenGuide}
          onOpenArchive={() => setIsArchiveOpen(true)}
          onOpenSomeday={() => setIsSomedayOpen(true)}
          onOpenReview={onOpenReview}
        />
      </div>
      <BoardHeaderSettingsModal
        isOpen={isSettingsOpen}
        locale={locale}
        onLocaleChange={setLocale}
        isCloudSyncEnabled={isCloudSyncEnabled}
        cloudSyncStatusLabel={cloudSyncStatusLabel}
        cloudSyncQueueLength={cloudSyncQueueLength}
        cloudSyncPendingUploads={cloudSyncPendingUploads}
        onSignOut={onSignOut}
        isDangerZoneOpen={isDangerZoneOpen}
        onToggleDangerZone={() => setIsDangerZoneOpen((current) => !current)}
        onResetLocalDataClick={handleResetClick}
        canResetCloudData={canResetCloudData}
        isCloudResetPending={isCloudResetPending}
        onResetCloudDataClick={handleCloudResetClick}
        backupStatus={backupStatus}
        onClose={closeSettings}
      />
      <BoardHeaderResetConfirmModal
        isOpen={isResetConfirmOpen}
        onCancel={handleResetCancel}
        onConfirm={handleResetConfirm}
      />
      <BoardHeaderCloudResetConfirmModal
        isOpen={isCloudResetConfirmOpen && canResetCloudData}
        cloudResetPhrase={cloudResetPhrase}
        cloudResetConfirmInput={cloudResetConfirmInput}
        onCloudResetConfirmInputChange={setCloudResetConfirmInput}
        isCloudResetPhraseValid={isCloudResetPhraseValid}
        isCloudResetPending={isCloudResetPending}
        onCancel={handleCloudResetCancel}
        onConfirm={() => void handleCloudResetConfirm()}
      />
      <BoardHeaderArchiveModal
        isOpen={isArchiveOpen}
        archivedTasks={archivedTasks}
        onUnarchiveTask={onUnarchiveTask}
        onClose={() => setIsArchiveOpen(false)}
      />
      <BoardHeaderSomedayModal
        isOpen={isSomedayOpen}
        somedayItems={somedayItems}
        onMoveToInbox={onMoveSomedayToInbox}
        onClose={() => setIsSomedayOpen(false)}
      />
    </header>
  );
}
