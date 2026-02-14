import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignupPage() {
  // 1. HOOKS - Déclaration en premier
  const router = useRouter()
  const { user, signUp, loading: authLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [nom, setNom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // 2. EFFET - Redirection si déjà connecté
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/profil')
    }
  }, [user, authLoading, router])

  // 3. HANDLERS - Fonctions
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!pseudo || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires, dont le pseudo')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    // Tentative d'inscription
    const { error: signUpError } = await signUp(email, password, {
      nom: nom || undefined,
      pseudo: pseudo
    })

    if (signUpError) {
      setError(signUpError.message || 'Erreur lors de l\'inscription')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Redirection automatique après inscription (géré par AuthContext)
      setTimeout(() => {
        router.push('/profil')
      }, 2000)
    }
  }

  // 4. RENDU
  if (authLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Chargement...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Link href="/" style={styles.backButton}>
        ← Retour à l'accueil
      </Link>
      <div style={styles.card}>
        <h1 style={styles.title}>Inscription</h1>
        <p style={styles.subtitle}>Créez votre compte pour commencer</p>

        {success ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Compte créé avec succès !</h3>
            <p style={styles.successText}>Vous allez être redirigé...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pseudo *</label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Choisissez un pseudo unique"
                style={styles.input}
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom (optionnel)</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom"
                style={styles.input}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={styles.input}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <span
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#888',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%'
                  }}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={0}
                >
                  {/* Icône œil SVG */}
                  {showPassword ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.29-3.36-10-8 0-.34.03-.67.08-1A9.77 9.77 0 0 1 4.22 5.22M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .41-.08.8-.22 1.16" /><path d="M1 1l22 22" /></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="7" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </span>
              </div>
              <small style={styles.hint}>Minimum 6 caractères</small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmer le mot de passe *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#888',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%'
                  }}
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={0}
                >
                  {/* Icône œil SVG */}
                  {showConfirmPassword ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.29-3.36-10-8 0-.34.03-.67.08-1A9.77 9.77 0 0 1 4.22 5.22M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .41-.08.8-.22 1.16" /><path d="M1 1l22 22" /></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="7" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </span>
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button 
              type="submit" 
              style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Vous avez déjà un compte ?{' '}
            <Link href="/login" style={styles.link}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '3rem',
    maxWidth: 500,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  subtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
    fontSize: '0.9rem'
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: 8,
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  hint: {
    color: '#95a5a6',
    fontSize: '0.8rem'
  },
  button: {
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginTop: '1rem'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '0.75rem',
    borderRadius: 8,
    fontSize: '0.9rem',
    border: '1px solid #fcc'
  },
  successBox: {
    textAlign: 'center',
    padding: '2rem 1rem'
  },
  successIcon: {
    fontSize: '4rem',
    color: '#27ae60',
    marginBottom: '1rem'
  },
  successTitle: {
    color: '#27ae60',
    fontSize: '1.5rem',
    marginBottom: '0.5rem'
  },
  successText: {
    color: '#7f8c8d'
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center'
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  },
  loadingBox: {
    background: '#fff',
    padding: '2rem 4rem',
    borderRadius: 16,
    fontSize: '1.2rem',
    color: '#667eea',
    fontWeight: 'bold'
  },
  backButton: {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    transition: 'background 0.3s'
  }
}
