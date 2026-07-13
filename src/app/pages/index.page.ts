import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="shell">
      <header class="site-header">
        <a class="brand" routerLink="/">ArbejdsskadeTjek</a>
        <nav class="nav-links">
          <a routerLink="/upload">Upload</a>
          <a routerLink="/fejlkatalog">Fejlkatalog</a>
          <a routerLink="/stot">Støt projektet</a>
          <a routerLink="/api-spec">API-spec</a>
        </nav>
      </header>

      <section class="panel hero">
        <p class="muted">Gratis digital støtte til arbejdsskadesager</p>
        <h1>Forstå din afgørelse hurtigere og mere sikkert</h1>
        <p>
          Upload en afgørelse fra AES eller Ankestyrelsen, få en struktureret AI-vurdering af mulige fejl,
          og få hjælp til næste skridt. Hvis du vil, kan du bagefter frivilligt støtte driften.
        </p>
        <div class="cta-row">
          <a class="btn btn-primary" routerLink="/upload">Start analyse</a>
          <a class="btn btn-soft" routerLink="/stot">Støt projektet</a>
        </div>
      </section>

      <section class="panel text-block">
        <h3>Formålet med denne service</h3>
        <p>
          Siden 1978 har AES og Ankestyrelsen begået fejl i sagsbehandlingen af arbejdsskadesager – og de
          finder ikke selv de berørte sager. Denne service er skabt for at hjælpe dig: på få minutter kan du
          få en vurdering af, om din sag bør genåbnes.
        </p>
        <p class="muted">
          Det anslås, at mellem 11.000 og 57.000 sager indeholder fejl. I gennemsnit har hver skadelidt
          mistet omkring 900.000 kr. i erstatning, og hele 2 ud af 3 har opgivet at klage. Du behøver ikke
          være en af dem.
        </p>
      </section>

      <section class="grid">

        <article class="panel card">
          <h3>1. Upload og samtykke</h3>
          <p class="muted">
            Brugeren accepterer samtykke til analyse, uploader dokumenter og får tydelig info om databehandling.
          </p>
        </article>

        <article class="panel card">
          <h3>2. AI-analyse</h3>
          <p class="muted">
            Systemet vurderer mulige fejl i begrundelse, praksis, oplysning af sagen og mulig sagsbehandling.
          </p>
        </article>

        <article class="panel card">
          <h3>3. Næste skridt</h3>
          <p class="muted">
            Brugeren får forslag til handling, udkast til genoptagelse og mulighed for anonymt bidrag til fejlkataloget.
          </p>
        </article>
      </section>

      <section class="panel text-block">
        <h3>Om finansiering</h3>
        <p class="muted">
          ArbejdsskadeTjek er gratis for borgere. Donationer er frivillige og bruges til AI-kørsel, OCR,
          sikker drift og videreudvikling. Donation påvirker aldrig analysekvalitet eller prioritering.
        </p>
        <a class="btn btn-soft" routerLink="/stot">Se donationsside</a>
      </section>

      <p class="footer-note">
        Vigtigt: Løsningen er et støtteværktøj og erstatter ikke professionel juridisk rådgivning.
      </p>
    </main>
  `,
})
export default class Home {}
