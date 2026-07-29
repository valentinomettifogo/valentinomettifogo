# Alert Qlik Cloud su Google Chat — messa in opera

Come passare da "codice nel repo" a "gli alert arrivano davvero", per il sito
pubblicato su **valentinomettifogo.com**.

I passi sono in ordine e ognuno si verifica da solo. Il 5 (Qlik) va fatto per ultimo:
prima devi sapere che il resto funziona, altrimenti non capisci quale pezzo è rotto.

---

## 0. Come funziona, e i due segreti

```
Qlik Cloud                    valentinomettifogo.com                Google Chat
──────────                    ──────────────────────                ───────────
reload fallito
      │
      │  POST  ?cliente=Acme                    ①
      │  + QLIK_WEBHOOK_TOKEN  ─────────────────────►  /api/webhooks/qlik
                                                              │
                                                     scarta i reload OK
                                                              │
                                    ②  ◄─── api_key del tenant ──┤
                              GET /api/v1/apps/<appId>          │  (best-effort)
                              GET /api/v1/spaces/<spaceId>      │
                                                              │
                                                              │  ③ POST
                                                              └────────────►  messaggio
```

### A cosa serve `QLIK_WEBHOOK_TOKEN` se ogni cliente ha già la sua API key

Sono due segreti che viaggiano in **direzioni opposte**, e nessuno dei due può fare il
lavoro dell'altro.

| | `QLIK_WEBHOOK_TOKEN` | `api_key` del tenant |
|---|---|---|
| Direzione | Qlik → il tuo sito (freccia ①) | il tuo sito → Qlik (freccia ②) |
| Risponde a | "chi sta chiamando il mio endpoint?" | "con che diritto leggo i dati di questo tenant?" |
| Quanti | **uno solo**, per tutti i clienti | **uno per cliente** |
| Dove sta | env var su Vercel | colonna `api_key` di `qlik_tenants` |
| Se manca | l'endpoint risponde 401 a tutti | l'alert parte lo stesso, con l'appId grezzo |

Il punto è questo: `/api/webhooks/qlik` è un URL pubblico su Internet. Chiunque lo
indovini può mandarci una POST. La API key del cliente **non risolve il problema**,
perché Qlik non te la manda nella chiamata — la usi tu *dopo*, per fare le domande al
tenant. Serve quindi qualcosa che Qlik ti rimandi indietro a ogni chiamata come prova di
identità: quello è `QLIK_WEBHOOK_TOKEN`.

Senza, chiunque potrebbe riempire la chat di allarmi Qlik falsi. Non è un rischio
drammatico, ma è fastidioso e si evita con una riga di configurazione.

Detto altrimenti: il token è **la serratura della porta**, le API key sono **le chiavi
degli archivi** dentro casa. Il token non identifica *quale* cliente sta chiamando —
quello lo dice `?cliente=` — dice solo che la chiamata viene da un webhook che hai
configurato tu.

> C'è anche una terza opzione che oggi non usiamo: Qlik può firmare il payload in
> HMAC-SHA256 con un suo *secret* e mandare la firma nell'header `qlik-signature`. È più
> robusto di un token condiviso, ma richiede di verificare la firma nel codice. Se un
> domani serve, si aggiunge in `isAuthorized()`.

---

## 1. Supabase — tabella e ruolo

1. SQL editor → incolla ed esegui
   [`docs/supabase/20260730000000_create_qlik_tenants.sql`](supabase/20260730000000_create_qlik_tenants.sql).
   È idempotente, rieseguirlo non fa danni.
2. Table editor → `public.users` → trova la tua riga (esiste dal primo login) e metti
   `role` a **`admin`**. Va fatto a mano una volta sola: da lì in poi i ruoli si
   assegnano da `/admin`, e `admin` è l'unico ruolo che può censire i tenant.

**Verifica:** in Table editor vedi `qlik_tenants`, con RLS attiva e zero policy. È voluto:
solo il server la tocca, con la service-role key. Se un domani un bug passasse quella
tabella al client, tornerebbe vuota invece delle API key dei clienti.

