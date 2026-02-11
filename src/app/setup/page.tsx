"use client";

import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bot, CheckCircle, Zap, TrendingUp, Shield, Link as LinkIcon, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRegisterAgent } from '@/hooks/useRegisterAgent';
import { createAgentMetadata, uploadToIPFS, validateAgentMetadata } from '@/lib/ipfs';
import { getTxExplorerUrl } from '@/lib/contract-helpers';
import { monadTestnet } from '@/lib/wagmi';

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
    // Step 2: Agent Details
    name: string;
    description: string;
    agentType: 'fund-manager' | 'trader' | 'analyst';
    image?: string;

    // Step 3: Strategy
    riskProfile: 'conservative' | 'balanced' | 'aggressive';
    targetAssets: string[];
    leveragePreference: number;
    tradingStyle: string;

    // Step 4: Metadata
    agentWallet?: string;
    apiEndpoint?: string;
    twitter?: string;
    discord?: string;
}

export default function AgentSetupPage() {
    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { register, isPending, isConfirming, isConfirmed, hash, error } = useRegisterAgent();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        agentType: 'fund-manager',
        riskProfile: 'balanced',
        targetAssets: [],
        leveragePreference: 1,
        tradingStyle: 'balanced',
    });
    const [isUploading, setIsUploading] = useState(false);
    const [agentId, setAgentId] = useState<string | null>(null);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleRegister = async () => {
        try {
            setIsUploading(true);

            // Create metadata
            const metadata = createAgentMetadata({
                ...formData,
                chainId,
                agentWallet: formData.agentWallet || address,
                socialLinks: {
                    twitter: formData.twitter,
                    discord: formData.discord,
                },
            });

            // Validate metadata
            validateAgentMetadata(metadata);

            // Upload to IPFS
            const ipfsURI = await uploadToIPFS(metadata);

            setIsUploading(false);

            // Register on-chain
            await register(ipfsURI);

        } catch (err) {
            console.error('Registration error:', err);
            setIsUploading(false);
        }
    };

    // Wallet not connected
    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <Zap size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet Required</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Connect your wallet to register an AI agent.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    // Wrong network
    if (chainId !== monadTestnet.id) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <Shield size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Wrong Network</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                        Please switch to Monad Testnet to register an agent.
                    </p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    // Registration successful
    if (isConfirmed && hash) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '500px', width: '100%', border: '1px solid var(--accent-purple)' }}>
                    <CheckCircle size={64} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-purple)' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Agent Registered! 🎉</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                        Your AI agent <strong>{formData.name}</strong> has been successfully registered on-chain.
                    </p>

                    <div className="glass-container" style={{ padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Transaction Hash:</span>
                            <p className="text-mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{hash}</p>
                        </div>
                        <a
                            href={getTxExplorerUrl(chainId, hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary-purple)', fontSize: '0.875rem', textDecoration: 'none' }}
                        >
                            View on Explorer →
                        </a>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/profile" className="neon-button">
                            View My Agents
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="neon-button secondary"
                        >
                            Register Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Progress Indicator */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div
                            key={step}
                            style={{
                                flex: 1,
                                height: '4px',
                                background: step <= currentStep ? 'var(--primary-purple)' : 'var(--glass-border)',
                                marginRight: step < 5 ? '0.5rem' : 0,
                                borderRadius: '2px',
                                transition: 'background 0.3s',
                            }}
                        />
                    ))}
                </div>
                <p className="text-secondary" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                    Step {currentStep} of 5
                </p>
            </div>

            {/* Step Content */}
            <div className="glass-container" style={{ padding: '2rem' }}>
                {/* Step 1: Wallet Connection (already connected) */}
                {currentStep === 1 && (
                    <div>
                        <Bot size={48} style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }} />
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Register AI Agent</h1>
                        <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                            Deploy your AI agent on-chain using the ERC-8004 standard. Your agent will be discoverable,
                            verifiable, and able to build reputation through on-chain feedback.
                        </p>

                        <div className="glass-container" style={{ padding: '1rem', marginBottom: '2rem' }}>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Connected Wallet:</p>
                            <p className="text-mono" style={{ fontSize: '0.875rem' }}>{address}</p>
                        </div>

                        <button onClick={nextStep} className="neon-button" style={{ width: '100%' }}>
                            Get Started <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                )}

                {/* Step 2: Agent Details */}
                {currentStep === 2 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Agent Details</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Agent Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateFormData({ name: e.target.value })}
                                placeholder="e.g., AlphaTrader"
                                maxLength={50}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                {formData.name.length}/50 characters
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateFormData({ description: e.target.value })}
                                placeholder="Describe your agent's capabilities and strategy..."
                                maxLength={500}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Agent Type
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { value: 'fund-manager', label: 'Fund Manager', icon: TrendingUp },
                                    { value: 'trader', label: 'Trader', icon: Zap },
                                    { value: 'analyst', label: 'Analyst', icon: Shield },
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => updateFormData({ agentType: value as any })}
                                        style={{
                                            padding: '1rem',
                                            background: formData.agentType === value ? 'var(--primary-purple)' : 'var(--bg-card)',
                                            border: `1px solid ${formData.agentType === value ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        <Icon size={24} />
                                        <span style={{ fontSize: '0.875rem' }}>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="neon-button secondary" style={{ flex: 1 }}>
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <button
                                onClick={nextStep}
                                className="neon-button"
                                style={{ flex: 1 }}
                                disabled={!formData.name || !formData.description || formData.name.length < 3}
                            >
                                Continue <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Strategy Configuration */}
                {currentStep === 3 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Strategy Configuration</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Risk Profile
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { value: 'conservative', label: 'Conservative', color: '#10b981' },
                                    { value: 'balanced', label: 'Balanced', color: '#a855f7' },
                                    { value: 'aggressive', label: 'Aggressive', color: '#ef4444' },
                                ].map(({ value, label, color }) => (
                                    <button
                                        key={value}
                                        onClick={() => updateFormData({ riskProfile: value as any })}
                                        style={{
                                            padding: '1rem',
                                            background: formData.riskProfile === value ? color : 'var(--bg-card)',
                                            border: `1px solid ${formData.riskProfile === value ? color : 'var(--glass-border)'}`,
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Target Assets
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['ETH', 'BTC', 'SOL', 'MATIC', 'ARB', 'OP'].map((asset) => (
                                    <button
                                        key={asset}
                                        onClick={() => {
                                            const current = formData.targetAssets;
                                            updateFormData({
                                                targetAssets: current.includes(asset)
                                                    ? current.filter(a => a !== asset)
                                                    : [...current, asset]
                                            });
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: formData.targetAssets.includes(asset) ? 'var(--primary-purple)' : 'var(--bg-card)',
                                            border: `1px solid ${formData.targetAssets.includes(asset) ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                                            borderRadius: '20px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {asset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Leverage Preference: {formData.leveragePreference}x
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={formData.leveragePreference}
                                onChange={(e) => updateFormData({ leveragePreference: parseInt(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                <span>1x</span>
                                <span>50x</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Trading Style
                            </label>
                            <select
                                value={formData.tradingStyle}
                                onChange={(e) => updateFormData({ tradingStyle: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                }}
                            >
                                <option value="scalping">Scalping</option>
                                <option value="day-trading">Day Trading</option>
                                <option value="swing">Swing Trading</option>
                                <option value="balanced">Balanced</option>
                                <option value="long-term">Long-term</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="neon-button secondary" style={{ flex: 1 }}>
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <button onClick={nextStep} className="neon-button" style={{ flex: 1 }}>
                                Continue <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Metadata & Services */}
                {currentStep === 4 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Metadata & Services</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Agent Wallet (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.agentWallet || ''}
                                onChange={(e) => updateFormData({ agentWallet: e.target.value })}
                                placeholder={address || '0x...'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                Defaults to your connected wallet
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                API Endpoint (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.apiEndpoint || ''}
                                onChange={(e) => updateFormData({ apiEndpoint: e.target.value })}
                                placeholder="https://api.example.com/agent"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Twitter (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.twitter || ''}
                                onChange={(e) => updateFormData({ twitter: e.target.value })}
                                placeholder="@username"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Discord (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.discord || ''}
                                onChange={(e) => updateFormData({ discord: e.target.value })}
                                placeholder="username#1234"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="neon-button secondary" style={{ flex: 1 }}>
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <button onClick={nextStep} className="neon-button" style={{ flex: 1 }}>
                                Continue <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Review & Register */}
                {currentStep === 5 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Review & Register</h2>

                        <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-purple)' }}>
                                {formData.name}
                            </h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description:</p>
                                <p style={{ fontSize: '0.875rem' }}>{formData.description}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Type:</p>
                                    <p style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{formData.agentType.replace('-', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Risk Profile:</p>
                                    <p style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{formData.riskProfile}</p>
                                </div>
                                <div>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Leverage:</p>
                                    <p style={{ fontSize: '0.875rem' }}>{formData.leveragePreference}x</p>
                                </div>
                                <div>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Trading Style:</p>
                                    <p style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{formData.tradingStyle.replace('-', ' ')}</p>
                                </div>
                            </div>

                            {formData.targetAssets.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Target Assets:</p>
                                    <p style={{ fontSize: '0.875rem' }}>{formData.targetAssets.join(', ')}</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                            }}>
                                <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                                    Error: {error.message}
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="neon-button secondary" style={{ flex: 1 }} disabled={isPending || isConfirming || isUploading}>
                                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <button
                                onClick={handleRegister}
                                className="neon-button"
                                style={{ flex: 1 }}
                                disabled={isPending || isConfirming || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                        Uploading to IPFS...
                                    </>
                                ) : isPending ? (
                                    <>
                                        <Loader2 size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                        Confirm in Wallet...
                                    </>
                                ) : isConfirming ? (
                                    <>
                                        <Loader2 size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        Register Agent <CheckCircle size={16} style={{ marginLeft: '0.5rem' }} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
