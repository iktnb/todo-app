import { act, renderHook } from "@testing-library/react";
import type { FormEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BOARD_STORAGE_KEY } from "../constants/storage";
import { I18nProvider } from "../i18n/I18nProvider";
import { TaskStatusEnum } from "../types/board";
import {
  ClarifyOutcomeEnum,
  ItemSourceEnum,
  NextActionStatusEnum,
  ProjectStatusEnum,
} from "../types/gtd";
import { useBoardState } from "./useBoardState";

function Wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function createFormSubmitEvent(): FormEvent<HTMLFormElement> {
  return {
    preventDefault: vi.fn(),
  } as unknown as FormEvent<HTMLFormElement>;
}

function captureItem(
  result: { current: ReturnType<typeof useBoardState> },
  title: string,
) {
  act(() => {
    result.current.setTaskInput(title);
  });
  act(() => {
    result.current.handleCaptureItem(createFormSubmitEvent());
  });
}

describe("useBoardState", () => {
  let uuidCounter = 0;

  beforeEach(() => {
    localStorage.clear();
    uuidCounter = 0;
    vi.restoreAllMocks();
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      uuidCounter += 1;
      const paddedCounter = String(uuidCounter).padStart(12, "0");
      return `00000000-0000-4000-8000-${paddedCounter}`;
    });
  });

  it("migrates legacy snapshot into items and flags migration", () => {
    localStorage.setItem(
      BOARD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        columns: [{ id: "custom", title: "Custom" }],
        tasks: [
          {
            id: "task-1",
            title: "Legacy task",
            columnId: "custom",
            status: TaskStatusEnum.Todo,
            createdAt: "2025-01-01T00:00:00.000Z",
          },
          {
            id: "task-orphan",
            title: "Orphan task",
            columnId: "missing",
            status: TaskStatusEnum.Todo,
            createdAt: "2025-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });

    expect(result.current.isMigratedFromLegacy).toBe(true);
    expect(result.current.legacyTaskIds).toEqual(["task-1"]);
    expect(result.current.tasks.map((task) => task.id)).toEqual(["task-1"]);
    expect(result.current.items).toEqual([
      expect.objectContaining({
        id: "task-1",
        title: "Legacy task",
        clarified: false,
        source: ItemSourceEnum.Legacy,
      }),
    ]);
  });

  it("deduplicates quick capture submissions within 500ms", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00.000Z"));
    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });

    captureItem(result, "Capture me");
    captureItem(result, "Capture me");

    expect(result.current.items).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    captureItem(result, "Capture me");

    expect(result.current.items).toHaveLength(2);
    vi.useRealTimers();
  });

  it("completes clarify flow into next action and marks item clarified", () => {
    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });

    captureItem(result, "Clarify this");

    const itemId = result.current.items[0]?.id;
    const contextId = result.current.contexts[0]?.id;
    expect(itemId).toBeTruthy();
    expect(contextId).toBeTruthy();

    act(() => {
      expect(result.current.startClarify(itemId as string)).toBe(true);
    });
    act(() => {
      expect(
        result.current.applyClarifyOutcome({
          outcome: ClarifyOutcomeEnum.NextAction,
          contextId: contextId as string,
          title: "Do this now",
        }),
      ).toBe(true);
    });

    expect(result.current.nextActions).toHaveLength(1);
    expect(result.current.nextActions[0]).toEqual(
      expect.objectContaining({
        id: itemId,
        title: "Do this now",
        status: NextActionStatusEnum.Active,
      }),
    );
    expect(result.current.items[0]).toEqual(
      expect.objectContaining({ clarified: true }),
    );
  });

  it("blocks finishing the only active next action of active project", () => {
    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });
    const contextId = result.current.contexts[0]?.id as string;

    act(() => {
      expect(result.current.createProject("Main Project")).toBe(true);
    });
    const projectId = result.current.projects[0]?.id as string;

    act(() => {
      expect(
        result.current.createNextAction({
          title: "Only action",
          contextId,
          projectId,
        }),
      ).toBe(true);
    });
    const nextActionId = result.current.nextActions[0]?.id as string;

    act(() => {
      expect(
        result.current.setNextActionStatus(nextActionId, NextActionStatusEnum.Done),
      ).toBe(false);
    });

    expect(result.current.nextActions[0]?.status).toBe(NextActionStatusEnum.Active);
    expect(result.current.projectInvariantWarning).toBeTruthy();
  });

  it("blocks then completes weekly review after inbox is clarified", () => {
    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });
    const contextId = result.current.contexts[0]?.id as string;

    act(() => {
      result.current.startWeeklyReview();
    });
    captureItem(result, "Weekly review item");

    act(() => {
      expect(result.current.completeWeeklyReview()).toBe(false);
    });
    expect(result.current.weeklyReviewError).toBeTruthy();

    const itemId = result.current.items[0]?.id as string;
    act(() => {
      expect(result.current.startClarify(itemId)).toBe(true);
    });
    act(() => {
      expect(
        result.current.applyClarifyOutcome({
          outcome: ClarifyOutcomeEnum.NextAction,
          contextId,
          title: "Reviewed action",
        }),
      ).toBe(true);
    });

    act(() => {
      expect(result.current.completeWeeklyReview()).toBe(true);
    });

    expect(result.current.weeklyReviewError).toBeNull();
    expect(result.current.reviewHistory.length).toBe(1);
    expect(result.current.reviewHistory[0]?.completed).toBe(true);
  });

  it("blocks activating project without active actions", () => {
    const { result } = renderHook(() => useBoardState(), { wrapper: Wrapper });

    act(() => {
      expect(result.current.createProject("Dormant Project")).toBe(true);
    });
    const projectId = result.current.projects[0]?.id as string;

    act(() => {
      expect(result.current.updateProjectStatus(projectId, ProjectStatusEnum.OnHold)).toBe(
        true,
      );
      expect(result.current.updateProjectStatus(projectId, ProjectStatusEnum.Active)).toBe(
        false,
      );
    });

    expect(result.current.projects[0]?.status).toBe(ProjectStatusEnum.OnHold);
    expect(result.current.projectInvariantWarning).toBeTruthy();
  });
});
