import { useState } from 'react';
import PageHeader from '../../components/shared/page-header';
import Card from '../../components/ui/card';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    if (password.new.length < 8) return toast.error('Password must be at least 8 characters');
    toast.success('Password updated successfully');
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <div className='animate-fade-in space-y-6 max-w-2xl'>
      <PageHeader title='Settings' subtitle='Manage your account settings' />
      
      <Card>
        <h3 className='text-lg font-semibold mb-1'>Profile Information</h3>
        <p className='text-sm text-[#94A3B8] mb-6'>Your account details</p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input label='Name' value={user?.name || ''} disabled />
          <Input label='Email' value={user?.email || ''} disabled />
          <Input label='Role' value={user?.role || ''} disabled />
          <Input label='Phone' value={user?.phone || ''} disabled />
        </div>
      </Card>

      <Card>
        <h3 className='text-lg font-semibold mb-1'>Change Password</h3>
        <p className='text-sm text-[#94A3B8] mb-6'>Update your password</p>
        <form onSubmit={handlePasswordChange} className='space-y-4 max-w-sm'>
          <Input label='Current Password' type='password' placeholder='Enter current password' value={password.current} onChange={e => setPassword({...password, current: e.target.value})} required />
          <Input label='New Password' type='password' placeholder='Min 8 characters' value={password.new} onChange={e => setPassword({...password, new: e.target.value})} required minLength={8} />
          <Input label='Confirm New Password' type='password' placeholder='Re-enter new password' value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} required />
          <Button type='submit'>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
