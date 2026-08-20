import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ActiverModeTestParcoursJeune() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.removeItem('test_modeRepriseActif');
    localStorage.setItem('repriseMode', 'normal');
    router.replace('/preparation-jeune');
  }, [router]);

  return (
    <main style={{ padding: 32, textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>🧪 Activation du mode test</h1>
      <p>Ouverture du parcours de préparation…</p>
    </main>
  );
}
