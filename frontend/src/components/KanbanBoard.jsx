import { useDraggable, useDroppable } from '@dnd-kit/core'

const STATUS_LABEL = {
  todo: 'To do',
  doing: 'Doing',
  done: 'Done',
}

function formatDue(value) {
  if (!value) return null
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function isOverdue(value, status) {
  if (!value || status === 'done') return false
  const due = new Date(`${value}T23:59:59`)
  return due < new Date()
}

export function KanbanCard({ task, onDelete, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { type: 'task', task },
      disabled,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const overdue = isOverdue(task.due, task.status)

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-card kanban-card-${task.status}${
        isDragging ? ' is-dragging' : ''
      }${task.status === 'done' ? ' is-done' : ''}${
        overdue ? ' is-overdue' : ''
      }`}
      {...listeners}
      {...attributes}
      aria-label={`${task.title}. Drag to move`}
    >
      <div className="kanban-card-rail" aria-hidden="true" />
      <div className="kanban-card-body">
        <div className="kanban-card-top">
          <span className="kanban-grip" aria-hidden="true">
            ⋮⋮
          </span>
          <span className={`badge badge-${task.status}`}>
            {STATUS_LABEL[task.status] || task.status}
          </span>
          <button
            type="button"
            className="btn btn-danger btn-icon kanban-delete"
            disabled={disabled}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(task.id)
            }}
            aria-label={`Delete ${task.title}`}
          >
            ⌫
          </button>
        </div>
        <h3>{task.title}</h3>
        {task.notes ? <p>{task.notes}</p> : null}
        <div className="task-meta">
          {task.due ? (
            <span className={`badge ${overdue ? 'badge-overdue' : 'badge-due'}`}>
              {overdue ? 'Overdue' : 'Due'} {formatDue(task.due)}
            </span>
          ) : (
            <span className="badge badge-muted">No due date</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function KanbanColumn({ column, tasks, onDelete, onAdd, busyId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', status: column.id },
  })

  return (
    <section
      className={`kanban-column kanban-column-${column.id}${
        isOver ? ' is-over' : ''
      }`}
      aria-label={column.label}
    >
      <header className="kanban-column-head">
        <div className="kanban-column-title">
          <span className={`status-dot status-dot-${column.id}`} aria-hidden="true" />
          <div>
            <h2>{column.label}</h2>
            <p>
              {tasks.length} {tasks.length === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </div>
        <div className="kanban-column-actions">
          <span className={`column-count column-count-${column.id}`}>
            {tasks.length}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => onAdd(column.id)}
            aria-label={`Add task to ${column.label}`}
          >
            +
          </button>
        </div>
      </header>

      <div ref={setNodeRef} className="kanban-column-body">
        {tasks.length === 0 ? (
          <div className="kanban-empty">
            <strong>Empty column</strong>
            <span>Drop a task here or add one</span>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              disabled={busyId === task.id}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  )
}
