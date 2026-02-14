import React from 'react';
import { Cpu, Zap } from 'lucide-react';

const NeuralLoader = ({ message = "ESTABLISHING NEURAL LINK" }: { message?: string }) => {
    return (
        <div className="neural-loader-container">
            <div className="loader-core">
                <div className="core-inner" />
                <div className="core-ring" />
                <div className="core-orbit" />
            </div>

            <div className="loading-text-wrapper">
                <div className="scramble-text">
                    <Zap size={14} className="text-primary-purple inline-block mr-2 animate-pulse" />
                    {message}
                </div>
                <div className="loading-bar">
                    <div className="loading-bar-fill" />
                </div>
                <div className="system-status">
                    <span>MEM_INTEGRITY: 100%</span>
                    <span>UPLINK: STABLE</span>
                </div>
            </div>

            <style jsx>{`
        .neural-loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 2rem;
            width: 100%;
        }

        .loader-core {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .core-inner {
            width: 40px;
            height: 40px;
            background: var(--primary-purple);
            border-radius: 50%;
            box-shadow: 0 0 30px var(--primary-purple);
            animation: pulse-core 2s ease-in-out infinite;
            z-index: 10;
        }

        .core-ring {
            position: absolute;
            inset: 0;
            border: 2px solid rgba(168, 85, 247, 0.3);
            border-top-color: var(--primary-purple);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .core-orbit {
            position: absolute;
            inset: -15px;
            border: 1px dashed rgba(168, 85, 247, 0.2);
            border-radius: 50%;
            animation: spin-reverse 4s linear infinite;
        }

        .loading-text-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .scramble-text {
            font-family: var(--font-mono);
            color: var(--primary-purple);
            font-size: 0.9rem;
            letter-spacing: 0.1em;
            font-weight: 700;
            text-transform: uppercase;
            animation: glitch-text 3s infinite;
            display: flex;
            align-items: center;
        }

        .loading-bar {
            width: 200px;
            height: 2px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
        }

        .loading-bar-fill {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 30%;
            background: var(--primary-purple);
            box-shadow: 0 0 10px var(--primary-purple);
            animation: loading-scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .system-status {
            display: flex;
            gap: 1rem;
            font-size: 9px;
            color: var(--text-dim);
            font-family: var(--font-mono);
            opacity: 0.7;
            margin-top: 0.25rem;
        }

        @keyframes pulse-core {
            0%, 100% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 50px var(--primary-purple); }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
            to { transform: rotate(-360deg); }
        }

        @keyframes loading-scan {
            0% { left: -30%; width: 30%; }
            50% { width: 60%; }
            100% { left: 100%; width: 30%; }
        }
      `}</style>
        </div>
    );
};

export default NeuralLoader;
