"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import FilmRoom from "./film-room";

const OrbScene = dynamic(() => import("./orb-scene"), {
  ssr: false,
  loading: () => (
    <div className="orb-loading" role="img" aria-label="Materia digital en movimiento">
      <span className="orb-loading-core" />
      <span className="orb-loading-ring orb-loading-ring-one" />
      <span className="orb-loading-ring orb-loading-ring-two" />
    </div>
  ),
});

type Project = {
  id: string;
  index: string;
  name: string;
  discipline: string;
  client: string;
  year: string;
  image: string;
  alt: string;
  description: string;
  statement: string;
};

const projects: Project[] = [
  {
    id: "umbra",
    index: "01 / RITUAL DIGITAL",
    name: "UMBRAL",
    discipline: "MUNDO DIGITAL · CAMPAÑA",
    client: "Casa Umbral",
    year: "2025",
    image: "https://images.pexels.com/videos/29848606/3d-3d-render-abstract-animation-29848606.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Escultura de vidrio líquido púrpura, cromo y luz naranja en un universo oscuro",
    description:
      "Una identidad que no se mira: se cruza. Diseñamos un territorio de luz refractada, materia imposible y movimiento para una nueva casa de perfumería independiente.",
    statement: "La fragancia que deja huella, incluso después de desaparecer.",
  },
  {
    id: "piel",
    index: "02 / CUERPO Y LUZ",
    name: "PIEL SOLAR",
    discipline: "DIRECCIÓN DE ARTE · 3D",
    client: "La hora azul",
    year: "2025",
    image: "https://images.pexels.com/videos/11945942/abstract-acrylic-amazing-art-11945942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Flor de resina color mandarina flotando dentro de una arquitectura azul noche",
    description:
      "Un pequeño estudio de la gravedad convertido en película. Esculpimos en 3D los gestos de una luz cálida que nunca se queda en el mismo sitio.",
    statement: "Una campaña para todo eso que la piel recuerda.",
  },
  {
    id: "limbo",
    index: "03 / UN SITIO ENTRE DOS",
    name: "LIMBO",
    discipline: "INSTALACIÓN · TECNOLOGÍA CREATIVA",
    client: "Proyecto Limbo",
    year: "2024",
    image: "https://images.pexels.com/videos/15200535/3-d-render-3d-3d-render-4k-background-15200535.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    alt: "Escultura translúcida verde suspendida sobre un espejo de agua de noche",
    description:
      "Una instalación especulativa donde la arquitectura responde a la respiración. Una invitación a quedarse un minuto más en el futuro.",
    statement: "No es un lugar. Es la sensación de haber estado allí.",
  },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
    >
      {diagonal ? (
        <path d="M6.5 17.5 17 7m0 0H8m9 0v9" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path d="M20 1.5 23.5 16.5 38.5 20 23.5 23.5 20 38.5 16.5 23.5 1.5 20 16.5 16.5 20 1.5Z" fill="currentColor" />
      <circle cx="20" cy="20" r="3" fill="#171614" />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`reveal ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function OrbStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);
  const [palette, setPalette] = useState(0);
  const [pulseSignal, setPulseSignal] = useState(0);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setActivated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActivated(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className="orb-stage"
      aria-label="Escultura 3D generativa e interactiva"
    >
      <div className="orb-stage-glow" aria-hidden="true" />
      <div className="orb-stage-crosshair" aria-hidden="true">
        <span />
        <span />
      </div>
      {activated ? (
        <OrbScene palette={palette} pulseSignal={pulseSignal} />
      ) : (
        <div className="orb-loading" role="img" aria-label="Materia digital en movimiento">
          <span className="orb-loading-core" />
          <span className="orb-loading-ring orb-loading-ring-one" />
          <span className="orb-loading-ring orb-loading-ring-two" />
        </div>
      )}
      <div className="orb-spec orb-spec-top" aria-hidden="true">
        <span className="orb-spec-pip" /> OBJETO EN FORMACIÓN
      </div>
      <div className="orb-spec orb-spec-bottom" aria-hidden="true">
        <span>MAT. 001</span>
        <span className="orb-spec-divider" />
        <span>ARRASTRA · GIRA 360°</span>
      </div>
      <button
        className="orb-action"
        type="button"
        aria-label={palette === 0 ? "Cambiar a materia cálida y activar pulso" : "Cambiar a materia violeta y activar pulso"}
        aria-pressed={palette !== 0}
        onClick={() => {
          setPalette((current) => (current + 1) % 2);
          setPulseSignal((current) => current + 1);
        }}
      >
        <span className="orb-action-core" aria-hidden="true">
          <StarMark />
        </span>
        <span className="orb-action-label">CAMBIAR<br />MATERIA</span>
      </button>
      <span className="orb-caption">FIG. 01 — ERROR HERMOSO Nº 4</span>
    </div>
  );
}

function ProjectDialog({
  project,
  onClose,
  onPlayVideo,
}: {
  project: Project;
  onClose: () => void;
  onPlayVideo: () => void;
}) {
  return (
    <div
      className="modal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="project-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar ficha del proyecto"
        >
          <span />
          <span />
        </button>
        <div className="dialog-image">
          <Image
            src={project.image}
            alt={project.alt}
            fill
            sizes="(max-width: 760px) 100vw, 74vw"
            quality={85}
          />
          <span className="dialog-image-index">{project.index}</span>
        </div>
        <div className="dialog-copy">
          <div className="dialog-topline">
            <span>{project.discipline}</span>
            <span>{project.year} — {project.client}</span>
          </div>
          <h2 id="project-dialog-title">{project.name}<span>.</span></h2>
          <p className="dialog-statement">“{project.statement}”</p>
          <p className="dialog-description">{project.description}</p>
          <button className="dialog-film-link" type="button" onClick={onPlayVideo}>
            <span className="dialog-film-play" aria-hidden="true">▶</span>
            ENTRAR A LA SALA DE CINE <Arrow diagonal />
          </button>
        </div>
      </section>
    </div>
  );
}

export default function StudioExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const modalOpen = Boolean(activeProject || videoOpen);

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal-armed");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const updateProgress = () => {
      const distance = root.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
      root.style.setProperty("--page-progress", `${progress * 100}%`);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeButton = document.querySelector<HTMLElement>(".modal-close");
    closeButton?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
        setVideoOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousActiveElement?.focus();
    };
  }, [modalOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <div className="page-progress" aria-hidden="true" />
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="site-header">
        <div className="nav-inner">
          <a className="brand" href="#inicio" aria-label="Otro Plano, ir al inicio" onClick={closeMenu}>
            <span className="brand-glyph" aria-hidden="true">
              <svg viewBox="0 0 38 38" fill="none">
                <circle cx="19" cy="19" r="15" />
                <ellipse cx="19" cy="19" rx="6.5" ry="15" />
                <ellipse cx="19" cy="19" rx="15" ry="6.5" />
                <circle className="brand-glyph-center" cx="19" cy="19" r="2.2" />
              </svg>
            </span>
            <span className="brand-wordmark">OTRO<br />PLANO<span>®</span></span>
          </a>

          <span className="nav-location"><span className="nav-live-dot" /> EST. EN TODAS PARTES <span>·</span> CDMX</span>

          <nav className={`nav-links${menuOpen ? " nav-links-open" : ""}`} aria-label="Navegación principal">
            <a href="#trabajo" onClick={closeMenu}><span>01</span> TRABAJO</a>
            <a href="#estudio" onClick={closeMenu}><span>02</span> LO QUE HACEMOS</a>
            <a href="#contacto" onClick={closeMenu}><span>03</span> CONTACTO</a>
          </nav>

          <a className="nav-invite" href="mailto:hola@otroplano.studio">
            HABLEMOS <Arrow diagonal />
          </a>

          <button
            ref={menuButtonRef}
            className={`mobile-menu-toggle${menuOpen ? " mobile-menu-toggle-open" : ""}`}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span />
            <span />
          </button>
        </div>
        <div id="mobile-navigation" className={`mobile-nav${menuOpen ? " mobile-nav-open" : ""}`}>
          <a href="#trabajo" onClick={closeMenu}><span>01 /</span> TRABAJO <Arrow diagonal /></a>
          <a href="#estudio" onClick={closeMenu}><span>02 /</span> LO QUE HACEMOS <Arrow diagonal /></a>
          <a href="#contacto" onClick={closeMenu}><span>03 /</span> CONTACTO <Arrow diagonal /></a>
          <span className="mobile-nav-note">CDMX — DISPONIBLES EN TODAS PARTES</span>
        </div>
      </header>

      <main id="contenido">
        <section className="hero page-gutter" id="inicio" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow"><span className="eyebrow-marker" /> ESTUDIO CREATIVO INDEPENDIENTE <span className="eyebrow-divider">/</span> CDMX · EN CUALQUIER LUGAR</div>
            <h1 id="hero-title">
              <span>No hacemos</span>
              <span>cosas.</span>
              <span className="hero-h1-third">Hacemos</span>
              <span className="hero-h1-final">mundos<span className="hero-period">.</span></span>
            </h1>
            <p className="hero-description">Diseñamos experiencias digitales para quienes sienten que la realidad todavía tiene espacio para algo más.</p>
            <div className="hero-actions">
              <a className="button-primary" href="#trabajo">EXPLORAR EL TRABAJO <span className="button-arrow"><Arrow /></span></a>
              <a className="hero-text-link" href="#estudio"><span className="hero-link-mark">↘</span> LA FORMA DE HACERLO</a>
            </div>
            <div className="hero-footnote"><span>UN POCO CÓDIGO.</span><span>UN POCO ALGO QUE NO TIENE NOMBRE.</span></div>
          </div>

          <div className="hero-art">
            <div className="hero-art-index" aria-hidden="true"><span>34°03' N</span><span>118°14' W</span></div>
            <OrbStage />
            <div className="hero-orbit-note"><span className="hero-orbit-note-star">✳</span><span>NO ES UN OBJETO.<br />ES UN COMPORTAMIENTO.</span></div>
          </div>

          <div className="hero-side-mark" aria-hidden="true"><span>CREANDO OTRAS POSIBILIDADES</span><span>DESDE 2019</span></div>
          <a className="hero-scroll" href="#trabajo"><span className="hero-scroll-dot" /> BAJA UN POCO <span>↓</span></a>
        </section>

        <div className="ticker" aria-label="No se hace, se descubre">
          <div className="ticker-track" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span className="ticker-item" key={index}>
                <span>NO SE HACE</span><StarMark className="ticker-star" /><span>SE DESCUBRE</span><StarMark className="ticker-star ticker-star-outline" /><span>OTRO PLANO</span><StarMark className="ticker-star" />
              </span>
            ))}
          </div>
        </div>

        <section className="work-section" id="trabajo" aria-labelledby="work-title">
          <div className="work-inner page-gutter">
            <Reveal className="work-intro">
              <div className="section-index section-index-light"><span>01 — ARCHIVO VIVO</span><span>2024 — 2026 <i>↘</i></span></div>
              <div className="work-headline-row">
                <h2 id="work-title">Un pie acá.<br /><em>El otro, quién sabe.</em></h2>
                <p>Ideas que pidieron otro medio para existir. Fragmentos de mundos que nos tocó dejar salir.</p>
              </div>
            </Reveal>

            <div className="project-grid">
              {projects.map((project, index) => (
                <Reveal key={project.id} className={`project-reveal project-reveal-${index + 1}`} delay={index * 105}>
                  <button
                    className={`project-card project-card-${project.id}`}
                    type="button"
                    onClick={() => setActiveProject(project)}
                    aria-label={`Ver detalles del proyecto ${project.name}`}
                  >
                    <span className="project-visual">
                      <Image
                        className="project-image"
                        src={project.image}
                        alt={project.alt}
                        fill
                        sizes="(max-width: 700px) 90vw, (max-width: 1040px) 45vw, 30vw"
                        quality={82}
                      />
                      <span className="project-image-tint" />
                      <span className="project-number">{project.index}</span>
                      <span className="project-open" aria-hidden="true"><Arrow diagonal /></span>
                      <span className={`project-image-word project-image-word-${project.id}`} aria-hidden="true">{project.name}</span>
                    </span>
                    <span className="project-details">
                      <span className="project-details-main"><span className="project-name">{project.name}<span className="project-name-dot">.</span></span><span className="project-category">{project.discipline}</span></span>
                      <span className="project-year">{project.year} <Arrow diagonal /></span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal className="reel-reveal">
              <button className="reel-poster" type="button" onClick={() => setVideoOpen(true)} aria-label="Abrir la sala de cine con cuatro films experimentales">
                <Image
                  src="https://images.pexels.com/videos/29848606/3d-3d-render-abstract-animation-29848606.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 90vw"
                  quality={80}
                />
                <span className="reel-poster-wash" />
                <span className="reel-header">
                  <span className="reel-rec"><i />SALA DE CINE</span>
                  <span>04 FILMS — MATERIA, TINTA, PULSO Y FUEGO</span>
                  <span>2026</span>
                </span>
                <span className="reel-title" aria-hidden="true">SENTIR<br /><em>ES CREER.</em></span>
                <span className="reel-strip" aria-hidden="true">
                  {["MATERIA", "TINTA", "PULSO", "FUEGO"].map((label, index) => (
                    <span className="reel-strip-cell" key={label}>
                      <span className="reel-strip-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="reel-strip-label">{label}</span>
                    </span>
                  ))}
                </span>
                <span className="reel-play"><span aria-hidden="true">▶</span></span>
                <span className="reel-footer">
                  <span>CONTROLES PROPIOS · INTENSIDAD · FALLAS</span>
                  <span>ENTRAR A LA SALA <Arrow diagonal /></span>
                </span>
                <span className="reel-glitch" aria-hidden="true" />
              </button>
            </Reveal>
          </div>
        </section>

        <section className="manifesto page-gutter" id="estudio" aria-labelledby="manifesto-title">
          <Reveal className="manifesto-layout">
            <div className="section-index manifesto-index"><span>02 — CÓMO MIRAMOS</span><span>UNA IDEA, NO UN MÉTODO <i>✳</i></span></div>
            <div className="manifesto-head">
              <span className="manifesto-mark" aria-hidden="true"><StarMark /></span>
              <p className="eyebrow">NO TENEMOS TODAS LAS RESPUESTAS.</p>
              <h2 id="manifesto-title">Eso nos deja<br />mucho espacio<br />para <em>preguntar.</em></h2>
              <p className="manifesto-description">Somos un estudio de mentes distintas y teclados abiertos. Hacemos diseño con tecnología y tecnología con intención. Si no existe la herramienta, inventamos una. Si ya existe, vemos si podemos llevarla a otro sitio.</p>
              <a className="manifesto-link" href="mailto:hola@otroplano.studio?subject=Hola%20Otro%20Plano">¿QUÉ TE DA CURIOSIDAD? <span><Arrow diagonal /></span></a>
            </div>
            <div className="manifesto-side" aria-hidden="true"><span>LO IMPROBABLE<br />TAMBIÉN<br /><em>SE PROTOTIPA.</em></span><span>OP / 19—∞</span></div>
          </Reveal>
        </section>

        <section className="approach page-gutter" aria-labelledby="approach-title">
          <Reveal className="approach-inner">
            <div className="section-index"><span>03 — NUESTRO CAMPO DE JUEGO</span><span>NO VIENE EN UNA CAJA <i>↘</i></span></div>
            <div className="approach-heading">
              <h2 id="approach-title">Lo pensamos.<br /><span>Lo hacemos.</span><em>Lo hacemos sentir.</em></h2>
              <p>Una idea nunca llega sola. La acompañamos desde el primer dibujo hasta el último píxel de luz.</p>
            </div>
            <div className="service-list">
              <article className="service-row">
                <span className="service-number">01</span>
                <h3>Identidad en movimiento</h3>
                <p>Dirección creativa, mundos visuales y narrativas de marca con lugar para sorprender.</p>
                <span className="service-symbol" aria-hidden="true"><span>↗</span></span>
              </article>
              <article className="service-row">
                <span className="service-number">02</span>
                <h3>Imágenes imposibles</h3>
                <p>CGI, animación y películas cortas para hacer visible lo que solo podías imaginar.</p>
                <span className="service-symbol service-symbol-orbit" aria-hidden="true"><span>◎</span></span>
              </article>
              <article className="service-row">
                <span className="service-number">03</span>
                <h3>Código con sensibilidad</h3>
                <p>Experiencias web, generativas e interactivas, diseñadas alrededor de las personas.</p>
                <span className="service-symbol service-symbol-star" aria-hidden="true"><span>✳</span></span>
              </article>
              <article className="service-row">
                <span className="service-number">04</span>
                <h3>Lugares para perderse</h3>
                <p>Instalaciones, espacios digitales y experimentos entre lo físico y lo que viene.</p>
                <span className="service-symbol service-symbol-cross" aria-hidden="true"><span>⌗</span></span>
              </article>
            </div>
            <div className="approach-foot"><span>ESTUDIO PEQUEÑO. IMAGINACIÓN SIN HORARIO.</span><span>CDMX — 34°03' N <i>·</i> TRABAJAMOS EN TODAS PARTES <i>✳</i></span></div>
          </Reveal>
        </section>

        <section className="contact-section page-gutter" id="contacto" aria-labelledby="contact-title">
          <Reveal className="contact-inner">
            <div className="section-index section-index-light"><span>04 — LO QUE TODAVÍA NO EXISTE</span><span>NOS DA CURIOSIDAD <i>✳</i></span></div>
            <div className="contact-heading">
              <div className="contact-orbit" aria-hidden="true"><span /><span /><i>OP</i></div>
              <p className="eyebrow eyebrow-light"><span className="eyebrow-marker" /> PUERTAS ABIERTAS PARA BUENAS PREGUNTAS</p>
              <h2 id="contact-title">¿Y si lo<br /><em>hacemos?</em></h2>
              <a className="contact-cta" href="mailto:hola@otroplano.studio?subject=Tenemos%20una%20idea">
                <span>CUÉNTANOS QUÉ ESTÁS IMAGINANDO</span><span className="contact-cta-arrow"><Arrow diagonal /></span>
              </a>
            </div>
            <div className="contact-foot"><span>NOS ENCANTAN LAS BUENAS IDEAS.<br />TAMBIÉN LAS QUE TODAVÍA NO SABEN QUÉ SON.</span><a href="mailto:hola@otroplano.studio">HOLA@OTROPLANO.STUDIO <Arrow diagonal /></a></div>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer page-gutter">
        <a className="brand footer-brand" href="#inicio" aria-label="Otro Plano, volver al inicio">
          <span className="brand-glyph" aria-hidden="true">
            <svg viewBox="0 0 38 38" fill="none"><circle cx="19" cy="19" r="15" /><ellipse cx="19" cy="19" rx="6.5" ry="15" /><ellipse cx="19" cy="19" rx="15" ry="6.5" /><circle className="brand-glyph-center" cx="19" cy="19" r="2.2" /></svg>
          </span>
          <span className="brand-wordmark">OTRO<br />PLANO<span>®</span></span>
        </a>
        <span className="footer-note">UN ESTUDIO CON LOS PIES ACÁ<br />Y LA CABEZA, QUIÉN SABE.</span>
        <a className="footer-back-top" href="#inicio">VOLVER ARRIBA <span>↑</span></a>
        <span className="footer-copy">© OTRO PLANO 2026 · HECHO CON INTENCIÓN Y UN POCO DE CÓDIGO.</span>
      </footer>

      {activeProject && (
        <ProjectDialog
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onPlayVideo={() => {
            setActiveProject(null);
            setVideoOpen(true);
          }}
        />
      )}
      {videoOpen && <FilmRoom onClose={() => setVideoOpen(false)} />}
    </>
  );
}

