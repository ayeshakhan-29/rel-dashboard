'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from '@/app/components/auth/PrivateRoute';
import { ringcentralTeams, Team, TeamMessage } from '@/app/services/ringcentralService';
import TeamChat from '@/app/components/ringcentral/TeamChat';

export default function TeamsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [messages, setMessages] = useState<TeamMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTeams();
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            loadTeamMessages(selectedTeam.id);
        }
    }, [selectedTeam]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ringcentralTeams.getTeams();
            setTeams(response.teams);
            if (response.teams.length > 0 && !selectedTeam) {
                setSelectedTeam(response.teams[0]);
            }
        } catch (err: any) {
            console.error('Error loading teams:', err);
            setError(err.message || 'Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const loadTeamMessages = async (groupId: string) => {
        try {
            setError(null);
            const response = await ringcentralTeams.getTeamMessages(groupId);
            setMessages(response.messages);
        } catch (err: any) {
            console.error('Error loading team messages:', err);
            setError(err.message || 'Failed to load messages');
        }
    };

    const handleMessageSent = () => {
        if (selectedTeam) {
            loadTeamMessages(selectedTeam.id);
        }
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header title="Team Messaging" onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Messaging</h1>
                                <p className="text-slate-600">Chat with your team members</p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mb-4"></div>
                                    <p className="text-sm font-medium text-slate-600">Loading teams...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Teams Sidebar */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Teams</h2>
                                        <div className="space-y-2">
                                            {teams.map((team) => (
                                                <button
                                                    key={team.id}
                                                    onClick={() => setSelectedTeam(team)}
                                                    className={`w-full text-left p-3 rounded-lg ${
                                                        selectedTeam?.id === team.id
                                                            ? 'bg-blue-100 border-2 border-blue-500'
                                                            : 'hover:bg-gray-100 border-2 border-transparent'
                                                    }`}
                                                >
                                                    <p className="font-medium">{team.name}</p>
                                                    {team.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{team.description}</p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        {selectedTeam ? (
                                            <TeamChat
                                                team={selectedTeam}
                                                messages={messages}
                                                onMessageSent={handleMessageSent}
                                            />
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>Select a team to start chatting</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </PrivateRoute>
    );
}
