import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    toast.success('Password changed (placeholder)');
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="card max-w-md"><h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input className="input" type="password" placeholder="Current password" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} required />
          <input className="input" type="password" placeholder="New password" value={password.new} onChange={e => setPassword({...password, new: e.target.value})} required minLength={8} />
          <input className="input" type="password" placeholder="Confirm new password" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} required />
          <button className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
}
