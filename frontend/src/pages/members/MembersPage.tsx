import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/ui/loading-spinner';
import ErrorState from '../../components/ui/error-state';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X } from 'lucide-react';
import Input from '../../components/ui/input';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const { data, loading, error, refetch } = useApi<{items:Array<{id:number;name:string;email:string;phone?:string;role:string;is_active:boolean}>}>('/users?limit=100');
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/crm/members', addForm);
      toast.success('Member assigned successfully');
      setShowAddModal(false);
      setAddForm({ email: '' });
      void refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading members..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = (data?.items || []).filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Name', render: (r: {name:string}) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-medium text-primary-400">{r.name?.[0]}</div>
        <span className="font-medium">{r.name}</span>
      </div>
    )},
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r: {role:string}) => <Badge variant="blue">{r.role}</Badge> },
    { key: 'is_active', header: 'Status', render: (r: {is_active:boolean}) => r.is_active?'Active':'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="text-dark-400 mt-1">Manage gym members</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<UserPlus size={16} />}>Add Member</Button>
      </motion.div>
      <div className="flex gap-3 max-w-sm">
        <Input placeholder="Search members..." icon={<Search size={16} />} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={filtered} emptyTitle="No members found" emptyDescription="Members will appear here once they register." />
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-dark-900 border border-dark-800 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add Member to CRM</h3>
                <button onClick={() => setShowAddModal(false)} className="text-dark-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Email *</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="member@example.com" 
                    value={addForm.email}
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  />
                  <p className="text-xs text-dark-500 mt-1">The user must already be registered in the system.</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
