# Politique de Sécurité

## 📋 Rapporter une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ce projet, **ne créez PAS d'issue publique GitHub**.

### Processus de Signalement

**Méthode préférée:** Email sécurisé
- **Email:** security@galeon.community
- **Objet:** [SECURITY] Description courte de la vulnérabilité

**Informations à inclure:**
- Description détaillée de la vulnérabilité
- Étapes pour reproduire le problème
- Impact potentiel
- Suggestions de correction (optionnel)
- Votre nom/pseudo si vous souhaitez être crédité

### Engagement de Réponse

| Délai | Action |
|-------|--------|
| **< 24h** | Accusé de réception |
| **< 3 jours** | Évaluation initiale et classification |
| **< 1 semaine** | Plan de correction communiqué |
| Variable | Déploiement du correctif (selon sévérité) |

## 🔒 Versions Supportées

Nous prenons en charge activement la sécurité pour les versions suivantes:

| Version | Support Sécurité | Status |
|---------|------------------|--------|
| 0.2.x | ✅ Support complet | Version actuelle |
| 0.1.x | ⚠️ Corrections critiques uniquement | Maintenance |
| < 0.1 | ❌ Non supporté | Obsolète |

## 🛡️ Bonnes Pratiques de Sécurité

### 1. Variables d'Environnement

**À FAIRE:**
- ✅ Ne JAMAIS committer les fichiers `.env.local` ou `.env.production`
- ✅ Utiliser `.env.example` comme template documentation
- ✅ Rotation des tokens tous les 3-6 mois
- ✅ Tokens Mapbox avec restrictions strictes:
  - URL allowlist: `*.galeon.community`, `localhost:3000`
  - Scopes minimaux: `styles:read`, `fonts:read`, `tiles:read`
- ✅ Stocker les secrets dans Cloudflare Workers Secrets

**À ÉVITER:**
- ❌ Tokens hardcodés dans le code source
- ❌ Fallback tokens en production
- ❌ Tokens avec wildcard scopes
- ❌ Commits de fichiers contenant des secrets

### 2. Gestion des Dépendances

**Processus:**
```bash
# Audit hebdomadaire (automatisé via CI/CD recommandé)
npm audit --production

# Correction automatique des vulnérabilités
npm audit fix

# Vérification manuelle si audit fix échoue
npm audit --json > audit-report.json
```

**Monitoring:**
- Dependabot activé (GitHub)
- Snyk ou similaire (optionnel)
- Revue mensuelle des mises à jour majeures

### 3. Content Security Policy (CSP)

**Configuration actuelle:**
```
default-src 'self';
script-src 'self' 'nonce-{random}' https://api.mapbox.com;
style-src 'self' 'nonce-{random}' https://api.mapbox.com;
img-src 'self' data: https: blob:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://api.mapbox.com https://events.mapbox.com;
```

**Règles:**
- ❌ Pas de `unsafe-inline` ou `unsafe-eval`
- ✅ Nonces générés dynamiquement pour chaque requête
- ✅ Liste blanche stricte des domaines externes
- ✅ Rapports CSP vers endpoint de monitoring (à configurer)

### 4. Headers HTTP de Sécurité

**Configuration obligatoire:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [voir ci-dessus]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

**Fichiers de configuration:**
- `middleware.ts` - Headers Next.js
- `public/_headers` - Headers Cloudflare Pages
- `wrangler.toml` - Configuration Workers

### 5. Validation des Données

**Schéma Zod (app/types/index.ts):**
```typescript
export const HospitalSchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameFr: z.string(),
  status: z.enum(['Deployed', 'Signed']),
  deploymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string(),
  website: z.string().url(),
});
```

**Règles:**
- ✅ Toutes les entrées utilisateur validées avec Zod
- ✅ Sanitization des données avant affichage (React le fait par défaut)
- ✅ Validation côté client ET serveur (si applicable)

### 6. Protection Exports

**Rate Limiting (app/utils/rate-limiter.ts):**
- Exports PDF: 5/minute
- Exports Excel: 5/minute
- Exports JSON: 5/minute
- Requêtes API: 100/minute

**Protection CSV Injection:**
```typescript
// Fonction escapeCsvValue dans export-utils.ts
function escapeCsvValue(value: string): string {
  // Protège contre CSV injection
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}
```

## 🔍 Classification des Vulnérabilités

### Sévérité CRITIQUE
- Exposition de secrets (tokens, clés API)
- RCE (Remote Code Execution)
- XSS stored
- SQL Injection (si applicable)
- **Délai de correction:** < 48h

### Sévérité HAUTE
- XSS reflected
- CSRF
- Path Traversal
- Denial of Service
- **Délai de correction:** < 1 semaine

### Sévérité MOYENNE
- Information Disclosure
- CORS misconfiguration
- Manque de rate limiting
- **Délai de correction:** < 2 semaines

### Sévérité BASSE
- Problèmes de configuration mineurs
- Headers manquants non critiques
- **Délai de correction:** < 1 mois

## 📅 Audit de Sécurité

### Historique des Audits

