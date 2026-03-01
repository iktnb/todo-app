import { useMemo, useState } from 'react'
import type { Context, NextAction, Project, ProjectHealth } from '../../types/gtd'
import { ProjectCard } from './ProjectCard'

interface ProjectViewProps {
  projects: Project[]
  contexts: Context[]
  nextActions: NextAction[]
  projectHealthById: Record<string, ProjectHealth>
  projectsWithoutNextActionCount: number
  unboundActiveNextActions: NextAction[]
  projectActions: (projectId: string) => NextAction[]
  onCreateProject: (title: string) => boolean
  onUpdateProjectTitle: (projectId: string, title: string) => boolean
  onUpdateProjectStatus: (projectId: string, status: Project['status']) => boolean
  onQuickAddLinkedAction: (input: {
    title: string
    contextId: string
    projectId: string
  }) => boolean
  onBindNextAction: (nextActionId: string, projectId: string) => boolean
  onUnbindNextAction: (nextActionId: string) => boolean
}

export function ProjectView({
  projects,
  contexts,
  nextActions,
  projectHealthById,
  projectsWithoutNextActionCount,
  unboundActiveNextActions,
  projectActions,
  onCreateProject,
  onUpdateProjectTitle,
  onUpdateProjectStatus,
  onQuickAddLinkedAction,
  onBindNextAction,
  onUnbindNextAction,
}: ProjectViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const contextsById = useMemo(
    () => new Map(contexts.map((context) => [context.id, context])),
    [contexts],
  )
  const sortedProjects = useMemo(
    () =>
      [...projects].sort((firstProject, secondProject) => {
        if (firstProject.status !== secondProject.status) {
          if (firstProject.status === 'active') {
            return -1
          }
          if (secondProject.status === 'active') {
            return 1
          }
        }
        return (
          new Date(secondProject.createdAt).getTime() -
          new Date(firstProject.createdAt).getTime()
        )
      }),
    [projects],
  )
  const activeProjectsCount = useMemo(
    () => projects.filter((project) => project.status === 'active').length,
    [projects],
  )
  const doneProjectsCount = useMemo(
    () => projects.filter((project) => project.status === 'done').length,
    [projects],
  )

  function handleCreateProject() {
    const isCreated = onCreateProject(newProjectTitle)
    if (!isCreated) {
      setCreateError('Введите валидное название проекта.')
      return
    }
    setCreateError(null)
    setNewProjectTitle('')
    setIsCreateOpen(false)
  }

  return (
    <section className="mt-5 grid min-h-0 grid-rows-[auto_auto_1fr] gap-3 overflow-y-auto pr-1 max-md:pr-0">
      <header className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-lg text-slate-100">Project View</h2>
          <div className="grid w-full gap-1 text-xs text-slate-300 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            <span>Active: {activeProjectsCount}</span>
            <span>Done: {doneProjectsCount}</span>
            <span>Missing Next Action: {projectsWithoutNextActionCount}</span>
            <span>All Next Actions: {nextActions.length}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-2 rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(2,6,23,0.95))] p-3.5">
        {!isCreateOpen ? (
          <button
            className="w-fit cursor-pointer rounded-[10px] border border-sky-400/55 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-200"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            Создать проект
          </button>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              className="w-full rounded-[10px] border border-slate-400/35 bg-slate-900/75 px-2.5 py-2 text-sm text-slate-200"
              type="text"
              placeholder="Название нового проекта"
              value={newProjectTitle}
              onChange={(event) => setNewProjectTitle(event.target.value)}
            />
            <button
              className="cursor-pointer rounded-[10px] border border-emerald-400/55 bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200"
              type="button"
              onClick={handleCreateProject}
            >
              Create
            </button>
            <button
              className="cursor-pointer rounded-[10px] border border-slate-400/45 bg-slate-700/40 px-3 py-2 text-xs text-slate-200"
              type="button"
              onClick={() => {
                setIsCreateOpen(false)
                setCreateError(null)
                setNewProjectTitle('')
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {createError ? <p className="m-0 text-xs text-rose-300">{createError}</p> : null}
      </section>

      <div className="grid content-start gap-3">
        {sortedProjects.length === 0 ? (
          <div className="grid min-h-[200px] place-items-center rounded-2xl border border-slate-400/25 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 text-center">
            <p className="m-0 text-sm text-slate-300">
              Проектов пока нет. Создайте первый проект и добавьте Next Action.
            </p>
          </div>
        ) : (
          sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              health={projectHealthById[project.id] ?? 'healthy'}
              linkedActions={projectActions(project.id)}
              unboundActiveNextActions={unboundActiveNextActions}
              contextsById={contextsById}
              contexts={contexts}
              onUpdateTitle={onUpdateProjectTitle}
              onUpdateStatus={onUpdateProjectStatus}
              onQuickAddLinkedAction={onQuickAddLinkedAction}
              onBindNextAction={onBindNextAction}
              onUnbindNextAction={onUnbindNextAction}
            />
          ))
        )}
      </div>
    </section>
  )
}
