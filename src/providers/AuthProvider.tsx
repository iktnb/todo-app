import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "../lib/firebase/client";
import { CLOUD_SYNC_ENABLED } from "../constants/firebase";
import type { AuthUser } from "../types/interfaces/auth/auth-user";
import { AuthContext, type AuthContextValue } from "./auth-context";

function mapAuthUser(): AuthUser | null {
  if (!firebaseAuth?.currentUser) {
    return null;
  }

  return {
    uid: firebaseAuth.currentUser.uid,
    email: firebaseAuth.currentUser.email,
    displayName: firebaseAuth.currentUser.displayName,
    photoURL: firebaseAuth.currentUser.photoURL,
  };
}

function isPopupFallbackError(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  return (
    code === "auth/popup-blocked" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(
    CLOUD_SYNC_ENABLED && firebaseAuth !== null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !CLOUD_SYNC_ENABLED) {
      return;
    }

    let isCancelled = false;

    void getRedirectResult(firebaseAuth).catch((caughtError: unknown) => {
      if (isCancelled) {
        return;
      }

      setError(
        caughtError instanceof Error ? caughtError.message : "Auth error",
      );
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (isCancelled) {
        return;
      }

      setUser(
        nextUser
          ? {
              uid: nextUser.uid,
              email: nextUser.email,
              displayName: nextUser.displayName,
              photoURL: nextUser.photoURL,
            }
          : null,
      );
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    if (!firebaseAuth || !CLOUD_SYNC_ENABLED) {
      return;
    }

    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(firebaseAuth, provider);
      setUser(mapAuthUser());
    } catch (caughtError) {
      if (isPopupFallbackError(caughtError)) {
        await signInWithRedirect(firebaseAuth, provider);
        return;
      }

      setError(
        caughtError instanceof Error ? caughtError.message : "Auth error",
      );
      throw caughtError;
    }
  }

  async function signOutUser() {
    if (!firebaseAuth || !CLOUD_SYNC_ENABLED) {
      return;
    }

    setError(null);

    try {
      await signOut(firebaseAuth);
      setUser(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Auth error",
      );
      throw caughtError;
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      isEnabled: CLOUD_SYNC_ENABLED && firebaseAuth !== null,
      signInWithGoogle,
      signOutUser,
    }),
    [error, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
