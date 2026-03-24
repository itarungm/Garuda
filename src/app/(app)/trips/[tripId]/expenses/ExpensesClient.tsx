'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

type Category = 'transport' | 'food' | 'accommodation' | 'adventure' | 'spiritual' | 'shopping' | 'other'

interface Member {
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

interface Expense {
  id: string
  paid_by: string
  amount: number
  category: string | null
  description: string | null
  split_with: string[]
  created_at: string
}

interface Props {
  tripId: string
  currentUserId: string
  initialExpenses: Expense[]
  members: Member[]
}

export default function ExpensesClient({ tripId, currentUserId, initialExpenses, members }: Props) {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'other' as Category,
    paid_by: currentUserId,
    split_with: members.map(m => m.user_id),
  })

  const memberName = (uid: string) => {
    const m = members.find(m => m.user_id === uid)
    return m?.profiles?.full_name || 'User'
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount))) { toast.error('Enter a valid amount'); return }
    setLoading(true)

    const { data, error } = await supabase.from('expenses').insert({
      trip_id: tripId,
      paid_by: form.paid_by,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      split_with: form.split_with,
    }).select().single()

    if (error) { toast.error(error.message) }
    else {
      setExpenses(prev => [data, ...prev])
      setShowForm(false)
      setForm({ description: '', amount: '', category: 'other', paid_by: currentUserId, split_with: members.map(m => m.user_id) })
      toast.success('Expense added')
    }
    setLoading(false)
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    toast.success('Deleted')
  }

  // Settlement calculation
  const balances: Record<string, number> = {}
  members.forEach(m => balances[m.user_id] = 0)

  expenses.forEach(exp => {
    const splitCount = exp.split_with.length || 1
    const perPerson = exp.amount / splitCount
    balances[exp.paid_by] = (balances[exp.paid_by] || 0) + exp.amount
    exp.split_with.forEach(uid => {
      balances[uid] = (balances[uid] || 0) - perPerson
    })
  })

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#1a4731] text-white rounded-2xl p-5">
        <p className="text-green-300 text-sm">Total spent</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p>
        <p className="text-green-300 text-xs mt-1">{expenses.length} expenses across {members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Settlement */}
      {members.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Settlement</h2>
          <div className="space-y-2">
            {members.map(m => {
              const bal = balances[m.user_id] || 0
              return (
                <div key={m.user_id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{m.profiles?.full_name || 'User'}</span>
                  <span className={bal >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                    {bal >= 0 ? '+' : ''}{formatCurrency(bal)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={16} /> Add expense
      </button>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addExpense} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">New expense</h3>
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              required
              min="0"
              step="0.01"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(['transport','food','accommodation','adventure','spiritual','shopping','other'] as Category[]).map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Paid by</label>
            <select
              value={form.paid_by}
              onChange={e => setForm(p => ({ ...p, paid_by: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {members.map(m => <option key={m.user_id} value={m.user_id}>{memberName(m.user_id)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Split with</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <label key={m.user_id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.split_with.includes(m.user_id)}
                    onChange={e => setForm(p => ({
                      ...p,
                      split_with: e.target.checked
                        ? [...p.split_with, m.user_id]
                        : p.split_with.filter(id => id !== m.user_id)
                    }))}
                    className="accent-emerald-600"
                  />
                  {memberName(m.user_id)}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1">
              {loading && <Loader2 size={14} className="animate-spin" />} Add
            </button>
          </div>
        </form>
      )}

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">💰</span>
            <p className="text-sm">No expenses yet</p>
          </div>
        )}
        {expenses.map(exp => (
          <div key={exp.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_ICONS[exp.category || 'other']}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{exp.description || exp.category}</p>
                <p className="text-xs text-gray-500">Paid by {memberName(exp.paid_by)} · {formatDate(exp.created_at, 'dd MMM')}</p>
                <p className="text-xs text-gray-400">Split: {exp.split_with.length} people</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{formatCurrency(exp.amount)}</span>
              {exp.paid_by === currentUserId && (
                <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
