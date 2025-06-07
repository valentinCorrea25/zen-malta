import { useState, useEffect, useRef } from "react";
import { Pause, Play, Settings } from "lucide-react";

const PHASE_LABELS = {
  inhale: "Inhalar",
  hold1: "Mantener",
  exhale: "Exhalar",
  hold2: "Mantener",
} as const;

const BreathingApp = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0); // 0: inhale, 1: hold1, 2: exhale, 3: hold2
  const [countdown, setCountdown] = useState(4);
  const [duration, setDuration] = useState(4); // seconds per phase
  const [showSettings, setShowSettings] = useState(false);
  const [allowBackgroundSound, setAllowBackgroundSound] = useState(true);
  const [allowCycleSound, setAllowCycleSound] = useState(true);

  const cycleSoundRef = useRef(new Audio("src/assets/bell.mp3"));
  const backgroundSoundRef = useRef(new Audio("src/assets/Rain.wav"));

  const phases = ["inhale", "hold1", "exhale", "hold2"];
  //@ts-expect-error
  const phaseNames = phases.map((phase) => PHASE_LABELS[phase]);
  const playCycleSound = () => {
    if (allowCycleSound) {
      cycleSoundRef.current.currentTime = 0;
      cycleSoundRef.current.play();
    }
  };
  const playBackgroundSound = (play: boolean) => {
    if (!play || !allowBackgroundSound) {
      backgroundSoundRef.current.pause();
    } else {
      backgroundSoundRef.current.currentTime = 0;
      backgroundSoundRef.current.play();
    }
  };

  useEffect(() => {
    let interval: number;

    if (isActive) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            playCycleSound();
            setCurrentPhase(currentPhase == 3 ? 0 : currentPhase + 1);
            return duration;
          }
          return prev - 1;
        });
      }, 1430);
    }

    return () => clearInterval(interval);
  }, [isActive, duration, countdown]);

  const toggleBreathing = () => {
    setCountdown(duration);
    setIsActive(!isActive);
    setCurrentPhase(0);
    playBackgroundSound(false);
    if (!isActive) {
      playBackgroundSound(true);
      setCurrentPhase(0);
    }
  };

  const getCircleScale = () => {
    if (phases[currentPhase] === "inhale") {
      return 1 + ((duration - countdown) / duration) * 0.5;
    } else if (phases[currentPhase] === "exhale") {
      return 1.5 - ((duration - countdown) / duration) * 0.5;
    }
    return phases[currentPhase] === "hold1" ? 1.5 : 1;
  };

  const getCircleColor = () => {
    const colors = [
      "bg-blue-400", // inhale
      "bg-cyan-400", // hold1
      "bg-green-400", // exhale
      "bg-teal-400", // hold2
    ];
    return colors[currentPhase];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-violet-900 flex flex-col items-center justify-center gap-10 p-4 relative">
      {showSettings && (
        <div className="absolute top-4 left-4 right-4 z-20 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-medium text-lg">Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Duración */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/90 text-sm font-medium">
                    Duración por fase
                  </label>
                  <span className="text-white/60 text-sm bg-white/10 px-2 py-1 rounded-full">
                    {duration}s
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 slider"
                    disabled={isActive}
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>2s</span>
                    <span>5s</span>
                    <span>8s</span>
                  </div>
                </div>
              </div>

              {/* Sonidos */}
              <div className="space-y-4">
                <h4 className="text-white/90 text-sm font-medium">Sonidos</h4>

                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">
                    Sonido de ciclo
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowCycleSound}
                      onChange={(e) => setAllowCycleSound(e.target.checked)}
                      disabled={isActive}
                      className="sr-only peer"
                    />
                    <div
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                        allowCycleSound ? "bg-blue-400" : "bg-white/20"
                      } ${
                        isActive
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-300 ${
                          allowCycleSound ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">
                    Sonido de fondo (lluvia)
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBackgroundSound}
                      onChange={(e) =>
                        setAllowBackgroundSound(e.target.checked)
                      }
                      disabled={isActive}
                      className="sr-only peer"
                    />
                    <div
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                        allowBackgroundSound ? "bg-cyan-400" : "bg-white/20"
                      } ${
                        isActive
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-300 ${
                          allowBackgroundSound
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-white/20 text-white py-3 rounded-xl hover:from-blue-500/30 hover:to-violet-500/30 transition-all duration-300 font-medium"
            >
              Aplicar cambios
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h2 className="text-3xl font-light text-white mb-2">
          {phaseNames[currentPhase]}
        </h2>
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto">
          <div
            className="h-full bg-white rounded-full transition-all duration-1430 ease-linear"
            style={{ width: `${((duration - countdown) / duration) * 130}%` }}
          />
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="relative mb-12" onClick={toggleBreathing}>
        <div
          className={`w-48 h-48 rounded-full ${
            isActive ? getCircleColor() : "bg-gray-400"
          } transition-all duration-1000 ease-in-out flex items-center justify-center shadow-2xl`}
          style={{
            transform: `scale(${getCircleScale()})`,
            boxShadow: `0 0 ${
              30 + (getCircleScale() - 1) * 50
            }px rgba(109, 130, 246, 0.4)`,
          }}
        >
          <span className="text-6xl font-light text-white">{countdown}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleBreathing}
          className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
          disabled={isActive}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 text-center text-white/60 px-4">
        <p className="text-sm font-light">
          Sigue el círculo para una respiración relajante • {duration}s por fase
        </p>
      </div>
    </div>
  );
};

export default BreathingApp;
