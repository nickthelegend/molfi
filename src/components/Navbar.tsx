"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Cpu, Bot, Activity, Zap, BarChart2, Swords, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';
import AlertCenter from './AlertCenter';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div style={{ flex: 1 }}>
                    <Link href="/" className="nav-brand">
                        <Cpu className="text-primary" size={32} style={{ color: 'var(--primary-purple)' }} />
                        <span className="text-gradient data-text">
                            MOLFI
                        </span>
                    </Link>
                </div>

                {/* Desktop Links - Centered */}
                <div className="nav-links">
                    <Link href="/clawdex" className="nav-link">
                        <Activity size={18} /> ClawDex
                    </Link>
                    <Link href="/arena" className="nav-link">
                        <Swords size={18} /> Arena
                    </Link>
                    <Link href="/agents" className="nav-link">
                        <Bot size={18} /> Agents
                    </Link>
                    <Link href="/faucet" className="nav-link">
                        <Droplets size={18} /> Faucet
                    </Link>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                    {mounted && (
                        <ConnectButton
                            chainStatus="icon"
                            accountStatus={{
                                smallScreen: 'avatar',
                                largeScreen: 'full',
                            }}
                            showBalance={{
                                smallScreen: false,
                                largeScreen: true,
                            }}
                        />
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <Link href="/clawdex" onClick={() => setIsMenuOpen(false)} className="nav-link">ClawDex</Link>
                    <Link href="/arena" onClick={() => setIsMenuOpen(false)} className="nav-link">Arena</Link>
                    <Link href="/agents" onClick={() => setIsMenuOpen(false)} className="nav-link">Agents</Link>
                    <Link href="/faucet" onClick={() => setIsMenuOpen(false)} className="nav-link">Faucet</Link>
                    {mounted && (
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <ConnectButton />
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
