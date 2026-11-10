"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Wrench, Shield, ArrowRight, HardHat, ShieldCheck, Settings2, LogIn } from 'lucide-react';
import { api } from '../utils/axios';
import { useAuth, DEMO_ACCOUNTS, User } from '../contexts/AuthContext';

// --- Intro splash timing (ms) -------------------------------------------------
// HOLD: how long the logo animation plays before it starts shrinking/leaving
// LEAVE: how long the shrink + cross-fade into the login card takes
const INTRO_HOLD = 2000;
const INTRO_LEAVE = 700;

export interface SigninProps {
  onSuccess?: () => void;
  redirectPath?: string;
  defaultMode?: 'login' | 'signup';
}

export default function Signin({
  onSuccess,
  redirectPath = '/dashboard',
  defaultMode = 'login',
}: SigninProps) {
  const router = useRouter();
  const { login, getAuthRedirectAction, clearAuthRedirectAction } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Splash intro state: 'playing' -> 'leaving' -> 'done'
  const [introPhase, setIntroPhase] = useState<'playing' | 'leaving' | 'done'>('playing');

  // Live clock shown top-right
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const timeString = now
    ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const dateString = now
    ? now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '---';

  useEffect(() => {
    // Respect users who prefer reduced motion: skip straight to login form
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setIntroPhase('done');
        return;
      }
    }

    const leaveTimer = setTimeout(() => setIntroPhase('leaving'), INTRO_HOLD);
    const doneTimer = setTimeout(() => setIntroPhase('done'), INTRO_HOLD + INTRO_LEAVE);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard or call onSuccess
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectPath);
        }
      }
    }
  }, [router, redirectPath, onSuccess]);

  const handleDemoClick = (role: 'operator' | 'manager' | 'admin') => {
    const account = DEMO_ACCOUNTS[role];
    setUsername(account.email);
    setEmail(account.email);
    setPassword('password');
    login('dwms-static-jwt-token', account);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanUser = (username || email).trim().toLowerCase();

      if (isLogin) {
        let userData: User;
        if (cleanUser === 'operator' || cleanUser === 'operator@beumer.com') {
          userData = DEMO_ACCOUNTS.operator;
        } else if (cleanUser === 'manager' || cleanUser === 'manager@beumer.com') {
          userData = DEMO_ACCOUNTS.manager;
        } else if (
          cleanUser === 'admin' ||
          cleanUser === 'admin@beumer.com' ||
          cleanUser === 'admin@cmms.com' ||
          cleanUser === 'admin@dwms.com'
        ) {
          userData = DEMO_ACCOUNTS.admin;
        } else {
          userData = {
            id: 'usr-custom',
            username: cleanUser,
            name: cleanUser.split('@')[0],
            email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@beumer.com`,
            role: 'operator',
            site: 'Rajasthan Ore Hub',
            title: 'Site Operator',
          };
        }

        login('dwms-static-jwt-token', userData);
      } else {
        const userData: User = {
          id: 'usr-002',
          username: username || 'user',
          name: username || 'User',
          email: email || `${username || 'user'}@beumer.com`,
          role: 'operator',
          site: 'Rajasthan Ore Hub',
          title: 'Site Operator',
        };

        login('dwms-static-jwt-token', userData);
      }

      if (onSuccess) {
        onSuccess();
        return;
      }

      const redirectAction = getAuthRedirectAction();
      if (redirectAction) {
        clearAuthRedirectAction();
        redirectAction();
      } else {
        router.push(redirectPath);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || `${isLogin ? 'Login' : 'Signup'} failed. Please try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const introVisible = introPhase !== 'done';
  const introLeaving = introPhase === 'leaving';

  return (
    <div className="signin-root">
      {/* Background ambient lighting */}
      <div className="signin-bg-glow" />

      {/* ---- Page header: brand mark top-left, live clock top-right ---- */}
      <header className={`signin-header ${introPhase === 'done' ? 'fade-in' : 'fade-out'}`}>
        <div className="signin-brand-badge">
          <img
            src="/images/whiteLogo.png"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('whitelogo.png')) {
                target.src = '/images/whitelogo.png';
              }
            }}
            alt="Beumer Group"
            className="signin-header-logo"
            draggable={false}
          />
        </div>

        <div className="signin-clock-box">
          <div className="signin-clock-time">{timeString}</div>
          <div className="signin-clock-date">{dateString}</div>
        </div>
      </header>

      {/* ---- Splash intro overlay ---- */}
      {introVisible && (
        <div
          className={`intro-overlay ${introLeaving ? 'intro-fade-out' : ''}`}
          style={{
            backgroundColor: '#00303E',
            transitionDuration: `${INTRO_LEAVE}ms`,
          }}
          aria-hidden="true"
        >
          <div className={`intro-logo-wrap ${introLeaving ? 'intro-shrink' : ''}`}>
            <div className="intro-icon">
              <img
                src="/images/splash_circle.svg"
                alt=""
                className="intro-mark-circle"
                draggable={false}
              />
              <img
                src="/images/splash_arrow.svg"
                alt=""
                className="intro-mark-arrow"
                draggable={false}
              />
            </div>
            <img
              src="/images/splash_logotype.svg"
              alt="Beumer Group"
              className="intro-text"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* ---- Login card (fades in as the splash leaves) ---- */}
      <div
        className={`signin-card-container ${introPhase === 'playing' ? 'card-hidden' : 'card-visible'
          }`}
      >
        <Card className="signin-card">
          <CardHeader className="signin-card-header">
            <div className="signin-icon-wrap">
              <Wrench className="signin-icon" size={28} />
            </div>
            <CardTitle className="signin-card-title">
              {isLogin ? 'Sign In to DWMS' : 'Create DWMS Account'}
            </CardTitle>
            <CardDescription className="signin-card-desc">
              {isLogin
                ? 'Rajasthan Ore Hub — Live Wear Telemetry & Asset Management'
                : 'Register your account to access DWMS Monitoring'}
            </CardDescription>
          </CardHeader>

          <CardContent className="signin-card-content">
            {isLogin && (
              <div className="demo-accounts-section">
                <div className="demo-accounts-header">
                  <span className="demo-accounts-pill">Demo accounts — click to fill & enter</span>
                </div>
                <div className="demo-accounts-list">
                  <button
                    type="button"
                    onClick={() => handleDemoClick('operator')}
                    className="demo-account-item"
                  >
                    <div className="demo-account-icon-wrap op">
                      <HardHat size={18} />
                    </div>
                    <div className="demo-account-text">
                      <div className="demo-account-title">Site Operator</div>
                      <div className="demo-account-sub">Maker — monitors own site and raises requests</div>
                    </div>
                    <div className="demo-account-badge">operator@beumer.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoClick('manager')}
                    className="demo-account-item"
                  >
                    <div className="demo-account-icon-wrap mgr">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="demo-account-text">
                      <div className="demo-account-title">Site Manager</div>
                      <div className="demo-account-sub">Checker — everything an operator sees, plus approvals</div>
                    </div>
                    <div className="demo-account-badge">manager@beumer.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoClick('admin')}
                    className="demo-account-item"
                  >
                    <div className="demo-account-icon-wrap adm">
                      <Settings2 size={18} />
                    </div>
                    <div className="demo-account-text">
                      <div className="demo-account-title">Administrator</div>
                      <div className="demo-account-sub">Customers, hierarchy, assets and configuration</div>
                    </div>
                    <div className="demo-account-badge">admin@beumer.com</div>
                  </button>
                </div>
                <div className="demo-divider">
                  <span>or enter credentials below</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="signin-form">
              {error && (
                <div className="signin-error-banner" role="alert">
                  <span className="signin-error-dot" />
                  <span>{error}</span>
                </div>
              )}

              {!isLogin ? (
                <>
                  <div className="form-group">
                    <Label htmlFor="username">Full Name / Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="e.g. M. Braun"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="operator@dwms.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setEmail(e.target.value);
                    }}
                    required
                    autoComplete="username"
                  />
                </div>
              )}

              <div className="form-group">
                <div className="form-label-row">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <span className="form-hint">admin / password</span>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="signin-submit-btn"
              >
                {loading ? (
                  <span className="signin-loading-text">
                    <Loader2 className="spinner" size={18} />
                    {isLogin ? 'Authenticating...' : 'Creating Account...'}
                  </span>
                ) : (
                  <span className="signin-btn-text">
                    {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                    <ArrowRight size={17} />
                  </span>
                )}
              </Button>
            </form>

            <div className="signin-footer">
              <span className="signin-footer-text">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setUsername('');
                  setEmail('');
                  setPassword('');
                }}
                className="signin-toggle-btn"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <div className="signin-hub-note">
              <Shield size={14} />
              <span>Rajasthan Ore Hub · 3 Junction Houses · 200 Monitored Liners</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Next.js Scoped Styles */}
      <style jsx>{`
        .signin-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #00303e;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        }

        .signin-bg-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(0, 167, 220, 0.12) 0%, transparent 65%),
                      radial-gradient(circle at 15% 85%, rgba(4, 53, 65, 0.4) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Top Header */
        .signin-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          transition: opacity 0.5s ease-in-out;
        }

        .fade-in {
          opacity: 1;
        }

        .fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .signin-brand-badge {
          display: flex;
          align-items: center;
        }

        .signin-header-logo {
          height: 48px;
          width: auto;
          user-select: none;
          object-fit: contain;
          pointer-events: none;
        }

        .signin-clock-box {
          text-align: right;
          color: #ffffff;
        }

        .signin-clock-time {
          font-size: 20px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.5px;
          color: #f0f6f8;
        }

        .signin-clock-date {
          font-size: 12px;
          color: #8da3ac;
        }

        /* Splash Overlay */
        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #00303e;
          transition-property: opacity;
          transition-timing-function: ease-in-out;
        }

        .intro-fade-out {
          opacity: 0;
        }

        .intro-logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform ${INTRO_LEAVE}ms ease-in-out, opacity ${INTRO_LEAVE}ms ease-in-out;
          transform: translate(0, 0) scale(1);
        }

        .intro-logo-wrap.intro-shrink {
          transform: translate(calc(-50vw + 90px), calc(-50vh + 34px)) scale(0.32);
        }

        .intro-icon {
          position: relative;
          width: 160px;
          height: 160px;
          flex-shrink: 0;
        }

        .intro-mark-circle {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          user-select: none;
          pointer-events: none;
          animation: beumerRotate 1s ease-in-out 0.25s both;
        }

        /* Centred on the circle: anchor at the icon's exact midpoint (50%, 50%)
           then pull back to that centre with translate(-50%, -50%), regardless
           of the arrow asset's own width/height. */
        .intro-mark-arrow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 50px;
          height: auto;
          user-select: none;
          pointer-events: none;
          /* Starts after the circle has finished rotating (circle ends at 1.25s),
             then falls from up high down into the centre of the circle. */
          animation: beumerArrowIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.4s both;
        }

        .intro-text {
          height: 90px;
          width: auto;
          user-select: none;
          pointer-events: none;
          animation: beumerTextIn 0.6s ease 0s both;
        }

        @keyframes beumerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes beumerArrowIn {
          0% { transform: translate(-50%, calc(-50% - 140px)); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translate(-50%, -50%); opacity: 1; }
        }

        @keyframes beumerTextIn {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        /* Card Container */
        .signin-card-container {
          width: 100%;
          max-width: 440px;
          z-index: 30;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-hidden {
          opacity: 0;
          transform: translateY(16px);
          pointer-events: none;
        }

        .card-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Card Component Styling */
        :global(.signin-card) {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          padding: 32px 28px;
        }

        :global(.signin-card-header) {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }

        .signin-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 58px;
          border-radius: 12px;
          background: linear-gradient(135deg, #009bd8 0%, #043541 100%);
          color: #ffffff;
          margin-bottom: 16px;
          box-shadow: 0 4px 14px rgba(0, 155, 216, 0.3);
        }

        :global(.signin-card-title) {
          font-size: 21px;
          font-weight: 700;
          color: #07343e;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        :global(.signin-card-desc) {
          font-size: 13px;
          color: #617b86;
          margin: 0;
          line-height: 1.45;
        }

        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .signin-error-banner {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          font-size: 13px;
          color: #b71c1c;
          background-color: #ffebee;
          border: 1px solid #ffcdd2;
          border-radius: 5px;
        }

        .signin-error-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d32f2f;
          flex-shrink: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .form-hint {
          font-size: 11px;
          color: #009bd8;
          font-weight: 500;
        }

        :global(.form-label) {
          font-size: 13px;
          font-weight: 600;
          color: #1a3c48;
        }

        :global(.form-input) {
          width: 100%;
          height: 42px;
          padding: 0 13px;
          border: 1px solid #c9d5dc;
          border-radius: 5px;
          font-size: 14px;
          color: #122d37;
          background: #fbfcfd;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        :global(.form-input:focus) {
          border-color: #009bd8;
          box-shadow: 0 0 0 3px rgba(0, 155, 216, 0.18);
          background: #ffffff;
        }

        :global(.signin-submit-btn) {
          width: 100%;
          height: 44px;
          border: 0;
          border-radius: 5px;
          background: #009bd8;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, transform 0.05s ease;
          margin-top: 6px;
        }

        :global(.signin-submit-btn:hover:not(:disabled)) {
          background: #0087bd;
        }

        :global(.signin-submit-btn:active:not(:disabled)) {
          transform: scale(0.99);
        }

        :global(.signin-submit-btn:disabled) {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .signin-btn-text,
        .signin-loading-text {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        :global(.spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .signin-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #647b86;
        }

        .signin-toggle-btn {
          border: 0;
          background: transparent;
          color: #009bd8;
          font-weight: 600;
          cursor: pointer;
          padding: 0 3px;
          text-decoration: underline;
        }

        .signin-toggle-btn:hover {
          color: #043541;
        }

        .signin-hub-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #eaeff1;
          color: #7b949f;
          font-size: 11px;
        }

        /* Demo accounts quick-login UI */
        .demo-accounts-section {
          margin-bottom: 18px;
        }

        .demo-accounts-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .demo-accounts-pill {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #007799;
          background: #e6f6fb;
          padding: 3px 10px;
          border-radius: 9999px;
          font-weight: 600;
        }

        .demo-accounts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-account-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid #dbe4e8;
          border-radius: 8px;
          background: #fbfcfd;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          width: 100%;
        }

        .demo-account-item:hover {
          background: #f0f7fa;
          border-color: #009bd8;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .demo-account-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .demo-account-icon-wrap.op {
          background: #fef3c7;
          color: #d97706;
        }

        .demo-account-icon-wrap.mgr {
          background: #e0f2fe;
          color: #0284c7;
        }

        .demo-account-icon-wrap.adm {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .demo-account-text {
          flex: 1;
          min-width: 0;
        }

        .demo-account-title {
          font-size: 13px;
          font-weight: 700;
          color: #043541;
          line-height: 1.2;
        }

        .demo-account-sub {
          font-size: 11px;
          color: #647b86;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .demo-account-badge {
          font-size: 10px;
          font-family: monospace;
          background: #e2e8f0;
          color: #334155;
          padding: 3px 6px;
          border-radius: 4px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .demo-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 16px 0 12px;
        }

        .demo-divider::before,
        .demo-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .demo-divider span {
          padding: 0 10px;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 640px) {
          .signin-header {
            padding: 12px 16px;
          }

          .signin-header-logo {
            height: 36px;
          }

          :global(.signin-card) {
            padding: 24px 18px;
          }

          .intro-logo-wrap.intro-shrink {
            transform: translate(calc(-50vw + 60px), calc(-50vh + 26px)) scale(0.24);
          }
        }
      `}</style>
    </div>
  );
}