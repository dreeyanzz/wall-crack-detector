import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, Shield, Zap, Terminal } from 'lucide-react';

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background ambient glows */}
      <div className="glow-shape bg-blue-500/20 w-[500px] h-[500px] top-[-100px] left-[-100px]" />
      <div className="glow-shape bg-indigo-500/20 w-[400px] h-[400px] bottom-[10%] right-[5%]" />
      
      {/* Navigation */}
      <nav className="w-full relative z-10 px-6 py-6 border-b border-white/5 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">CrackDetector</span>
          </div>
          <div className="hidden sm:flex text-sm text-zinc-400 gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is now available for Windows
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            AI-Powered Infrastructure <br className="hidden md:block"/>
            <span className="text-gradient">Inspection Toolkit</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Locally hosted, real-time crack detection using YOLOv8. 
            Process live feeds, upload imagery, and generate detailed reports without ever sending data to the cloud.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/dreeyanzz/wall-crack-detector/releases/latest/download/CrackDetector.zip"
              className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              Download for Windows
            </a>
            <a 
              href="https://github.com/dreeyanzz/wall-crack-detector"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-8 py-4 glass hover:bg-white/10 text-white rounded-full font-medium transition-all"
            >
              <Terminal className="w-5 h-5" />
              View Source
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            For Windows 10 / 11 (64-bit) · No installation required
          </p>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 py-24 bg-zinc-950 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="100% Local Inference"
              desc="Your data never leaves your machine. The internal YOLOv8 model runs completely offline, ensuring maximum privacy and compliance."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-indigo-400" />}
              title="Real-time Processing"
              desc="Connect a webcam or IP camera stream and segment structural cracks with zero-latency inference directly in the browser dashboard."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              title="Standalone Executable"
              desc="No complex Python environments to setup. We bundle everything into a single reliable Windows executable."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center bg-background/80">
        <p className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} CrackDetector Open Source Project. Crafted with React & PyTorch.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass p-8 rounded-2xl hover:bg-white/[0.08] transition-colors group cursor-default">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-zinc-100">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

export default App;
