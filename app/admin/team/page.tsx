'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AdminRoute from '@/app/components/auth/AdminRoute';
import { getAllUsers, deleteUser, updateUserById, User, UpdateUserData } from '@/app/services/userService';
import { useAuth } from '@/app/context/AuthContext';
import { 
    Plus, 
    Loader2, 
    Trash2, 
    Edit, 
    X, 
    Save, 
    Shield, 
    Mail, 
    User as UserIcon, 
    Calendar,
    Search,
    UserCheck,
    Briefcase
} from 'lucide-react';

export default function TeamManagementPage() {
    const router = useRouter();
    const { isAdmin: currentIsAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editFormData, setEditFormData] = useState<UpdateUserData>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredUsers(users.filter(u => 
                u.name.toLowerCase().includes(term) || 
                u.email.toLowerCase().includes(term) ||
                u.role.toLowerCase().includes(term)
            ));
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            
            // The API returns { success: true, message: ..., data: { users: [], total: ... } }
            // Extract the users array correctly
            const usersArray = response.data?.users || response.users || (Array.isArray(response) ? response : []);
            
            // Load all users for management
            const staff = [...usersArray];
            
            setUsers(staff);
            setFilteredUsers(staff);
        } catch (error: any) {
            console.error('Failed to load users:', error);
            setApiError(error.response?.data?.message || 'Unable to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this staff member? This will remove their dashboard access.')) {
            return;
        }

        try {
            setDeletingId(userId);
            await deleteUser(userId);
            setUsers((current) => current.filter((u) => u.id !== userId));
        } catch (error: any) {
            console.error('User deletion error:', error);
            setApiError(error.response?.data?.message || 'Unable to delete user.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            setUpdateLoading(true);
            await updateUserById(editingUser.id, editFormData);
            
            // Refresh the list
            await loadUsers();
            
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (error: any) {
            console.error('User update error:', error);
            alert(error.response?.data?.message || 'Failed to update user.');
        } finally {
            setUpdateLoading(false);
        }
    };

    // Helper to get role badge style
    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'admin':
                return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/30';
            case 'team':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
            case 'employee':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <AdminRoute>
            <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Team Management" onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 transition-colors duration-300">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-2xl font-semibold text-foreground">Staff & Team</h1>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage dashboard users and their access levels.</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search team..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:ring-1 focus:ring-emerald-500 transition-all min-w-[200px]"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/admin/team/register')}
                                        className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-emerald-500"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Member
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20 bg-card rounded-3xl border border-border transition-colors">
                                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                    </div>
                                ) : apiError ? (
                                    <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
                                        {apiError}
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="rounded-3xl border border-border bg-card p-12 text-center transition-colors">
                                        <UserIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground">No members found</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or add a new team member.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden transition-colors">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left text-sm">
                                                <thead className="border-b border-border bg-background transition-colors">
                                                    <tr>
                                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground h-12">User</th>
                                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground h-12">Email</th>
                                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground h-12">Role</th>
                                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground h-12">Joined</th>
                                                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-foreground h-12 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {filteredUsers.map((user) => (
                                                        <tr key={user.id} className="hover:bg-background transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 rounded-full bg-background dark:bg-slate-800 border border-border flex items-center justify-center text-foreground font-bold text-xs">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="font-bold text-foreground">{user.name}</div>
                                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tighter">ID: {user.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                                    <Mail className="h-3.5 w-3.5 mr-2 opacity-50" />
                                                                    {user.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border tracking-wider ${getRoleBadge(user.role)}`}>
                                                                    <Shield className="mr-1.5 h-3 w-3" />
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                <div className="flex items-center text-[13px]">
                                                                    <Calendar className="h-3.5 w-3.5 mr-2 opacity-50" />
                                                                    {new Date(user.created_at).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleEditClick(user)}
                                                                        className="p-2 text-slate-400 hover:text-foreground hover:bg-background rounded-xl border border-transparent hover:border-border transition-all"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(user.id)}
                                                                        disabled={deletingId === user.id}
                                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-all disabled:opacity-50"
                                                                    >
                                                                        {deletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200 transition-colors">
                        <div className="flex items-center justify-between border-b border-border p-6 bg-card transition-colors">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Edit Member</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Update access for {editingUser.name}</p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-full p-2 text-slate-400 hover:bg-background hover:text-foreground transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4 bg-background/50 transition-colors">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Assign Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="team">Team Member</option>
                                    <option value="admin">Administrator</option>
                                    <option value="employee">Employee</option>
                                    <option value="driver">Driver</option>
                                    <option value="passenger">Passenger</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-border mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="flex-1 inline-flex items-center justify-center rounded-2xl bg-slate-900 dark:bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {updateLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Update Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminRoute>
    );
}
