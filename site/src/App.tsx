import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, Shield, Zap, Terminal } from 'lucide-react';

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      {/* Background colour blobs */}
      <div className="glow-blob w-[600px] h-[600px] bg-blue-600    top-[-150px] left-[-150px]" />
      <div className="glow-blob w-[500px] h-[500px] bg-violet-600  top-[10%]    right-[-100px]" />
      <div className="glow-blob w-[450px] h-[450px] bg-cyan-500    bottom-[5%]  left-[10%]" />
      <div className="glow-blob w-[400px] h-[400px] bg-indigo-600  bottom-[-80px] right-[15%]" />

      {/* Navigation */}
      <nav className="w-full fixed top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">CrackDetector</span>
          </div>
          <div className="hidden sm:flex text-sm text-white/60 gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a
              href="https://github.com/dreeyanzz/wall-crack-detector"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-24">
        <div className={`transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-blue-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            v2.0 now available for Windows
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight text-white">
            AI-Powered Infrastructure <br className="hidden md:block" />
            <span className="text-gradient">Inspection Toolkit</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Locally hosted, real-time crack detection using YOLOv8.
            Process live camera feeds and inspect structural surfaces without ever sending data to the cloud.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/dreeyanzz/wall-crack-detector/releases/latest/download/CrackDetector.zip"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-105
                         bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                         shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              Download for Windows
            </a>
            <a
              href="https://github.com/dreeyanzz/wall-crack-detector"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-8 py-4 glass rounded-2xl font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <Terminal className="w-5 h-5" />
              View Source
            </a>
          </div>

          <p className="mt-5 text-sm text-white/30">
            Windows 10 / 11 (64-bit) · No installation required · Just unzip and run
          </p>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Why CrackDetector?</h2>
          <p className="text-center text-white/40 mb-12 text-sm">Everything you need, nothing you don't.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="100% Local Inference"
              desc="Your data never leaves your machine. The YOLOv8 model runs completely offline, ensuring maximum privacy and compliance."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-violet-400" />}
              title="Real-time Processing"
              desc="Connect a webcam or IP camera and get live crack segmentation with polygon masks rendered directly in the browser dashboard."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              title="Standalone Executable"
              desc="No Python environments, no installs. Everything is bundled into a single Windows executable — just unzip and run."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <div className="glass mx-6 rounded-2xl py-5 max-w-5xl md:mx-auto">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} CrackDetector · Open Source · Built with React & YOLOv8
          </p>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group cursor-default">
      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
      <p className="text-white/50 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

export default App;
