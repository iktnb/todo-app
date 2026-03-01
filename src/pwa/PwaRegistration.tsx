import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useI18n } from "../i18n/useI18n";

export function PwaRegistration() {
  const { t } = useI18n();
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error: unknown) {
      console.error("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    if (!offlineReady) {
      return;
    }

    console.info(t("pwa.offlineReady"));
  }, [offlineReady, t]);

  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    const shouldUpdate = window.confirm(t("pwa.updateConfirm"));
    if (shouldUpdate) {
      void updateServiceWorker(true);
    }
  }, [needRefresh, t, updateServiceWorker]);

  return null;
}
