'use client';

import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Loader2, CheckCircle, XCircle } from 'lucide-react';
import paymentService, { SavedPaymentMethod } from '@/app/services/paymentService';

interface ChargeCustomerModalProps {
    userId: number;
    customerName: string;
    reservationId?: number;
    formBookingRef?: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChargeCustomerModal({ userId, customerName, reservationId, formBookingRef, onClose, onSuccess }: ChargeCustomerModalProps) {
    const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
    const [selectedPmId, setSelectedPmId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [charging, setCharging] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        loadPaymentMethods();
    }, [userId]);

    const loadPaymentMethods = async () => {
        setLoading(true);
        try {
            const methods = await paymentService.getPaymentMethods(userId);
            setPaymentMethods(methods);
            if (methods.length > 0) {
                setSelectedPmId(methods[0].id);
            }
        } catch (err) {
            console.error('Failed to load payment methods:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCharge = async () => {
        if (!selectedPmId || !amount || parseFloat(amount) <= 0 || !description.trim()) return;

        setCharging(true);
        setResult(null);

        try {
            const response = await paymentService.chargeCustomer(
                userId,
                selectedPmId,
                parseFloat(amount),
                description || undefined,
                reservationId,
                formBookingRef ?? undefined
            );

            if (response.success) {
                setResult({ type: 'success', message: `Charge of $${parseFloat(amount).toFixed(2)} successful!` });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setResult({ type: 'error', message: response.message || 'Payment failed' });
            }
        } catch (err: any) {
            setResult({ type: 'error', message: err.response?.data?.message || err.message || 'Payment failed' });
        } finally {
            setCharging(false);
        }
    };

    const cardIcon = (brand: string | null) => {
        const b = (brand || '').toLowerCase();
        if (b === 'visa') return '💳';
        if (b === 'mastercard') return '💳';
        if (b === 'amex' || b === 'american_express') return '💳';
        if (b === 'discover') return '💳';
        return '💳';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Charge {customerName}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-foreground text-2xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                            <span className="ml-2 text-sm text-slate-500">Loading saved cards...</span>
                        </div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No saved payment methods</p>
                            <p className="text-xs text-slate-400 mt-1">Customer needs to complete a booking first</p>
                        </div>
                    ) : (
                        <>
                            {/* Select Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-2">Saved Card</label>
                                <div className="space-y-2">
                                    {paymentMethods.map((pm) => (
                                        <label
                                            key={pm.id}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedPmId === pm.id
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-border hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={selectedPmId === pm.id}
                                                onChange={() => setSelectedPmId(pm.id)}
                                                className="sr-only"
                                            />
                                            <span className="text-lg mr-3">{cardIcon(pm.card_brand)}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    {pm.card_brand ? pm.card_brand.charAt(0).toUpperCase() + pm.card_brand.slice(1) : 'Card'} **** {pm.card_last4}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Expires {pm.card_exp_month}/{pm.card_exp_year}
                                                    {pm.is_default && <span className="ml-2 text-emerald-600 font-medium">Default</span>}
                                                </p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                selectedPmId === pm.id ? 'border-emerald-500' : 'border-slate-300'
                                            }`}>
                                                {selectedPmId === pm.id && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Amount ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.50"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Purpose */}
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Purpose <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g., Late fee, additional mileage"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                    result.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {result.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                                    {result.message}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    disabled={charging}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCharge}
                                    disabled={charging || !selectedPmId || !amount || parseFloat(amount) <= 0 || !description.trim()}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    {charging ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                    {charging ? 'Processing...' : `Charge $${amount ? parseFloat(amount).toFixed(2) : '0.00'}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
