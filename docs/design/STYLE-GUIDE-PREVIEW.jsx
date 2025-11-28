import React, { useState } from 'react';

// GHXSTSHIP Style Guide - Bold Contemporary Pop Art Adventure
// Visual preview of the rebuilt design system

export default function StyleGuide() {
  const [activeTab, setActiveTab] = useState('colors');
  const [isDark, setIsDark] = useState(true);
  
  const tabs = ['colors', 'typography', 'spacing', 'shadows', 'borders', 'buttons', 'inputs', 'cards', 'badges', 'patterns', 'animations'];
  
  // Theme-aware colors
  const theme = {
    bg: isDark ? '#0a0a0a' : '#fafafa',
    bgCard: isDark ? '#171717' : '#ffffff',
    text: isDark ? '#ffffff' : '#0a0a0a',
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    textFaint: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderLight: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    shadow: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.bg, 
      color: theme.text,
      transition: 'background-color 0.3s ease, color 0.3s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: theme.bg,
        borderBottom: `4px solid ${theme.border}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '-0.025em',
                margin: 0,
                color: theme.text
              }}>
                GHXSTSHIP Style Guide
              </h1>
              <p style={{ 
                fontSize: '14px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: theme.textMuted,
                margin: '4px 0 0 0'
              }}>
                Bold Contemporary Pop Art Adventure
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              style={{
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: isDark ? '2px solid #ffffff' : '2px solid #f59e0b',
                borderRadius: '0',
                backgroundColor: isDark ? '#ffffff' : '#f59e0b',
                color: isDark ? '#000000' : '#ffffff',
                cursor: 'pointer',
                boxShadow: isDark ? '3px 3px 0 rgba(255,255,255,0.3)' : '3px 3px 0 rgba(0,0,0,0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              {isDark ? '☀️ LIGHT' : '🌙 DARK'}
            </button>
          </div>
          
          {/* Tabs */}
          <nav style={{ display: 'flex', gap: '4px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: `2px solid ${activeTab === tab ? theme.text : theme.border}`,
                  borderRadius: '0',
                  backgroundColor: activeTab === tab ? theme.text : 'transparent',
                  color: activeTab === tab ? theme.bg : theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        
        {/* COLORS */}
        {activeTab === 'colors' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Color System
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Semantic color tokens preserved from existing design system
            </p>
            
            {/* Brand Colors */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Brand Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '48px' }}>
              {[
                { name: 'Primary', color: '#6366f1', desc: 'Main brand, CTAs' },
                { name: 'Secondary', color: '#8b5cf6', desc: 'Supporting accent' },
                { name: 'Accent', color: '#f59e0b', desc: 'Highlights, badges' },
                { name: 'Destructive', color: '#ef4444', desc: 'Errors, warnings' },
              ].map((item) => (
                <div key={item.name} style={{ 
                  border: `2px solid ${theme.border}`, 
                  padding: '16px',
                  boxShadow: `4px 4px 0 ${theme.shadow}`,
                  backgroundColor: theme.bgCard,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    height: '80px', 
                    marginBottom: '12px', 
                    border: `2px solid ${theme.border}`,
                    backgroundColor: item.color 
                  }} />
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0', color: theme.text }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '12px', margin: '0 0 4px 0', color: theme.textFaint }}>{item.color}</p>
                  <p style={{ fontSize: '12px', margin: 0, color: theme.textFaint }}>{item.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Neutral Scale */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Neutral Scale
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '48px' }}>
              {[
                { name: '950', color: '#0a0a0a' },
                { name: '900', color: '#171717' },
                { name: '800', color: '#262626' },
                { name: '700', color: '#404040' },
                { name: '600', color: '#525252' },
                { name: '500', color: '#737373' },
                { name: '400', color: '#a3a3a3' },
                { name: '300', color: '#d4d4d4' },
                { name: '200', color: '#e5e5e5' },
                { name: '100', color: '#f5f5f5' },
              ].map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    height: '48px', 
                    border: `2px solid ${theme.border}`,
                    marginBottom: '4px',
                    backgroundColor: item.color 
                  }} />
                  <p style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: theme.text }}>{item.name}</p>
                </div>
              ))}
            </div>
            
            {/* Status Colors */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Status Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Success', color: '#22c55e' },
                { name: 'Warning', color: '#f59e0b' },
                { name: 'Error', color: '#ef4444' },
                { name: 'Info', color: '#3b82f6' },
              ].map((item) => (
                <div key={item.name} style={{ 
                  padding: '16px',
                  border: `2px solid ${item.color}`,
                  backgroundColor: `${item.color}20`
                }}>
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0', color: item.color }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '12px', margin: 0, color: theme.textMuted }}>{item.color}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Typography
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Font families preserved • Scale rebuilt for impact
            </p>
            
            {/* Font Families */}
            <div style={{ 
              padding: '24px', 
              border: `2px solid ${theme.border}`,
              boxShadow: `4px 4px 0 ${theme.shadow}`,
              marginBottom: '32px',
              backgroundColor: theme.bgCard
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${theme.border}`,
                color: theme.text
              }}>
                Font Families
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', color: theme.textFaint, marginBottom: '4px' }}>
                    Primary — Display/Headings
                  </p>
                  <p style={{ fontSize: '36px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0, color: theme.text }}>
                    ANTON / BEBAS NEUE
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', color: theme.textFaint, marginBottom: '4px' }}>
                    Secondary — Body/UI
                  </p>
                  <p style={{ fontSize: '24px', margin: 0, color: theme.text }}>
                    Share Tech / Inter
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', color: theme.textFaint, marginBottom: '4px' }}>
                    Mono — Code/Data
                  </p>
                  <p style={{ fontSize: '20px', fontFamily: 'monospace', margin: 0, color: theme.text }}>
                    JetBrains Mono / Fira Code
                  </p>
                </div>
              </div>
            </div>
            
            {/* Type Scale */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Type Scale
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { name: 'Display', size: '48px', weight: 900, sample: 'GHXSTSHIP' },
                { name: 'H1', size: '36px', weight: 900, sample: 'BOLD ADVENTURE' },
                { name: 'H2', size: '28px', weight: 700, sample: 'Contemporary Pop Art' },
                { name: 'H3', size: '22px', weight: 700, sample: 'Design System Components' },
                { name: 'H4', size: '18px', weight: 600, sample: 'Card Titles and Labels' },
                { name: 'Body', size: '16px', weight: 400, sample: 'Body text for paragraphs.' },
                { name: 'Small', size: '14px', weight: 500, sample: 'Secondary text and metadata' },
                { name: 'XSmall', size: '12px', weight: 500, sample: 'BADGES & LABELS' },
              ].map((item) => (
                <div key={item.name} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '24px',
                  paddingBottom: '16px',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0', color: theme.text }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '12px', color: theme.textFaint, margin: 0 }}>
                      {item.size}
                    </p>
                  </div>
                  <p style={{ 
                    fontSize: item.size, 
                    fontWeight: item.weight,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.025em',
                    margin: 0,
                    color: theme.text
                  }}>
                    {item.sample}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* SPACING */}
        {activeTab === 'spacing' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Spacing Scale
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              4px base unit • Dynamic rhythm
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'spacing-1', value: '4px', desc: 'Micro' },
                { name: 'spacing-2', value: '8px', desc: 'Tight' },
                { name: 'spacing-3', value: '12px', desc: 'Compact' },
                { name: 'spacing-4', value: '16px', desc: 'Base' },
                { name: 'spacing-6', value: '24px', desc: 'Relaxed' },
                { name: 'spacing-8', value: '32px', desc: 'Spacious' },
                { name: 'spacing-12', value: '48px', desc: 'Large gap' },
                { name: 'spacing-16', value: '64px', desc: 'Section' },
              ].map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', margin: '0 0 2px 0', color: theme.text }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '12px', color: theme.textFaint, margin: 0 }}>{item.value}</p>
                  </div>
                  <div style={{ 
                    width: item.value, 
                    height: '24px',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    flexShrink: 0
                  }} />
                  <p style={{ fontSize: '14px', color: theme.textMuted }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* SHADOWS */}
        {activeTab === 'shadows' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Shadow System
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Hard offset shadows • Comic panel aesthetic
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px' }}>
              {[
                { name: 'shadow-xs', offset: '2px 2px 0', desc: 'Subtle lift' },
                { name: 'shadow-sm', offset: '3px 3px 0', desc: 'Low elevation' },
                { name: 'shadow-md', offset: '4px 4px 0', desc: 'Default cards' },
                { name: 'shadow-lg', offset: '6px 6px 0', desc: 'Hover state' },
                { name: 'shadow-xl', offset: '8px 8px 0', desc: 'Modals' },
                { name: 'shadow-primary', offset: '4px 4px 0', desc: 'Accent', isPrimary: true },
              ].map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    height: '120px',
                    marginBottom: '16px',
                    border: `2px solid ${theme.border}`,
                    backgroundColor: theme.bgCard,
                    boxShadow: `${item.offset} ${item.isPrimary ? '#6366f1' : theme.shadow}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: theme.text }}>
                      {item.offset}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0', color: theme.text }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '12px', color: theme.textFaint, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* BORDERS */}
        {activeTab === 'borders' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Borders & Radius
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Bold borders • Sharp to rounded scale
            </p>
            
            {/* Border Widths */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Border Widths
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
              {[
                { name: 'thin', width: '1px' },
                { name: 'default', width: '2px' },
                { name: 'thick', width: '3px' },
                { name: 'heavy', width: '4px' },
              ].map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    height: '96px',
                    marginBottom: '12px',
                    borderWidth: item.width,
                    borderStyle: 'solid',
                    borderColor: theme.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.bgCard
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: theme.text }}>{item.width}</span>
                  </div>
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', margin: 0, color: theme.text }}>
                    border-{item.name}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Border Radius */}
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${theme.text}`,
              display: 'inline-block',
              color: theme.text
            }}>
              Border Radius
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              {[
                { name: 'none', radius: '0px' },
                { name: 'sm', radius: '2px' },
                { name: 'md', radius: '4px' },
                { name: 'lg', radius: '8px' },
                { name: 'xl', radius: '16px' },
                { name: 'full', radius: '50%' },
              ].map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    height: '80px',
                    width: '80px',
                    margin: '0 auto 12px auto',
                    border: `2px solid ${theme.text}`,
                    borderRadius: item.radius,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }} />
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', margin: '0 0 4px 0', color: theme.text }}>
                    rounded-{item.name}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.textFaint, margin: 0 }}>{item.radius}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* BUTTONS */}
        {activeTab === 'buttons' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Buttons
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Bold borders • Hard shadows • Bounce interactions
            </p>
            
            {/* Default */}
            <div style={{ padding: '24px', border: `2px solid ${theme.border}`, marginBottom: '24px', backgroundColor: theme.bgCard }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>
                Default Variant
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <button style={{ padding: '12px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px', border: '2px solid #6366f1', borderRadius: 0, boxShadow: '3px 3px 0 rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                  Default
                </button>
                <button style={{ padding: '12px 24px', backgroundColor: 'rgba(99,102,241,0.5)', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px', border: '2px solid rgba(99,102,241,0.5)', borderRadius: 0, cursor: 'not-allowed' }}>
                  Disabled
                </button>
              </div>
            </div>
            
            {/* Outline */}
            <div style={{ padding: '24px', border: `2px solid ${theme.border}`, marginBottom: '24px', backgroundColor: theme.bgCard }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>
                Outline Variant
              </h3>
              <button style={{ padding: '12px 24px', backgroundColor: 'transparent', color: theme.text, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px', border: `2px solid ${theme.text}`, borderRadius: 0, boxShadow: `3px 3px 0 ${theme.shadow}`, cursor: 'pointer' }}>
                Outline
              </button>
            </div>
            
            {/* Pop Art */}
            <div style={{ padding: '24px', border: `2px solid ${theme.border}`, marginBottom: '24px', backgroundColor: theme.bgCard }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>
                Pop Art Variant
              </h3>
              <button style={{ padding: '12px 24px', backgroundColor: theme.bg, color: theme.text, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px', border: `4px solid ${theme.text}`, borderRadius: 0, boxShadow: '4px 4px 0 #6366f1', cursor: 'pointer' }}>
                Pop Art
              </button>
            </div>
            
            {/* Sizes */}
            <div style={{ padding: '24px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>
                Sizes
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                <button style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', border: '2px solid #6366f1', borderRadius: 0, boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', cursor: 'pointer' }}>Small</button>
                <button style={{ padding: '12px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', border: '2px solid #6366f1', borderRadius: 0, boxShadow: '3px 3px 0 rgba(0,0,0,0.2)', cursor: 'pointer' }}>Default</button>
                <button style={{ padding: '16px 32px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', fontSize: '16px', border: '2px solid #6366f1', borderRadius: 0, boxShadow: '4px 4px 0 rgba(0,0,0,0.2)', cursor: 'pointer' }}>Large</button>
              </div>
            </div>
          </section>
        )}
        
        {/* INPUTS */}
        {activeTab === 'inputs' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Form Inputs
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Thick borders • Focus lift • Clear states
            </p>
            
            <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: theme.text }}>Text Input</label>
                <input type="text" placeholder="Enter your name..." style={{ width: '100%', padding: '12px 16px', fontSize: '14px', fontWeight: 500, border: `2px solid ${theme.border}`, borderRadius: 0, backgroundColor: theme.bgCard, color: theme.text, boxShadow: `2px 2px 0 ${theme.shadow}`, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: theme.text }}>Error State</label>
                <input type="text" defaultValue="Invalid input" style={{ width: '100%', padding: '12px 16px', fontSize: '14px', fontWeight: 500, border: '2px solid #ef4444', borderRadius: 0, backgroundColor: theme.bgCard, color: theme.text, boxShadow: '2px 2px 0 rgba(239,68,68,0.3)', outline: 'none', boxSizing: 'border-box' }} />
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#ef4444', fontWeight: 500 }}>This field is required</p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: theme.text }}>Textarea</label>
                <textarea placeholder="Enter description..." rows={4} style={{ width: '100%', padding: '12px 16px', fontSize: '14px', fontWeight: 500, border: `2px solid ${theme.border}`, borderRadius: 0, backgroundColor: theme.bgCard, color: theme.text, boxShadow: `2px 2px 0 ${theme.shadow}`, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>
          </section>
        )}
        
        {/* CARDS */}
        {activeTab === 'cards' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Cards
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Comic panel aesthetic • Hard shadows • Hover lift
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Basic */}
              <div style={{ border: `2px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden', boxShadow: `4px 4px 0 ${theme.shadow}`, backgroundColor: theme.bgCard }}>
                <div style={{ padding: '20px', borderBottom: `2px solid ${theme.border}` }}>
                  <h3 style={{ fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 4px 0', color: theme.text }}>Basic Card</h3>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>Subtitle text</p>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: 0 }}>Card content goes here. Basic card with header and content.</p>
                </div>
              </div>
              
              {/* Event */}
              <div style={{ border: `2px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden', boxShadow: `4px 4px 0 ${theme.shadow}`, backgroundColor: theme.bgCard }}>
                <div style={{ position: 'relative', height: '120px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '8px 12px', backgroundColor: theme.bg, color: theme.text, border: `2px solid ${theme.text}`, boxShadow: '2px 2px 0 #6366f1' }}>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>27</span>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>NOV</span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>Event Name</h3>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 16px 0' }}>📍 Venue Name</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>$49.99</span>
                    <button style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', border: '2px solid #6366f1', borderRadius: 0, boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', cursor: 'pointer' }}>Tickets</button>
                  </div>
                </div>
              </div>
              
              {/* Pop Art */}
              <div style={{ border: `4px solid ${theme.text}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '6px 6px 0 #6366f1', backgroundColor: theme.bg }}>
                <div style={{ padding: '20px', borderBottom: `4px solid ${theme.text}` }}>
                  <h3 style={{ fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', margin: 0, color: theme.text }}>Pop Art Card</h3>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 16px 0' }}>Maximum impact with heavy borders and accent shadow.</p>
                  <button style={{ width: '100%', padding: '12px 16px', backgroundColor: theme.text, color: theme.bg, fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', border: `4px solid ${theme.text}`, borderRadius: 0, cursor: 'pointer' }}>Action</button>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* BADGES */}
        {activeTab === 'badges' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Badges
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Label style • Sharp corners • Bold text
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ padding: '4px 12px', backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '2px solid #6366f1' }}>Default</span>
              <span style={{ padding: '4px 12px', backgroundColor: theme.bgCard, color: theme.text, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: `2px solid ${theme.border}` }}>Secondary</span>
              <span style={{ padding: '4px 12px', backgroundColor: 'transparent', color: theme.text, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: `2px solid ${theme.text}` }}>Outline</span>
              <span style={{ padding: '4px 12px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '2px solid #ef4444' }}>Destructive</span>
              <span style={{ padding: '4px 12px', backgroundColor: '#22c55e', color: '#ffffff', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '2px solid #22c55e' }}>Success</span>
              <span style={{ padding: '4px 12px', backgroundColor: theme.bg, color: theme.text, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', border: `2px solid ${theme.text}`, boxShadow: '2px 2px 0 #6366f1' }}>Pop Art</span>
            </div>
          </section>
        )}
        
        {/* PATTERNS */}
        {activeTab === 'patterns' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Background Patterns
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Pop art textures • Halftone • Action lines
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ height: '140px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`, backgroundSize: '8px 8px' }} />
                <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: theme.text }}>Halftone</p>
              </div>
              <div>
                <div style={{ height: '140px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 10px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 20px)` }} />
                <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: theme.text }}>Stripes</p>
              </div>
              <div>
                <div style={{ height: '140px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: theme.text }}>Grid</p>
              </div>
              <div>
                <div style={{ height: '140px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard, backgroundImage: 'radial-gradient(rgba(99,102,241,0.25) 20%, transparent 20%)', backgroundSize: '12px 12px' }} />
                <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: theme.text }}>Ben-Day Dots</p>
              </div>
            </div>
          </section>
        )}
        
        {/* ANIMATIONS */}
        {activeTab === 'animations' && (
          <section>
            <h2 style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 8px 0', color: theme.text }}>
              Animations
            </h2>
            <p style={{ color: theme.textMuted, marginBottom: '32px' }}>
              Snappy durations • Bounce easing • Comic energy
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div style={{ padding: '24px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>Hover Lift + Shadow</h3>
                <div style={{ height: '96px', border: `2px solid ${theme.border}`, backgroundColor: theme.bg, boxShadow: `4px 4px 0 ${theme.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', color: theme.text }}>Hover Me</span>
                </div>
                <p style={{ marginTop: '12px', fontSize: '12px', color: theme.textMuted }}>translate(-2px, -2px) + shadow increase</p>
              </div>
              
              <div style={{ padding: '24px', border: `2px solid ${theme.border}`, backgroundColor: theme.bgCard }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: theme.text }}>Duration Scale</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[{ name: 'Fast', ms: '100ms' }, { name: 'Normal', ms: '150ms' }, { name: 'Slow', ms: '250ms' }].map((item) => (
                    <div key={item.name} style={{ textAlign: 'center' }}>
                      <div style={{ width: '56px', height: '56px', border: '2px solid #6366f1', backgroundColor: 'rgba(99,102,241,0.2)' }} />
                      <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: theme.text }}>{item.name}</p>
                      <p style={{ fontSize: '11px', color: theme.textFaint }}>{item.ms}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        
      </main>
      
      {/* Footer */}
      <footer style={{ borderTop: `4px solid ${theme.border}`, padding: '32px', marginTop: '64px', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0', color: theme.text }}>GHXSTSHIP Industries</p>
        <p style={{ fontSize: '14px', color: theme.textFaint, margin: 0 }}>Bold Contemporary Pop Art Adventure</p>
      </footer>
    </div>
  );
}
