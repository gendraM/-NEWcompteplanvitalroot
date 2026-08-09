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
  const [nom, setNom] = useState('')
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
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires')
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
      nom: nom || undefined
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <small style={styles.hint}>Minimum 6 caractères</small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmer le mot de passe *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                disabled={loading}
                autoComplete="new-password"
                required
              />
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
