import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// Création du contexte d'authentification
const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  // 1. HOOKS - Déclaration en premier (règles React strictes)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // 2. EFFET - Gestion de la session au montage
  useEffect(() => {
    // Récupération de la session initiale
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Erreur récupération session:', error)
        }
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        console.log('[AuthContext] initAuth - session:', currentSession, 'user:', currentSession?.user)
      } catch (err) {
        console.error('Erreur initialisation auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AuthContext] Auth event:', event, 'session:', currentSession, 'user:', currentSession?.user)
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      }
    )

    // Nettoyage de l'abonnement au démontage
    return () => {
      subscription?.unsubscribe()
    }
  }, []) // Tableau vide = exécution unique au montage

  // 3. HANDLERS - Fonctions d'authentification

  // Fonction explicite pour re-fetch user/session (après updateUser)
  const refreshUserSession = async () => {
    setLoading(true)
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Erreur refresh session:', error)
      }
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
    } catch (err) {
      console.error('Erreur refreshUserSession:', err)
    } finally {
      setLoading(false)
    }
  }
  const signUp = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erreur inscription:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erreur connexion:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      setUser(null)
      setSession(null)
      return { error: null }
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Erreur reset password:', error)
      return { data: null, error }
    }
  }

  // 4. VALEUR DU CONTEXTE
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserSession
  }

  // 5. RENDU - Provider avec la valeur
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  
  return context
}
