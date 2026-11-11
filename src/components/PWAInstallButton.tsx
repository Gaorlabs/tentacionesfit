import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed and running in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Handle click based on platform
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt for desktop or unsupported browsers
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title="Instalar App en tu móvil"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-all shadow-2xs active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden xs:inline">Instalar App</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all shadow-2xs active:scale-[0.98]"
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>📲 Instalar Aplicación en Pantalla de Inicio</span>
        </button>
      )}

      {/* iOS Safari / Mobile installation instruction guide modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
                  TF
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                  Instalar en tu Dispositivo
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Instala Tentaciones Fit como una aplicación nativa en tu pantalla de inicio para acceder de forma rápida y sin conexión:
            </p>

            <div className="space-y-3 bg-neutral-50 dark:bg-neutral-850 p-3.5 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    <span>Toca Compartir</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    En la barra inferior o superior de tu navegador (Safari o Chrome).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    <span>Selecciona "Agregar a Inicio"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-600" />
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    O la opción "Instalar aplicación" en el menú.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  3
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">
                    ¡Listo para pedir!
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Se abrirá a pantalla completa como una app nativa de delivery.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