---

## 2. Google Chat — webhook in entrata

Ne hai già uno per un'altra cosa, quindi lo spazio è già predisposto. Ne serve uno
**dedicato**, così puoi revocarlo senza toccare l'altro.

1. Apri lo spazio su [chat.google.com](https://chat.google.com).
2. Freccia accanto al nome dello spazio → **App e integrazioni**.
3. **Aggiungi webhook** (`Add webhooks`).
4. **Nome**: qualcosa di riconoscibile, es. `Qlik Alerts`.
   **URL avatar**: facoltativo, ma comodo per distinguerlo a colpo d'occhio.
5. **Salva** → menù **⋮** → **Copia link**.

Ottieni un URL di questa forma:

```
https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=KEY&token=TOKEN
```

**Va trattato come una password.** Chi ce l'ha scrive nello spazio. Non finisce mai nel
repo: sta solo nelle env di Vercel e nel tuo `.env` locale.

Cose da sapere:

- I webhook in entrata **esistono solo sugli account Google Workspace**, non sugli account
  personali `@gmail.com`. Se l'altro webhook già ti funziona, sei a posto.
- **Limite: 1 richiesta al secondo per spazio**, condiviso fra tutti i webhook. Se un
  tenant fallisce 30 reload nello stesso istante, qualche messaggio può essere rifiutato:
  in quel caso l'endpoint restituisce 502 e lo vedi rosso nello storico di Qlik.
- Il corpo che mandiamo è `{"text": "..."}`. Gli asterischi nel messaggio (`*Cliente:*`)
  sono la sintassi grassetto di Chat, non un errore.

**Verifica**, da terminale (Git Bash):

```bash
curl -X POST "<URL_COPIATO>" -H 'content-type: application/json' \
  -d '{"text":"prova"}'
```

Se "prova" compare nello spazio, il pezzo Chat è finito.

---

## 3. Vercel — variabili e dominio

Nel progetto → Settings → Environment Variables:

| Variabile | Ambienti | Note |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | **tutti e tre** | inlinata a build time |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **tutti e tre** | inlinata a build time |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | bypassa la RLS: mai in una `PUBLIC_` |
| `QLIK_WEBHOOK_TOKEN` | Production, Preview | il token del punto 0 |
| `GOOGLE_CHAT_WEBHOOK_URL` | Production, Preview | l'URL del punto 2 |

Le due `PUBLIC_` servono anche in **Development**, altrimenti `vercel build` in locale
fallisce: sono cotte nel bundle, non lette a runtime.

Il token, se te ne serve uno nuovo:

```bash
node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"
```

> Uno ne ho già generato e messo nel tuo `.env` locale. Puoi usare quello anche in
> produzione (copialo da lì) oppure generarne un altro — l'importante è che il valore su
> Vercel e quello dentro la configurazione Qlik siano **identici**.

Poi, dominio e auth:

1. Settings → Domains → aggiungi `valentinomettifogo.com`. Vercel elegge
   `www.valentinomettifogo.com` a dominio primario e fa rispondere l'apex con un
   redirect 308: **da qui in avanti, ovunque, si usa il `www.`** — vedi la nota al
   punto 5, è il motivo per cui un webhook può fallire senza lasciare traccia nei log.
2. Supabase → Authentication → URL Configuration:
   - **Site URL**: `https://www.valentinomettifogo.com`
   - **Redirect URLs**: aggiungi
     ```
     https://www.valentinomettifogo.com/auth/callback
     http://localhost:5173/auth/callback
     ```
3. Google Cloud console → Credentials → il tuo OAuth client → **Authorized redirect URI**:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
   **Non** l'URL dell'app. Google parla con Supabase, e Supabase parla con l'app. Sbagliare
   qui è la causa numero uno di `redirect_uri_mismatch`.

**Verifica:** apri `https://www.valentinomettifogo.com/api/webhooks/qlik` nel browser. Deve
rispondere `405 — Qlik webhook endpoint: POST only.` Se vedi la pagina di errore 404 di
SvelteKit, il deploy non è andato.

---

## 4. Censire i tenant

Vai su `https://www.valentinomettifogo.com/portal` e aggiungi una riga per cliente
(serve il ruolo `admin`: gli `analytics` la pagina la vedono ma in sola lettura):

- **Client** — il nome così come lo vuoi leggere in chat, es. `Acme`. Da questo nasce lo
  slug (minuscolo, spazi tolti) che dovrà comparire in `?cliente=`.
- **Tenant host** — es. `acme.eu.qlikcloud.com`. Senza `https://`, senza slash finale.
  È il campo che rende possibile lo step 2 anche per i tenant il cui host non segue lo
  schema `<nome>.eu.qlikcloud.com`.
- **Qlik API key** — generata nel tenant del cliente: profilo → *Impostazioni del profilo*
  → **Chiavi API** → *Genera nuova chiave*. Serve solo in lettura su app e spazi.

Poi premi **Check all keys**: ogni riga deve dire `Key valid`. Una riga che dice
`Key invalid or expired` va sistemata adesso, non quando arriverà il primo allarme.

> **Nota onesta sulla casella "Active":** oggi è solo informativa. L'endpoint cerca il
> tenant per slug e non guarda quel flag, quindi togliere la spunta **non** silenzia gli
> alert di quel cliente. Se ti serve davvero un interruttore per cliente, dimmelo: è una
> condizione in `findTenantBySlug()`.

---

## 5. Creare il webhook su Qlik Cloud

Da fare **una volta per tenant**, dentro il tenant del cliente, con un account
amministratore.

1. **Administration** (activity center) → **Webhooks** → **Create new**.
2. Compila:

   | Campo | Valore |
   |---|---|
   | **Name** | `Alert reload falliti` |
   | **Description** | a piacere |
   | **Post to URL** | `https://www.valentinomettifogo.com/api/webhooks/qlik?cliente=Acme` — **con il `www.`**, vedi sotto |
   | **Event type** | *Reload finished* (`com.qlik.v1.reload.finished`) |
   | **Level** | `Tenant` — serve per vedere i reload di tutti, non solo i tuoi |
   | **Owner** | te stesso |
   | **Enabled** | sì (è il default) |

3. **Headers** → aggiungi un header:

   ```
   x-webhook-token : <QLIK_WEBHOOK_TOKEN>
   ```

   Qlik cifra i valori degli header, quindi il token non resta in chiaro da nessuna parte.
   In alternativa puoi metterlo in coda all'URL (`&token=...`) — l'endpoint accetta
   entrambi — ma così finisce nei log di Vercel e nello storico di consegna di Qlik.
   **Preferisci l'header.**

4. Il campo **Secret** lascialo vuoto: è la firma HMAC di cui sopra, che oggi non
   verifichiamo.

> **Il `www.` non è un dettaglio.** Su Vercel il dominio primario è
> `www.valentinomettifogo.com` e l'apex `valentinomettifogo.com` risponde con un
> **308 Permanent Redirect**. I browser lo seguono in silenzio, i client webhook no:
> Qlik registra `redirects are forbidden 308 (308 Permanent Redirect)` e butta via
> l'evento, senza riprovare. La stessa regola vale per gli URL di Supabase
> (Site URL e Redirect URLs), che devono anch'essi puntare al `www.`.
>
> Se preferisci l'apex, l'alternativa è invertire il primario in Vercel →
> Settings → Domains; ma cambiare un URL nel webhook costa meno.

Attenzione al parametro `cliente`:

- deve corrispondere, una volta normalizzato, allo slug della riga in `/portal`
  (`Acme` → `acme`);
- se il nome ha spazi vanno codificati: `?cliente=San%20Marco`.

Se sbagli, non perdi l'alert: arriva comunque, ma senza nome app e senza nome spazio,
perché l'arricchimento ha bisogno della riga per trovare la API key.

### Quale evento scegliere

- **`com.qlik.v1.reload.finished`** — reload schedulati e via API. È quello che ti serve
  nel 99% dei casi, ed è quello che Qlik stessa consiglia per i workflow che dipendono
  dall'esito finale.
- **`com.qlik.v1.app.reload.finished`** — emesso dal motore a fine ricarica. Più a basso
  livello.

I due usano parole diverse per dire la stessa cosa (`FAILED` il primo, `error` il
secondo): l'endpoint li riconosce entrambi, quindi puoi iscriverti a uno, all'altro o a
tutti e due. Se ti iscrivi a entrambi metti **due webhook separati**, e aspettati alert
doppi sullo stesso fallimento.

Non serve impostare filtri lato Qlik: i reload andati bene li scarta l'endpoint,
rispondendo `200 {"action":"ignored"}`.

---

## 6. Verifica finale

**Sul tenant, senza aspettare un guasto vero:** apri un'app, sporca lo script di caricamento
(es. una `LOAD` da un file che non esiste), lancia il reload. Deve arrivare in chat:

```
🚨 ALLARME QLIK SENSE 🚨

🏢 Cliente: Acme
📁 App: Vendite Mensili
🗂️ Spazio: Analytics
⚠️ Stato: Ricaricamento fallito
```

Poi ricontrolla **Administration → Webhooks → lo storico di consegna** (Qlik lo conserva
7 giorni). Cosa significano i codici:

| Codice | Significato |
|---|---|
| `200` `{"action":"sent"}` | tutto a posto, messaggio consegnato |
| `200` `{"action":"ignored"}` | reload riuscito, nessun allarme — normale |
| `401` | token mancante o diverso da quello su Vercel |
| `400` | corpo non JSON: non dovrebbe succedere con Qlik |
| `500 no_notifier` | manca `GOOGLE_CHAT_WEBHOOK_URL` su Vercel |
| `502` | Chat ha rifiutato il messaggio (spesso: 1 msg/sec superato) |

**Il caso che conta di più:** metti una API key scaduta su un tenant di prova e fai
fallire un reload. **L'alert deve arrivare lo stesso**, con l'ID dell'app al posto del
nome. L'arricchimento peggiora, non blocca mai. È l'invariante su cui è costruito tutto,
ereditata dal vecchio Apps Script.

---

## Non arriva niente: da dove si guarda

In ordine. Ogni passo esclude metà dei possibili colpevoli, quindi non saltarne uno.

### 1. Qlik ha chiamato? — storico di consegna

**Administration → Webhooks → il tuo webhook → storico** (7 giorni di retention). È la
prima cosa da guardare sempre, perché distingue subito i due mondi:

- **Nessuna riga** → il problema è tutto lato Qlik: webhook disattivato, evento sbagliato,
  `Level` a `User` mentre il reload lo lancia un altro utente. Il tuo sito non c'entra.
- **`redirects are forbidden 308`** → manca il `www.` nell'URL. Qlik non segue i
  redirect e scarta l'evento: la richiesta non raggiunge mai il codice, quindi nei log
  di Vercel non trovi niente. Vedi la nota al punto 5.
- **Altre righe** → leggi il codice di risposta e salta al punto 3.

### 2. Il sito risponde? — prova a mano

```bash
curl -i https://www.valentinomettifogo.com/api/webhooks/qlik
```

Deve dare `405` e il testo `Qlik webhook endpoint: POST only.` Se dà 404, il deploy non
contiene la route.

Poi simula un fallimento, saltando Qlik del tutto:

```bash
curl -i -X POST "https://www.valentinomettifogo.com/api/webhooks/qlik?cliente=Acme" \
  -H "x-webhook-token: <QLIK_WEBHOOK_TOKEN>" \
  -H 'content-type: application/json' \
  -d '{"id":"test","type":"com.qlik.v1.reload.finished","data":{"appId":"finto","status":"FAILED"}}'
```

Se qui arriva il messaggio in chat, la catena sito → Chat è sana e il problema è a monte
(punto 1). Se non arriva, il codice di risposta ti dice cosa manca — vedi la tabella dei
codici sopra.

### 3. I log su Vercel

Progetto → **Logs** (o **Observability → Logs**), filtro sul path
`/api/webhooks/qlik`. Assicurati che il periodo selezionato copra il momento del test:
il default è spesso "ultima ora".

Ogni chiamata accettata scrive **una riga di riepilogo**:

```
[qlik-hook] { client: 'Acme', slug: 'acme', tenantFound: true,
              hasApiKey: true, type: 'com.qlik.v1.reload.finished',
              status: 'FAILED', appId: '8f3c…' }
```

Come si legge:

| Cosa vedi | Cosa significa |
|---|---|
| nessuna riga | la richiesta non è mai arrivata, oppure è stata respinta con 401 |
| `[qlik-hook] 401: token mismatch` | il token c'è ma è diverso da quello su Vercel |
| `[qlik-hook] 401: QLIK_WEBHOOK_TOKEN is not set` | la env non è arrivata in produzione |
| `status` diverso da `FAILED`/`error` | l'evento è arrivato ma era un reload riuscito |
| `tenantFound: false` | lo slug in `?cliente=` non corrisponde a nessuna riga di `/portal` |
| `hasApiKey: false` | tenant trovato ma senza chiave: alert sì, nomi no |
| `GOOGLE_CHAT_WEBHOOK_URL is not set` | manca la env dell'URL di Chat |
| `[qlik-hook] alert sent to google-chat` | inviato davvero: se non lo vedi, guarda **quale** spazio |

> **La causa numero uno.** Su Vercel le variabili d'ambiente vengono lette **al momento
> del deploy**: se le hai aggiunte dopo aver pubblicato, il deploy in aria non le vede.
> Deployments → l'ultimo → **Redeploy**. Fallo prima di cercare altrove.

### 4. Vedere il payload vero

Se tutto sembra a posto ma lo `status` non è quello che ti aspetti, aggiungi su Vercel:

```
QLIK_WEBHOOK_DEBUG=1
```

e rifai il deploy. Da quel momento ogni evento accettato finisce nei log per intero
(`[qlik-hook] raw payload: {...}`), così vedi esattamente come Qlik lo chiama.
**Rimettila a vuoto quando hai finito**: è molto verbosa.

---

## Problemi comuni

**Non arriva niente e lo storico Qlik è vuoto.** Il webhook è disattivato, oppure il
livello è `User` invece di `Tenant` e il reload lo lancia un altro utente.

**Storico Qlik: 401.** Il token nell'header non coincide con `QLIK_WEBHOOK_TOKEN` su
Vercel. Occhio agli spazi in coda quando incolli. Ricorda che se cambi una env su Vercel
devi **rifare il deploy** perché la nuova venga letta.

**Arriva l'ID dell'app invece del nome.** L'arricchimento non è riuscito. Nell'ordine:
slug sbagliato in `?cliente=`, tenant non censito in `/portal`, API key assente o scaduta,
host sbagliato. Il pulsante *Check* in `/portal` distingue i casi in due secondi.

**Arriva il nome dell'app ma non lo spazio.** Normale se l'app sta nello spazio personale
del proprietario: in quel caso il messaggio dice `Personal space`. Se non dice niente,
la chiamata a `/api/v1/spaces/...` è fallita — di solito una API key con permessi troppo
stretti.

**Alert doppi.** Ti sei iscritto sia a `reload.finished` che a `app.reload.finished`.

**In locale con traffico Qlik vero.** Esponi il dev server con
`npx localtunnel --port 5173` e punta lì un solo webhook di prova.

---

## Riferimenti

- [Google Chat — webhook in entrata](https://developers.google.com/workspace/chat/quickstart/webhooks)
- [Qlik — creare webhook](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-administer-webhook-create.htm)
- [Qlik — eventi supportati](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-administer-webhooks-supported-events.htm)
- [Qlik — verifica firma HMAC](https://qlik.dev/apis/event/verify-webhook-signatures-hmac/)
