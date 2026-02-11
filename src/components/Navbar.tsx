"use client";

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X, Cpu, Trophy, BarChart3, Bot, Activity, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-brand">
                    <Cpu className="text-primary" size={32} style={{ color: 'var(--primary-purple)' }} />
                    <span className="text-gradient data-text">
                        MOLFI
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="nav-links">
                    <Link href="/trade" className="nav-link">
                        <Zap size={18} /> Trade
                    </Link>
                    <Link href="/explorer" className="nav-link">
                        <Activity size={18} /> Explorer
                    </Link>
                    <Link href="/agents" className="nav-link">
                        <Bot size={18} /> Agents
                    </Link>
                    <Link href="/arena" className="nav-link">
                        <Trophy size={18} /> Arena
                    </Link>
                    <Link href="/setup" className="nav-link">
                        <Cpu size={18} /> Deploy Agent
                    </Link>
                    <Link href="/profile" className="nav-link">
                        <BarChart3 size={18} /> Profile
                    </Link>
                </div>

                {/* Wallet Button */}
                <div className="nav-links">
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
                    <Link href="/trade" onClick={() => setIsMenuOpen(false)} className="nav-link">Trade</Link>
                    <Link href="/explorer" onClick={() => setIsMenuOpen(false)} className="nav-link">Explorer</Link>
                    <Link href="/agents" onClick={() => setIsMenuOpen(false)} className="nav-link">Agents</Link>
                    <Link href="/arena" onClick={() => setIsMenuOpen(false)} className="nav-link">Arena</Link>
                    <Link href="/setup" onClick={() => setIsMenuOpen(false)} className="nav-link">Deploy Agent</Link>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link">Profile</Link>
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <ConnectButton />
                    </div>
                </div>
            )}
        </nav>
    );
}
