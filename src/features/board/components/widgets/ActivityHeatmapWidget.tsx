import { Fragment, useMemo } from "react";
import { useI18n } from "../../../../i18n/useI18n";
import {
  HeatmapSensitivityEnum,
  type HeatmapSensitivity,
} from "../../../../types/enums";

interface ActivityHeatmapWidgetProps {
  activityByDate: Record<string, number>;
  sensitivity: HeatmapSensitivity;
  onSensitivityChange: (nextSensitivity: HeatmapSensitivity) => void;
}

const DAYS_IN_WEEK = 7;
const HEATMAP_COLUMNS = 16;
const DAYS_IN_HEATMAP = HEATMAP_COLUMNS * DAYS_IN_WEEK;
const CELL_SIZE_PX = 24;
const DAY_LABEL_WIDTH_PX = 24;

interface HeatmapCell {
  dayKey: string;
  date: Date;
  count: number;
}

const HEATMAP_SENSITIVITY_OPTIONS: HeatmapSensitivity[] = [
  HeatmapSensitivityEnum.Low,
  HeatmapSensitivityEnum.Balanced,
  HeatmapSensitivityEnum.High,
];

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toHeatmapIntensity(input: {
  count: number;
  sensitivity: HeatmapSensitivity;
}): number {
  if (input.count === 0) {
    return 0;
  }

  const baseGamma =
    input.sensitivity === HeatmapSensitivityEnum.High
      ? 1.15
      : input.sensitivity === HeatmapSensitivityEnum.Low
        ? 1.45
        : 1.3;
  const decayDivisor =
    input.sensitivity === HeatmapSensitivityEnum.High
      ? 8
      : input.sensitivity === HeatmapSensitivityEnum.Low
        ? 14
        : 11;
  // Use logarithmic growth so higher counts increase intensity more gradually.
  const adaptiveGamma = baseGamma + Math.log1p(input.count) * 0.08;
  const scaledCount = Math.pow(Math.log1p(input.count), adaptiveGamma);
  const normalized = 1 - Math.exp(-scaledCount / decayDivisor);

  return Math.min(4, Math.ceil(normalized * 4));
}

export function ActivityHeatmapWidget({
  activityByDate,
  sensitivity,
  onSensitivityChange,
}: ActivityHeatmapWidgetProps) {
  const { t, locale } = useI18n();
  const { weeks, monthLabels, weekdayLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const historyStart = startOfDay(new Date(today));
    historyStart.setDate(today.getDate() - (DAYS_IN_HEATMAP - 1));

    const days: HeatmapCell[] = Array.from(
      { length: DAYS_IN_HEATMAP },
      (_, dayOffset) => {
        const dayDate = startOfDay(new Date(historyStart));
        dayDate.setDate(historyStart.getDate() + dayOffset);
        const dayKey = toDayKey(dayDate);
        return {
          dayKey,
          date: dayDate,
          count: activityByDate[dayKey] ?? 0,
        };
      },
    );
    const computedWeeks = Array.from({ length: HEATMAP_COLUMNS }, (_, weekIndex) =>
      days.slice(weekIndex * DAYS_IN_WEEK, (weekIndex + 1) * DAYS_IN_WEEK),
    );

    const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
    const labels = computedWeeks.map((week, weekIndex) => {
      const firstDay = week[0];
      if (!firstDay) {
        return "";
      }
      if (weekIndex === 0) {
        return monthFormatter.format(firstDay.date);
      }
      const previousMonth = computedWeeks[weekIndex - 1]?.[0]?.date.getMonth();
      if (previousMonth === firstDay.date.getMonth()) {
        return "";
      }
      return monthFormatter.format(firstDay.date);
    });

    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const weekdayReferenceStart = new Date("2026-03-01T00:00:00.000Z");
    const labelsByRow = Array.from({ length: DAYS_IN_WEEK }, (_, rowIndex) => {
      const labelDate = new Date(weekdayReferenceStart);
      labelDate.setUTCDate(weekdayReferenceStart.getUTCDate() + rowIndex);
      const fullLabel = weekdayFormatter.format(labelDate);
      return rowIndex % 2 === 1 ? fullLabel : "";
    });

    return {
      weeks: computedWeeks,
      monthLabels: labels,
      weekdayLabels: labelsByRow,
    };
  }, [activityByDate, locale]);
  const dateTitleFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-xs text-slate-400">
          {t("board.dashboard.heatmap.lastDays", { days: DAYS_IN_HEATMAP })}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-slate-500/35 bg-slate-900/35 p-1">
          <span className="px-1 text-[10px] text-slate-400">
            {t("board.dashboard.heatmap.sensitivity")}
          </span>
          {HEATMAP_SENSITIVITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSensitivityChange(option)}
              className={`cursor-pointer rounded-md px-1.5 py-0.5 text-[10px] ${
                sensitivity === option
                  ? "bg-sky-400/25 text-sky-100"
                  : "text-slate-300 hover:bg-slate-700/45"
              }`}
            >
              {t(`board.dashboard.heatmap.sensitivity.${option}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid place-items-center">
        <div>
          <div
            className="mb-px grid gap-x-px"
            style={{
              gridTemplateColumns: `${DAY_LABEL_WIDTH_PX}px repeat(${HEATMAP_COLUMNS}, ${CELL_SIZE_PX}px)`,
            }}
          >
            <div />
            {monthLabels.map((monthLabel, weekIndex) => (
              <div
                key={`month-${weekIndex}`}
                className="h-3 overflow-hidden text-[10px] leading-none text-slate-500"
              >
                {monthLabel}
              </div>
            ))}
          </div>

          <div
            className="grid gap-x-px gap-y-px"
            style={{
              gridTemplateColumns: `${DAY_LABEL_WIDTH_PX}px repeat(${HEATMAP_COLUMNS}, ${CELL_SIZE_PX}px)`,
            }}
          >
            {Array.from({ length: DAYS_IN_WEEK }, (_, rowIndex) => (
              <Fragment key={`row-${rowIndex}`}>
                <div
                  className="flex items-center pr-1 text-[10px] leading-none text-slate-500"
                  style={{ height: `${CELL_SIZE_PX}px` }}
                >
                  {weekdayLabels[rowIndex]}
                </div>
                {weeks.map((week, weekIndex) => {
                  const day = week[rowIndex];
                  const intensity = toHeatmapIntensity({
                    count: day.count,
                    sensitivity,
                  });
                  const intensityClass =
                    intensity === 0
                      ? "bg-slate-800/75"
                      : intensity === 1
                        ? "bg-emerald-900/90"
                        : intensity === 2
                          ? "bg-emerald-700/90"
                          : intensity === 3
                            ? "bg-emerald-500/95"
                            : "bg-emerald-300";

                  return (
                    <div
                      key={`${weekIndex}-${day.dayKey}`}
                      className={`rounded-[2px] ${intensityClass}`}
                      style={{ width: `${CELL_SIZE_PX}px`, height: `${CELL_SIZE_PX}px` }}
                      title={`${dateTitleFormatter.format(day.date)}: ${day.count}`}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
