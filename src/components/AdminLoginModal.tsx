import React, { useState } from 'react';
import { Eye, EyeOff, Shield, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onLoginSuccess: () => void;
  onUpdateSettings: (newSettings: SiteSettings) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  settings,
  onLoginSuccess,
  onUpdateSettings,
}) => {
  const [email, setEmail] = useState(settings.admin_email || 'estefaniojoao6@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Recovery Mode
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = settings.admin_email || 'estefaniojoao6@gmail.com';
    const targetPass = settings.admin_password || 'Vagafilme2024';

    if (email.trim().toLowerCase() === targetEmail.toLowerCase() && password === targetPass) {
      setSuccessMsg('Acesso autenticado com sucesso! Entrando...');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 600);
    } else {
      setErrorMsg('Credenciais incorretas! Verifique o e-mail ou a palavra-passe.');
    }
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const expectedPin = settings.recovery_pin || '2024';

    if (recoveryPin.trim() !== expectedPin.trim()) {
      setErrorMsg('Código PIN de recuperação incorreto!');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('A nova senha e a confirmação não coincidem.');
      return;
    }

    // Update settings with the new password
    const updated: SiteSettings = {
      ...settings,
      admin_password: newPassword,
    };
    onUpdateSettings(updated);
    setSuccessMsg('Palavra-passe redefinida com sucesso! Você já pode entrar.');
    setPassword(newPassword);
    setIsRecoveryMode(false);
  };

  return (
    <AnimatePresence>
      <div
        id="admin-login-backdrop"
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-[#121218] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-neutral-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900/60 hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-3 shadow-lg shadow-red-950">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide font-montserrat">
              {isRecoveryMode ? 'Recuperar Palavra-passe' : 'Acesso Administrativo (ADMV)'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {isRecoveryMode
                ? 'Insira o PIN de recuperação para criar uma nova senha'
                : 'Painel exclusivo de gerenciamento do CIne Fanio'}
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRecoveryMode ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  E-mail do Administrador
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estefaniojoao6@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Palavra-passe
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full pl-3.5 pr-11 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setErrorMsg('');
                  }}
                  className="text-red-400 hover:text-red-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Esqueceu a senha?
                </button>
                <span className="text-neutral-500 text-[11px]">Código ADMV</span>
              </div>

              <button
                type="submit"
                id="admin-login-submit-btn"
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-700/30 cursor-pointer"
              >
                Entrar no Painel Administrativo
              </button>
            </form>
          ) : (
            /* Password Recovery Form */
            <form onSubmit={handleRecoverPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  PIN de Recuperação (Padrão: 2024)
                </label>
                <input
                  type="text"
                  required
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value)}
                  placeholder="Ex: 2024"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha..."
                    className="w-full pl-3.5 pr-11 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Confirmar Nova Palavra-passe
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha..."
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setErrorMsg('');
                  }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
                >
                  Voltar ao Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
