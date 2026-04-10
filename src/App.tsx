return (
  <div className="App">
    {/* Particle Background */}
    <div className="particles">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${10 + Math.random() * 10}s`
        }} />
      ))}
    </div>
    
    {/* Main Glass Container */}
    <div className="glass-panel" style={{ marginTop: '3rem' }}>
      <h1 className="glitch" data-text="PRISM AETHER">PRISM AETHER</h1>
      
      {/* Your existing content goes here */}
      {/* (Keep your current components inside this glass-panel) */}
      
      {/* Optional: Terminal style for AI output */}
      <div className="terminal">
        <div className="terminal-content">
          <span style={{ color: 'var(--neon-cyan)' }}>➜</span> System initialized...
          <span className="cursor" style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '18px', 
            background: 'var(--neon-green)', 
            marginLeft: '5px',
            animation: 'blink 1s infinite'
          }} />
        </div>
      </div>
    </div>
  </div>
)
