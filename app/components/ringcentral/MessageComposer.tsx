'use client';

import { useState } from 'react';
import { Send, MessageSquare, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { ringcentralMessages } from '@/app/services/ringcentralService';

interface MessageComposerProps {
    onMessageSent?: () => void;
}

export default function MessageComposer({ onMessageSent }: MessageComposerProps) {
    const [to, setTo] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'SMS' | 'MMS'>('SMS');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!to.trim() || !text.trim()) {
            setError('Please enter phone number and message');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            if (messageType === 'SMS') {
                await ringcentralMessages.sendSMS({ to, text });
            } else {
                // For MMS, you would need to handle file uploads
                setError('MMS with attachments not yet implemented in this UI');
                setLoading(false);
                return;
            }
            
            setSuccess('Message sent successfully!');
            setTo('');
            setText('');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
            
            if (onMessageSent) {
                onMessageSent();
            }
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || err.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const characterCount = text.length;
    const isNearLimit = characterCount > 1400;
    const isOverLimit = characterCount > 1600;

    return (
        <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="to" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    Recipient Phone Number
                </label>
                <input
                    type="tel"
                    id="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="messageType" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Message Type
                </label>
                <select
                    id="messageType"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as 'SMS' | 'MMS')}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900"
                    disabled={loading}
                >
                    <option value="SMS">SMS (Text Message)</option>
                    <option value="MMS">MMS (Multimedia Message)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="text" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    Message
                </label>
                <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message here..."
                    rows={5}
                    maxLength={1600}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400 resize-none ${
                        isOverLimit ? 'border-red-300' : isNearLimit ? 'border-yellow-300' : 'border-slate-200'
                    }`}
                    disabled={loading}
                />
                <div className="flex items-center justify-between">
                    <p className={`text-xs ${
                        isOverLimit ? 'text-red-600 font-semibold' : 
                        isNearLimit ? 'text-yellow-600' : 
                        'text-slate-500'
                    }`}>
                        {characterCount}/1,600 characters
                    </p>
                    {characterCount > 160 && (
                        <p className="text-xs text-slate-500">
                            {Math.ceil(characterCount / 160)} message{Math.ceil(characterCount / 160) > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !to.trim() || !text.trim() || isOverLimit}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                    </>
                )}
            </button>
        </form>
    );
}