| Date | Type | Score | Vulnérabilités | Actions |
|------|------|-------|----------------|---------|
| 2025-10-01 | Complet | 7.2/10 | 1 critique, 2 hautes | Plan d'action créé |
| 2025-10-01 | Correctif | 8.5/10 | 0 critique, 0 haute | Token sécurisé, CSP renforcée |

### Prochains Audits Planifiés

- **Prochain audit:** 2026-01-01 (trimestriel)
- **Type:** Audit complet + pen testing
- **Responsable:** Équipe sécurité Galeon

### Checklist d'Audit

**Sécurité:**
- [ ] Pas de secrets hardcodés
- [ ] Variables d'environnement correctement configurées
- [ ] CSP stricte sans unsafe-*
- [ ] Headers de sécurité présents
- [ ] Dépendances à jour (0 vulnérabilités critiques/hautes)

**Performance:**
- [ ] Lighthouse Performance > 95
- [ ] Bundle JS < 200KB (gzipped)
- [ ] LCP < 2.5s
- [ ] FID < 100ms

**Tests:**
- [ ] Coverage > 70%
- [ ] Tests E2E passent sur 3+ navigateurs
- [ ] Tests de régression OK

## 🚨 Incidents de Sécurité Passés

### 2025-10-01 - Token Mapbox Exposé

**Description:**
Token Mapbox hardcodé dans le code source avec fallback non sécurisé.

**Impact:**
- Risque: Utilisation abusive du quota Mapbox
- Portée: Code source public sur GitHub
- Données exposées: Token API Mapbox

**Actions correctives:**
1. ✅ Token hardcodé retiré du code
2. ✅ Ancien token révoqué sur Mapbox
3. ✅ Nouveau token créé avec restrictions strictes
4. ✅ Variables d'environnement mises à jour
5. ✅ Documentation .env.example améliorée
6. ✅ Validation ajoutée (erreur si token manquant)

**Leçons apprises:**
- Ne JAMAIS utiliser de fallback tokens en production
- Implémenter des validations strictes des variables d'env
- Rotation régulière des tokens (tous les 3 mois)

**Status:** ✅ Résolu - 2025-10-01

## 🔐 Conformité

### RGPD (Règlement Général sur la Protection des Données)

**Données collectées:**
- ✅ Geolocation (uniquement avec consentement utilisateur explicite)
- ✅ Préférences de langue (localStorage)
- ✅ Web Vitals (anonymisées)

**Données NON collectées:**
- ❌ Informations personnelles
- ❌ Cookies de tracking
- ❌ Données sensibles

**Droits utilisateurs:**
- Droit à l'effacement: `localStorage.clear()`
- Droit d'accès: Données stockées localement uniquement
- Droit de portabilité: Export JSON disponible

### OWASP Top 10 (2021)

| Vulnérabilité | Status | Protection |
|---------------|--------|------------|
| A01: Broken Access Control | ✅ | Application publique, pas d'auth |
| A02: Cryptographic Failures | ✅ | HTTPS obligatoire, pas de données sensibles |
| A03: Injection | ✅ | Validation Zod, React auto-escape |
| A04: Insecure Design | ✅ | Architecture revue |
| A05: Security Misconfiguration | ⚠️ | En cours (CSP renforcée) |
| A06: Vulnerable Components | ✅ | npm audit automatisé |
| A07: Identification Failures | N/A | Pas d'authentification |
| A08: Software Integrity Failures | ✅ | Package-lock.json, SRI à ajouter |
| A09: Security Logging Failures | ⚠️ | Logs dev uniquement, monitoring à améliorer |
| A10: SSRF | N/A | Pas d'appels serveur externes |

**Dernière revue:** 2025-10-01

## 📞 Contacts

### Équipe Sécurité

**Responsable Sécurité:**
- Email: security@galeon.community
- Temps de réponse: < 24h

**Tech Lead:**
- Email: tech-lead@galeon.community
- Disponible pour questions techniques

**DevOps:**
- Email: devops@galeon.community
- Infrastructure et déploiement

### Canaux de Communication

**Urgent (Critique/Haute):**
- Email: security@galeon.community
- Ne PAS utiliser d'issues publiques

**Non-urgent (Moyenne/Basse):**
- GitHub Issues (pour bugs non-security)
- Email: tech@galeon.community

## 📚 Ressources

### Documentation Interne

- [Plan d'Action 2025](PLAN_ACTION_2025.md) - Feuille de route sécurité
- [Audit Complet 2025](AUDIT_COMPLET_2025.md) - Rapport d'audit détaillé
- [README.md](README.md) - Documentation générale

### Références Externes

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mapbox Security](https://www.mapbox.com/platform/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Cloudflare Security](https://www.cloudflare.com/learning/security/what-is-security/)

## 🔄 Mise à Jour de ce Document

**Dernière mise à jour:** 2025-10-01
**Prochaine révision:** 2026-01-01 (ou après incident de sécurité)
**Version:** 1.0

Ce document est maintenu par l'équipe sécurité Galeon et est revu trimestriellement ou après chaque incident de sécurité.

---

*Pour toute question sur cette politique de sécurité, contactez security@galeon.community*
