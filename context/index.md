# Kontekst-indeks

Denne fil styrer hvilken kontekst der sendes med til AI-modellen.

Tilføj eller fjern kontekst ved blot at redigere listen af links herunder —
du behøver **ikke** at ændre i koden. Loaderen følger automatisk alle
markdown-links (relative stier) og indlæser indholdet af de filer.

## Aktive kontekstkilder

- [Love og bekendtgørelser](legal/01-love.md)
- [Domme og praksis](legal/02-domme.md)
- [Ombudsmandens praksis](legal/03-ombudsmand.md)

<!--
Sådan tilføjer du mere kontekst:
1. Læg en ny .md-fil et sted under context/ (fx context/legal/04-vejledninger.md).
2. Tilføj en linje herover: - [Titel](legal/04-vejledninger.md)
Det er alt. Ingen kodeændringer nødvendige.

Du kan også linke i undermapper og lade en linket fil selv linke videre til
flere filer — loaderen følger links rekursivt og undgår dubletter.
-->
