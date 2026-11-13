'use client';

/**
 * ARVX web — application monopage.
 * Une seule route Next.js ; la navigation interne se fait par ancre (#/vue),
 * ce qui garde le bouton retour du navigateur fonctionnel.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from '@/lib/arvx/store';
import { dateLongue, initiales } from '@/lib/arvx/format';
import { EtatVide, Logo } from '@/components/arvx/partages';
import { MenuLateral } from '@/components/arvx/menu-lateral';
import { PageAccueil } from '@/components/arvx/page-accueil';
import { PageReviser } from '@/components/arvx/page-reviser';
import { PageAjoutCours } from '@/components/arvx/page-ajout-cours';
import { PageMatiere } from '@/components/arvx/page-matiere';
import { PageCours } from '@/components/arvx/page-cours';
import { PageExamens } from '@/components/arvx/page-examens';
import { PagePassage } from '@/components/arvx/page-passage';
import { PageResultats } from '@/components/arvx/page-resultats';
import { PageProgression } from '@/components/arvx/page-progression';
import { PageProfil } from '@/components/arvx/page-profil';
import { Bienvenue } from '@/components/arvx/bienvenue';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ───────────────────────── routeur par ancre ───────────────────────── */

export interface Route {
  vue: string;
  args: string[];
}

function lireRoute(): Route {
  const brut = window.location.hash.replace(/^#\/?/, '');
  const segs = brut.split('/').filter(Boolean);
  if (segs.length === 0) return { vue: 'accueil', args: [] };
  return { vue: decodeURIComponent(segs[0]), args: segs.slice(1).map((s) => decodeURIComponent(s)) };
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>({ vue: 'accueil', args: [] });
  useEffect(() => {
    const maj = () => setRoute(lireRoute());
    maj();
    window.addEventListener('hashchange', maj);
    return () => window.removeEventListener('hashchange', maj);
  }, []);
  return route;
}

/** Navigation — reçoit un chemin sans « # » ex. « reviser/cours/abc ». */
export function aller(chemin: string) {
  window.location.hash = '/' + chemin;
}

/* ───────────────────────── coquille connectée ───────────────────────── */

const TITRES: Record<string, string> = {
  accueil: 'Accueil',
  reviser: 'Réviser',
  nouveau: 'Ajouter un cours',
  matiere: 'Matière',
  cours: 'Ton cours',
  examens: 'Examens',
  examen: 'Examen en cours',
  resultats: 'Résultats',
  progression: 'Progression',
  profil: 'Profil',
};

function Coquille() {
  const { donnees, actions } = useStore();
  const route = useRoute();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const naviguer = useCallback(
    (chemin: string) => {
      setMenuOuvert(false);
      aller(chemin);
    },
    []
  );

  if (!donnees.pret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fond">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-contour-fort border-t-encre" />
          <p className="text-[12px] font-semibold text-attenu">ARVX se prépare…</p>
        </div>
      </div>
    );
  }

  if (!donnees.session) {
    return <Bienvenue />;
  }

  const afficheEnTete = !['examen', 'resultats'].includes(route.vue);
  const titre = TITRES[route.vue] ?? 'ARVX';

  const rendreVue = () => {
    switch (route.vue) {
      case 'accueil':
        return <PageAccueil naviguer={naviguer} />;
      case 'reviser':
        return <PageReviser naviguer={naviguer} />;
      case 'nouveau':
        return <PageAjoutCours naviguer={naviguer} matierePreselection={route.args[0] ?? null} />;
      case 'matiere':
        return <PageMatiere naviguer={naviguer} matiereId={route.args[0] ?? 'autre'} />;
      case 'cours':
        return <PageCours naviguer={naviguer} coursId={route.args[0] ?? ''} />;
      case 'examens':
        return <PageExamens naviguer={naviguer} />;
      case 'examen':
        return <PagePassage naviguer={naviguer} tentativeId={route.args[0] ?? ''} />;
      case 'resultats':
        return <PageResultats naviguer={naviguer} tentativeId={route.args[0] ?? ''} />;
      case 'progression':
        return <PageProgression naviguer={naviguer} />;
      case 'profil':
        return <PageProfil naviguer={naviguer} />;
      default:
        return (
          <div className="p-6">
            <EtatVide
              emoji="🧭"
              titre="Page introuvable"
              texte="Ce chemin n'existe pas encore dans ARVX. Reviens à l'accueil pour continuer."
              action="Retour à l'accueil"
              onClick={() => naviguer('accueil')}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-fond">
      {afficheEnTete && (
        <header className="sticky top-0 z-40 border-b border-contour bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                    <Menu className="h-5 w-5 text-encre" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                  <MenuLateral naviguer={naviguer} vue={route.vue} />
                </SheetContent>
              </Sheet>
              <button onClick={() => naviguer('accueil')} aria-label="Aller à l'accueil">
                <Logo />
              </button>
            </div>
            <p className="hidden text-[13px] font-bold text-second sm:block">{titre}</p>
            <button
              onClick={() => naviguer('profil')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-encre text-[12px] font-extrabold text-white transition-transform hover:scale-105"
              aria-label="Ouvrir le profil"
            >
              {initiales(donnees.session.nom, donnees.session.email)}
            </button>
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-7">{rendreVue()}</main>

      {afficheEnTete && (
        <nav
          className="sticky bottom-0 z-40 border-t border-contour bg-white/90 backdrop-blur-md sm:hidden"
          aria-label="Navigation principale"
        >
          <div className="grid grid-cols-4">
            {[
              { vue: 'accueil', nom: 'Accueil' },
              { vue: 'reviser', nom: 'Réviser' },
              { vue: 'examens', nom: 'Examens' },
              { vue: 'progression', nom: 'Progrès' },
            ].map((o) => {
              const actif = route.vue === o.vue || (o.vue === 'reviser' && ['nouveau', 'matiere', 'cours'].includes(route.vue)) || (o.vue === 'examens' && ['examen', 'resultats'].includes(route.vue));
              return (
                <button
                  key={o.vue}
                  onClick={() => naviguer(o.vue)}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                    actif ? 'text-encre' : 'text-attenu'
                  }`}
                >
                  <span className={`h-1 w-6 rounded-full ${actif ? 'bg-encre' : 'bg-transparent'}`} />
                  {o.nom}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {!afficheEnTete && (
        <div className="sticky bottom-0 z-40 border-t border-contour bg-white px-4 py-3 sm:hidden">
          <Button variant="ghost" size="sm" className="w-full text-second" onClick={() => naviguer('examens')}>
            Quitter cette vue
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <Coquille />
    </StoreProvider>
  );
}
