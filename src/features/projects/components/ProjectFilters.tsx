import { ProjectStatusEnum, ProjectStatusFilterEnum } from "../../../types/gtd";
import type { ProjectStatusFilter } from "../../../types/gtd";
import { useI18n } from "../../../i18n/useI18n";
import { NeonSelect } from "../../../../design-system/components";

interface ProjectFiltersProps {
  searchQuery: string;
  statusFilter: ProjectStatusFilter;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: ProjectStatusFilter) => void;
}

export function ProjectFilters({
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
}: ProjectFiltersProps) {
  const { t } = useI18n();
  const statusFilterOptions = [
    {
      value: ProjectStatusFilterEnum.All,
      label: t("project.filter.status.all"),
    },
    {
      value: ProjectStatusEnum.Active,
      label: t("ds.project.status.active"),
    },
    {
      value: ProjectStatusEnum.OnHold,
      label: t("ds.project.status.on_hold"),
    },
    {
      value: ProjectStatusEnum.Done,
      label: t("ds.project.status.done"),
    },
  ] as const;

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-none">
      <input
        id="project-search-input"
        className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200 sm:w-80"
        type="search"
        placeholder={t("project.search.placeholder")}
        aria-label={t("project.search.aria")}
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
      />
      <NeonSelect<ProjectStatusFilter>
        id="project-status-filter-select"
        className="w-full sm:w-52"
        ariaLabel={t("project.filter.status.aria")}
        value={statusFilter}
        options={statusFilterOptions}
        onChange={onStatusFilterChange}
      />
    </div>
  );
}
