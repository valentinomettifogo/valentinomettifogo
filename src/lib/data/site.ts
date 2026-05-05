// Dati statici temporanei — da sostituire con chiamate backend
export type Person = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  email: string;
};

export type Project = {
  title: string;
  description: string;
  link: string;
  image: string;
};

export const me: Person = {
  name: 'Valentino Mettifogo',
  role: 'Sviluppatore, Team Leader & Creativo',
  bio: 'Costruisco esperienze digitali pulite, funzionali e minimaliste. Appassionato di codice, design e attenzione ai dettagli.',
  photo: 'https://vtwglrhdyqakouqxdwzi.supabase.co/storage/v1/object/public/valentinomettifogo/hero.jpg',
  email: 'ciao@iltuositoweb.it'
};

export const projects: Project[] = [
  {
    title: 'Il Mio Primo Progetto',
    description:
      "Un'applicazione web che risolve un problema specifico con un'interfaccia utente super intuitiva. Sviluppata per garantire massima velocità e usabilità.",
    link: '#',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop'
  }
];
