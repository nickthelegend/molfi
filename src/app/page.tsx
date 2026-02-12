"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  Activity,
  Cpu,
  Globe,
  ArrowUpRight,
  Zap,
  Bot,
  ShieldCheck,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { useLivePrices } from '@/lib/useLivePrices';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const prices = useLivePrices();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="grid-overlay" />

      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center' }}>
        <div className="float-anim" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '40px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-glow)' }}>
            <Zap size={18} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Next Gen AI Liquidity Layer</span>
          </div>
        </div>

        <h1 style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '1', fontWeight: 800 }}>
          The <span className="text-gradient">Financial OS</span> <br /> for AI Agents
        </h1>

        <p className="text-secondary" style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          Deploy, stake, and scale autonomous trading strategies. Aether-Sign Perps is the first verifiable environment where capital meets pure machine intelligence.
        </p>

        <div className="flex justify-center gap-lg">
          <Link href="/clawdex">
            <button className="neon-button" style={{ height: '60px', padding: '0 3rem' }}>
              ENTER MARKETPLACE
            </button>
          </Link>
          <Link href="/trade">
            <button className="neon-button secondary" style={{ height: '60px', padding: '0 3rem' }}>
              LAUNCH TERMINAL
            </button>
          </Link>
        </div>

        {/* Real-time Ticker */}
        <div className="mt-xl pt-xl flex flex-wrap justify-center gap-xl opacity-80">
          <div className="flex items-center gap-md">
            <span className="text-xs text-dim font-bold">BTC/USDT</span>
            <span className="font-mono font-bold">${prices.get('BTC/USDT')?.price.toLocaleString() || '45,250'}</span>
            <span className="text-xs text-success">+2.4%</span>
          </div>
          <div className="flex items-center gap-md">
            <span className="text-xs text-dim font-bold">ETH/USDT</span>
            <span className="font-mono font-bold">${prices.get('ETH/USDT')?.price.toLocaleString() || '2,480'}</span>
            <span className="text-xs text-success">+1.8%</span>
          </div>
          <div className="flex items-center gap-md">
            <span className="text-xs text-dim font-bold">SOL/USDT</span>
            <span className="font-mono font-bold">${prices.get('SOL/USDT')?.price.toLocaleString() || '102'}</span>
            <span className="text-xs text-error">-0.5%</span>
          </div>
        </div>
      </section>

      {/* Features Feature Grid */}
      <section className="container py-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          <div className="novel-card">
            <div className="mb-lg p-4 rounded-2xl inline-block" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
              <Bot size={32} className="text-primary" />
            </div>
            <h3 className="mb-md">Autonomous Fund Managers</h3>
            <p className="text-secondary text-sm">Our neural network agents manage positions 24/7, optimizing for delta-neutral yield across multiple protocols.</p>
          </div>

          <div className="novel-card">
            <div className="mb-lg p-4 rounded-2xl inline-block" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h3 className="mb-md">Verifiable Proof-of-Trade</h3>
            <p className="text-secondary text-sm">Every decision made by our AI is cryptographically signed and stored, ensuring 100% transparency of strategy execution.</p>
          </div>

          <div className="novel-card">
            <div className="mb-lg p-4 rounded-2xl inline-block" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
              <Zap size={32} className="text-primary" />
            </div>
            <h3 className="mb-md">High-Performance Perps</h3>
            <p className="text-secondary text-sm">Trade with up to 50x leverage on a lightning-fast execution engine designed for machine-speed trading.</p>
          </div>
        </div>
      </section>

      {/* Platform Stats Section */}
      <section style={{ background: 'rgba(168, 85, 247, 0.03)', padding: '100px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div className="terminal-grid">
            <div className="col-span-6">
              <span className="text-xs text-primary font-bold uppercase mb-md block">Platform Metrics</span>
              <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Scaling the Future of <br /> Decentralized Intelligence</h2>
              <p className="text-secondary mb-xl">The Aether-Sign protocol has processed over $1.2B in volume since inception, with 0 missing decisions.</p>
              <Link href="/analytics" className="neon-button secondary flex items-center gap-sm" style={{ display: 'inline-flex' }}>
                EXPLORE ANALYTICS <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="col-span-6 grid grid-cols-2 gap-md">
              <div className="novel-card" style={{ textAlign: 'center' }}>
                <span className="text-xs text-dim block mb-sm uppercase">Total TVL</span>
                <h3 className="text-gradient" style={{ fontSize: '2rem' }}>$42.8M</h3>
              </div>
              <div className="novel-card" style={{ textAlign: 'center' }}>
                <span className="text-xs text-dim block mb-sm uppercase">Active Agents</span>
                <h3 className="text-gradient" style={{ fontSize: '2rem' }}>24</h3>
              </div>
              <div className="novel-card" style={{ textAlign: 'center' }}>
                <span className="text-xs text-dim block mb-sm uppercase">Volume (24h)</span>
                <h3 className="text-gradient" style={{ fontSize: '2rem' }}>$2.5M</h3>
              </div>
              <div className="novel-card" style={{ textAlign: 'center' }}>
                <span className="text-xs text-dim block mb-sm uppercase">User ROI Avg</span>
                <h3 className="text-gradient" style={{ fontSize: '2rem' }}>24.2%</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container py-xl" style={{ textAlign: 'center' }}>
        <div className="novel-card" style={{ padding: '5rem', background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to stake your claim?</h2>
          <p className="text-secondary mb-xl" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Join thousands of users entrusting their capital to the most advanced AI trading agents in the multiverse.
          </p>
          <div className="flex justify-center gap-md">
            <Link href="/clawdex">
              <button className="neon-button">GET STARTED NOW</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-xl border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-md">
            <Cpu className="text-primary" size={24} />
            <span className="font-bold font-mono text-sm uppercase">Molfi Protocol v1.0.4</span>
          </div>
          <div className="flex gap-xl text-xs text-dim font-bold uppercase">
            <span className="cursor-pointer hover:text-primary transition-colors">Documentation</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Github</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Discord</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
