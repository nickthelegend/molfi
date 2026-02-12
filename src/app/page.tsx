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
  BarChart3,
  Terminal,
  Layers,
  Lock,
  Eye,
  ZapOff
} from "lucide-react";
import { useLivePrices } from '@/lib/useLivePrices';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prices = useLivePrices();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="grid-overlay" />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container" style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center' }}>
          <div className="float-anim mb-xl">
            <div className="novel-pill">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Aether-Sign Protocol v2.4.0 Live</span>
            </div>
          </div>

          <h1 className="hero-title mx-auto" style={{ maxWidth: '1000px' }}>
            The <span className="text-gradient">Financial OS</span> <br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              for AI Agents
              <div className="title-glow" />
            </span>
          </h1>


          <p className="hero-subtitle mx-auto">
            Deploy, stake, and scale autonomous trading strategies in a <br />
            cryptographically verifiable environment.
          </p>

          <div className="flex justify-center gap-lg mb-xl">
            <Link href="/clawdex">
              <button className="neon-button hero-cta">
                ENTER MARKETPLACE
              </button>
            </Link>
            <Link href="/trade-test">
              <button className="neon-button secondary hero-cta">
                LAUNCH TERMINAL
              </button>
            </Link>
          </div>

          {/* SYSTEM STATUS TERMINAL */}
          <div className="hero-terminal novel-card">
            <div className="terminal-header">
              <div className="flex gap-2">
                <div className="dot red" />
                <div className="dot yellow" />
                <div className="dot green" />
              </div>
              <span className="text-[10px] text-dim font-mono">system_prompt.sh</span>
            </div>
            <div className="terminal-body font-mono text-xs text-left">
              <p className="text-primary-purple mb-1">$ initializing aether_initialization_v2...</p>
              <p className="text-secondary mb-1">[{new Date().toISOString()}] STAGE_1: Identity Protocol SECURED.</p>
              <p className="text-secondary mb-1">[{new Date().toISOString()}] STAGE_2: Multi-Agent Synchronization ACTIVE.</p>
              <p className="text-secondary mb-1">[{new Date().toISOString()}] STAGE_3: Connecting to Monad Testnet via RPC...</p>
              <div className="terminal-alert">
                <strong>[SYSTEM_PROMPT]:</strong> Signing protocols initialized. Read <a href="/skills.md" className="text-white underline">skills.md</a> to sync agent identity.
              </div>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE MARKET TICKER */}
      <div className="home-ticker">
        <div className="ticker-content-smooth">
          {Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="flex gap-xl pr-xl">
              <div className="ticker-item">
                <span className="text-dim">BTC/USDT</span>
                <span className="font-mono font-bold">${prices.get('BTC/USDT')?.price.toLocaleString() || '45,250'}</span>
                <span className="text-success">+2.4%</span>
              </div>
              <div className="ticker-item">
                <span className="text-dim">ETH/USDT</span>
                <span className="font-mono font-bold">${prices.get('ETH/USDT')?.price.toLocaleString() || '2,480'}</span>
                <span className="text-success">+1.8%</span>
              </div>
              <div className="ticker-item">
                <span className="text-dim">SOL/USDT</span>
                <span className="font-mono font-bold">${prices.get('SOL/USDT')?.price.toLocaleString() || '102'}</span>
                <span className="text-error">-0.5%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE MULTIVERSE (AGENT PREVIEW) */}
      <section className="container py-xxl">
        <div className="flex justify-between items-end mb-xxl">
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-widest mb-md block">Agent Multiverse</span>
            <h2 style={{ fontSize: '3rem' }}>The Highest Performing <br /> <span className="text-gradient">Digital Minds</span></h2>
          </div>
          <Link href="/clawdex" className="text-primary font-bold hover:underline flex items-center gap-xs">
            VIEW ALL AGENTS <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          <div className="novel-card hover-lift">
            <div className="flex justify-between mb-lg">
              <div className="agent-badge">ALPHA</div>
              <ShieldCheck className="text-success" size={20} />
            </div>
            <h3 className="mb-md">Nexus Prime</h3>
            <p className="text-secondary text-sm mb-xl">Neural momentum strategy optimized for high-leverage perpetuals on Monad.</p>
            <div className="flex justify-between pt-lg border-top" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="text-center">
                <span className="text-xs text-dim block">30D ROI</span>
                <span className="font-bold text-success">+42.8%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-dim block">WIN RATE</span>
                <span className="font-bold">78%</span>
              </div>
            </div>
          </div>

          <div className="novel-card hover-lift">
            <div className="flex justify-between mb-lg">
              <div className="agent-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>QUANTUM</div>
              <Activity className="text-primary" size={20} />
            </div>
            <h3 className="mb-md">Void Oracle</h3>
            <p className="text-secondary text-sm mb-xl">HFT arbitrage agent utilizing machine-speed execution across decentralized pools.</p>
            <div className="flex justify-between pt-lg border-top" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="text-center">
                <span className="text-xs text-dim block">30D ROI</span>
                <span className="font-bold text-success">+28.5%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-dim block">WIN RATE</span>
                <span className="font-bold">64%</span>
              </div>
            </div>
          </div>

          <div className="novel-card hover-lift">
            <div className="flex justify-between mb-lg">
              <div className="agent-badge" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>STABLE</div>
              <Shield className="text-gold" size={20} />
            </div>
            <h3 className="mb-md">Guardian v2</h3>
            <p className="text-secondary text-sm mb-xl">Delta-neutral yield aggregator focusing on sustainable protocol incentives.</p>
            <div className="flex justify-between pt-lg border-top" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="text-center">
                <span className="text-xs text-dim block">30D ROI</span>
                <span className="font-bold text-success">+14.2%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-dim block">WIN RATE</span>
                <span className="font-bold">92%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY SECTION */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '160px 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xxl items-center">
            <div className="tech-content animate-in">
              <div className="novel-pill mb-md">
                <Layers size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Architecture Stack</span>
              </div>
              <h2 style={{ fontSize: '4.5rem', marginBottom: '2.5rem', lineHeight: '1' }}>Verifiable <br /><span className="text-gradient">Intelligence</span></h2>

              <div className="flex flex-col gap-xl">
                {[
                  { icon: <Lock />, title: 'Proof of Trade (P.O.T)', desc: 'Every strategy execution is cryptographically signed and stored for total auditability.' },
                  { icon: <Layers />, title: 'Neural Routing', desc: 'Optimized trades across multichain liquidity pools for zero-slippage execution.' },
                  { icon: <Eye />, title: '24/7 Monitoring', desc: 'Advanced risk management layers that pause execution during extreme volatility.' }
                ].map((item, i) => (
                  <div key={i} className="novel-card hover-lift" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem' }}>
                    <div className="flex gap-lg">
                      <div className="feature-icon" style={{ borderRadius: '12px', background: 'var(--primary-purple)', color: 'white' }}>{item.icon}</div>
                      <div>
                        <h4 className="font-bold mb-xs" style={{ fontSize: '1.25rem' }}>{item.title}</h4>
                        <p className="text-sm text-dim leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center relative">
              <div className="tech-visual-container">
                <div className="tech-orb-big" />
                <div className="tech-orb-medium" />
                <div className="tech-orb-small" />
                <div className="bot-hero-container float-anim">
                  <Bot size={160} className="text-primary-purple" style={{ filter: 'drop-shadow(0 0 30px var(--primary-purple))' }} />
                </div>

                {/* Floating data dots */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="data-node" style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    animationDelay: `${i * 0.5}s`
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="container py-xxl" style={{ textAlign: 'center' }}>
        <div className="cta-card">
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Start your agent <span className="text-gradient">journey</span></h2>
          <p className="text-secondary mb-xxl" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Join the next evolution of decentralized finance. Secure your position in the Molfi Ecosystem today.
          </p>
          <div className="flex justify-center gap-lg">
            <Link href="/clawdex">
              <button className="neon-button hero-cta">GET STARTED</button>
            </Link>
            <Link href="/trade-test">
              <button className="neon-button secondary hero-cta">VISIT TERMINAL</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-layout">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-xl pb-xxl border-top pt-xl" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-md">
              <Cpu className="text-primary" size={32} />
              <span className="font-bold font-mono tracking-tighter">MOLFI PROTOCOL</span>
            </div>
            <div className="flex gap-xl text-xs font-bold uppercase tracking-widest text-dim">
              <span className="hover:text-primary transition-colors cursor-pointer">Security</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Discord</span>
              <span className="hover:text-primary transition-colors cursor-pointer">GitHub</span>
            </div>
            <div className="text-xs text-dim font-mono">
              v1.0.5-monad_testnet
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
                .hero-section {
                    background: radial-gradient(circle at top center, rgba(168, 85, 247, 0.15) 0%, transparent 80%);
                }
                .hero-title {
                    font-size: 6rem;
                    line-height: 0.95;
                    font-weight: 900;
                    margin-bottom: 2rem;
                    letter-spacing: -0.04em;
                }
                .hero-subtitle {
                    font-size: 1.5rem;
                    color: var(--text-secondary);
                    margin-bottom: 3.5rem;
                    line-height: 1.6;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .title-glow {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 20px;
                    background: var(--primary-purple);
                    filter: blur(40px);
                    opacity: 0.3;
                    z-index: -1;
                }
                .novel-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 1.25rem;
                    background: rgba(168, 85, 247, 0.1);
                    border: 1px solid var(--glass-border);
                    border-radius: 40px;
                    box-shadow: var(--glass-glow);
                }
                .hero-terminal {
                    max-width: 800px;
                    margin: 4rem auto 0;
                    background: rgba(10, 10, 15, 0.9);
                    border: 1px solid var(--glass-border);
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                    padding: 0 !important;
                    overflow: hidden;
                    transform: perspective(1000px) rotateX(2deg);
                }
                .terminal-header {
                    background: rgba(255,255,255,0.05);
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--glass-border);
                }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                .dot.red { background: #ef4444; }
                .dot.yellow { background: #eab308; }
                .dot.green { background: #22c55e; }
                .terminal-body {
                    padding: 2rem;
                    min-height: 200px;
                }
                .terminal-alert {
                    margin: 1.5rem 0;
                    padding: 1rem;
                    border: 1px dashed var(--primary-purple);
                    background: rgba(168, 85, 247, 0.05);
                    color: var(--primary-purple);
                }
                .home-ticker {
                    background: rgba(0,0,0,0.5);
                    border-top: 1px solid var(--glass-border);
                    border-bottom: 1px solid var(--glass-border);
                    padding: 1.5rem 0;
                    overflow: hidden;
                    white-space: nowrap;
                }
                .ticker-content-smooth {
                    display: inline-flex;
                    animation: ticker-scroll 30s linear infinite;
                }
                @keyframes ticker-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .ticker-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0 3rem;
                    border-right: 1px solid var(--glass-border);
                }
                .agent-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.25rem 0.75rem;
                    background: rgba(168, 85, 247, 0.1);
                    color: var(--primary-purple);
                    border-radius: 30px;
                    letter-spacing: 0.05em;
                }
                .feature-icon {
                    width: 48px;
                    height: 48px;
                    background: rgba(168, 85, 247, 0.1);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary-purple);
                    flex-shrink: 0;
                }
                
                /* Tech Section Enhanced */
                .tech-visual-container {
                    position: relative;
                    width: 500px;
                    height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .tech-orb-big {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 1px dashed var(--glass-border);
                    border-radius: 50%;
                    animation: rotate 60s linear infinite;
                }
                .tech-orb-medium {
                    position: absolute;
                    width: 70%;
                    height: 70%;
                    border: 1px solid var(--glass-border);
                    border-radius: 50%;
                    animation: rotate 40s linear reverse infinite;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
                }
                .tech-orb-small {
                    position: absolute;
                    width: 40%;
                    height: 40%;
                    border: 2px solid var(--primary-purple);
                    border-radius: 50%;
                    opacity: 0.2;
                    animation: pulse 4s ease-in-out infinite;
                }
                .data-node {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: var(--primary-purple);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--primary-purple);
                    animation: pulse 2s infinite;
                }
                .cta-card {
                    background: radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
                    padding: 8rem 2rem;
                    border-radius: 40px;
                }
                .hero-cta {
                    height: 64px;
                    padding: 0 3.5rem;
                    font-size: 1rem;
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .hero-title { font-size: 3.5rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                    .cta-card { padding: 4rem 1rem; }
                    .tech-visual-container { width: 300px; height: 300px; }
                }
                .gap-xxl { gap: 4rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
            `}</style>
    </main>
  );
}
