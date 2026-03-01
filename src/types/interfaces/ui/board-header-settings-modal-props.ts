import type { SupportedLocale } from "../../../i18n/translations";

export interface BoardHeaderSettingsModalProps {
  isOpen: boolean;
  locale: SupportedLocale;
  onLocaleChange: (nextLocale: SupportedLocale) => void;
  isCloudSyncEnabled: boolean;
  cloudSyncStatusLabel: string;
  cloudSyncQueueLength: number;
  cloudSyncPendingUploads: number;
  onSignOut: () => Promise<void>;
  isDangerZoneOpen: boolean;
  onToggleDangerZone: () => void;
  onResetLocalDataClick: () => void;
  canResetCloudData: boolean;
  isCloudResetPending: boolean;
  onResetCloudDataClick: () => void;
  backupStatus: string | null;
  onClose: () => void;
}
