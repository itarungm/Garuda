'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Status = 'todo' | 'in_progress' | 'done'

interface Todo {
  id: string
  title: string
  status: Status
  assigned_to: string | null
  order_index: number
  parent_id: string | null
  children?: Todo[]
}

interface Column {
  id: Status
  label: string
  color: string
}

const COLUMNS: Column[] = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 border-gray-300' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-50 border-amber-300' },
  { id: 'done', label: 'Done', color: 'bg-emerald-50 border-emerald-300' },
]

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function SortableItem({ todo, onDelete, onStatusChange, onAddSubtask, onRenameTitle, onClaim, tripId, members, currentUserId }: {
  todo: Todo
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
  onAddSubtask: (parentId: string, title: string) => void
  onRenameTitle: (id: string, title: string) => void
  onClaim: (id: string) => void
  tripId: string
  members: any[]
  currentUserId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  const [expanded, setExpanded] = useState(false)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)

  const style = { transform: CSS.Transform.toString(transform), transition }

  const assignee = members.find((m: any) => m.user_id === todo.assigned_to)
  const isOwned = todo.assigned_to === currentUserId

  return (
    <div ref={setNodeRef} style={style} className={cn(
      'bg-white border border-gray-200 rounded-xl p-3 shadow-sm',
      isDragging && 'opacity-50 ring-2 ring-emerald-400',
      isOwned && 'border-l-4 border-l-emerald-500',
    )}>
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-gray-300 cursor-grab active:cursor-grabbing">
          <GripVertical size={15} />
        </button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => { onRenameTitle(todo.id, editValue); setEditing(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') { onRenameTitle(todo.id, editValue); setEditing(false) }
                if (e.key === 'Escape') { setEditValue(todo.title); setEditing(false) }
              }}
              className="w-full text-sm font-medium text-gray-900 border-b border-emerald-400 focus:outline-none bg-transparent"
            />
          ) : (
            <p
              onDoubleClick={() => setEditing(true)}
              title="Double-click to edit"
              className={cn('text-sm font-medium text-gray-900 cursor-text', todo.status === 'done' && 'line-through text-gray-400')}
            >
              {todo.title}
            </p>
          )}
          {todo.children && todo.children.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {todo.children.filter(c => c.status === 'done').length}/{todo.children.length} subtasks
            </p>
          )}
          {/* Assignee row */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {assignee ? (
              <span
                title={assignee.profiles?.full_name || 'Member'}
                className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white',
                  isOwned ? 'bg-emerald-600' : 'bg-indigo-400'
                )}
              >
                {getInitials(assignee.profiles?.full_name)}
              </span>
            ) : (
              <button
                onClick={() => onClaim(todo.id)}
                className="text-[10px] text-emerald-700 border border-emerald-400 rounded-full px-2 py-0.5 hover:bg-emerald-50 font-medium"
              >
                Claim
              </button>
            )}
            {isOwned && (
              <span className="text-[10px] text-emerald-600 font-medium">Mine</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <select
            value={todo.status}
            onChange={e => onStatusChange(todo.id, e.target.value as Status)}
            className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 focus:outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => onDelete(todo.id)} className="text-red-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pl-5 space-y-1.5">
          {(todo.children || []).map(sub => (
            <div key={sub.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sub.status === 'done'}
                onChange={e => onStatusChange(sub.id, e.target.checked ? 'done' : 'todo')}
                className="rounded accent-emerald-600"
              />
              <span className={cn('text-xs text-gray-700', sub.status === 'done' && 'line-through text-gray-400')}>
                {sub.title}
              </span>
              <button onClick={() => onDelete(sub.id)} className="ml-auto text-red-300 hover:text-red-500">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <input
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && subtaskInput.trim()) {
                  onAddSubtask(todo.id, subtaskInput.trim())
                  setSubtaskInput('')
                }
              }}
              placeholder="Add subtask..."
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface BoardProps {
  tripId: string
  initialTodos: any[]
  members: any[]
  currentUserId: string
}

export default function TodoBoard({ tripId, initialTodos, members, currentUserId }: BoardProps) {
  const supabase = createClient()

  // Build tree structure
  const buildTree = (todos: any[]): Todo[] => {
    const map: Record<string, Todo> = {}
    const roots: Todo[] = []
    todos.forEach(t => { map[t.id] = { ...t, children: [] } })
    todos.forEach(t => {
      if (t.parent_id && map[t.parent_id]) map[t.parent_id].children!.push(map[t.id])
      else roots.push(map[t.id])
    })
    return roots.sort((a, b) => a.order_index - b.order_index)
  }

  const [todos, setTodos] = useState<Todo[]>(buildTree(initialTodos))
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<Status>('todo')
  const [adding, setAdding] = useState(false)
  const [myTasksOnly, setMyTasksOnly] = useState(false)

  // Realtime: sync todos from other users
  useEffect(() => {
    const channel = supabase
      .channel(`todos:${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const t = { ...payload.new as any, children: [] }
            setTodos(prev => {
              if (!t.parent_id) return [...prev, t]
              const add = (list: Todo[]): Todo[] =>
                list.map(item => item.id === t.parent_id
                  ? { ...item, children: [...(item.children || []), t] }
                  : { ...item, children: add(item.children || []) })
              return add(prev)
            })
          } else if (payload.eventType === 'UPDATE') {
            const u = payload.new as any
            const update = (list: Todo[]): Todo[] =>
              list.map(item => item.id === u.id
                ? { ...item, ...u }
                : { ...item, children: update(item.children || []) })
            setTodos(prev => update(prev))
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any).id
            const remove = (list: Todo[]): Todo[] =>
              list.filter(t => t.id !== id).map(t => ({ ...t, children: remove(t.children || []) }))
            setTodos(prev => remove(prev))
          }
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tripId])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function addTodo() {
    if (!newTitle.trim()) return
    setAdding(true)
    const { data } = await supabase
      .from('todos')
      .insert({ trip_id: tripId, title: newTitle, status: newStatus, order_index: todos.length })
      .select()
      .single()
    if (data) {
      setTodos(prev => [...prev, { ...data, children: [] }])
      setNewTitle('')
      toast.success('Task added')
    }
    setAdding(false)
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => {
      const remove = (list: Todo[]): Todo[] =>
        list.filter(t => t.id !== id).map(t => ({ ...t, children: remove(t.children || []) }))
      return remove(prev)
    })
  }

  async function changeStatus(id: string, status: Status) {
    await supabase.from('todos').update({ status }).eq('id', id)
    const update = (list: Todo[]): Todo[] =>
      list.map(t => t.id === id ? { ...t, status } : { ...t, children: update(t.children || []) })
    setTodos(prev => update(prev))
  }

  async function renameTitle(id: string, title: string) {
    if (!title.trim()) return
    await supabase.from('todos').update({ title: title.trim() }).eq('id', id)
    const update = (list: Todo[]): Todo[] =>
      list.map(t => t.id === id ? { ...t, title: title.trim() } : { ...t, children: update(t.children || []) })
    setTodos(prev => update(prev))
  }

  async function addSubtask(parentId: string, title: string) {
    const { data } = await supabase
      .from('todos')
      .insert({ trip_id: tripId, title, parent_id: parentId, status: 'todo', order_index: 0 })
      .select()
      .single()
    if (data) {
      const addChild = (list: Todo[]): Todo[] =>
        list.map(t => t.id === parentId ? { ...t, children: [...(t.children || []), { ...data, children: [] }] } : { ...t, children: addChild(t.children || []) })
      setTodos(prev => addChild(prev))
    }
  }

  async function claimTodo(id: string) {
    await supabase.from('todos').update({ assigned_to: currentUserId }).eq('id', id)
    const update = (list: Todo[]): Todo[] =>
      list.map(t => t.id === id ? { ...t, assigned_to: currentUserId } : { ...t, children: update(t.children || []) })
    setTodos(prev => update(prev))
    toast.success('Task claimed!')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTodos(prev => {
      const oldIndex = prev.findIndex(t => t.id === active.id)
      const newIndex = prev.findIndex(t => t.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      const reordered = arrayMove(prev, oldIndex, newIndex)
      // persist order
      reordered.forEach((t, i) => {
        supabase.from('todos').update({ order_index: i }).eq('id', t.id)
      })
      return reordered
    })
  }

  const visibleTodos = myTasksOnly ? todos.filter(t => t.assigned_to === currentUserId) : todos
  const getByStatus = (status: Status) => visibleTodos.filter(t => t.status === status)

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMyTasksOnly(false)}
          className={cn('text-sm px-4 py-1.5 rounded-full font-medium transition-colors', !myTasksOnly ? 'bg-[#1a4731] text-white' : 'bg-white border border-gray-200 text-gray-600')}
        >
          All Tasks
        </button>
        <button
          onClick={() => setMyTasksOnly(true)}
          className={cn('text-sm px-4 py-1.5 rounded-full font-medium transition-colors', myTasksOnly ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600')}
        >
          My Tasks
        </button>
      </div>

      {/* Add todo */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-2">
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value as Status)}
          className="text-sm border border-gray-200 rounded-xl px-2 py-2 focus:outline-none text-gray-700"
        >
          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task... (press Enter)"
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={addTodo}
          disabled={adding || !newTitle.trim()}
          className="bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
        >
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {COLUMNS.map(col => {
            const colTodos = getByStatus(col.id)
            return (
              <div key={col.id} className={cn('border rounded-2xl p-3', col.color)}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                  <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-500">{colTodos.length}</span>
                </div>
                <SortableContext items={colTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-16">
                    {colTodos.map(todo => (
                      <SortableItem
                        key={todo.id}
                        todo={todo}
                        onDelete={deleteTodo}
                        onStatusChange={changeStatus}
                        onAddSubtask={addSubtask}
                        onRenameTitle={renameTitle}
                        onClaim={claimTodo}
                        tripId={tripId}
                        members={members}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </DndContext>
      </div>
    </div>
  )
}
