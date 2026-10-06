"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";

type Film = {
  id: string;
  title: string;
  kicker: string;
  runtime: string;
  src: string;
  poster: string;
  note: string;
  credit: string;
  creditUrl: string;
};

const films: Film[] = [
  {
    id: "materia-negra",
    title: "MATERIA NEGRA",
    kicker: "FILM 001 — LÍQUIDO OSCURO",
    runtime: "1:00",
    src: "https://videos.pexels.com/video-files/29848606/12817774_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/29848606/3d-3d-render-abstract-animation-29848606.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    note: "Materia líquida respirando en la oscuridad.",
    credit: "3D RENDER",
    creditUrl: "https://www.pexels.com/video/abstract-black-liquid-motion-background-29848606/",
  },
  {
    id: "tinta-viva",
    title: "TINTA VIVA",
    kicker: "FILM 002 — PIGMENTO EN AGUA",
    runtime: "0:32",
    src: "https://videos.pexels.com/video-files/11945942/11945942-uhd_4096_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/11945942/abstract-acrylic-amazing-art-11945942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    note: "Color expandiéndose en cámara lenta.",
    credit: "ENGIN AKYURT",
    creditUrl: "https://www.pexels.com/video/puffs-of-ink-in-water-flowing-in-slow-motion-11945942/",
  },
  {
    id: "pulso",
    title: "PULSO",
    kicker: "FILM 003 — CGI MACRO",
    runtime: "0:16",
    src: "https://videos.pexels.com/video-files/15200535/15200535-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/15200535/3-d-render-3d-3d-render-4k-background-15200535.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    note: "Estructura generativa en primerísimo plano.",
    credit: "PACHON IN MOTION",
    creditUrl: "https://www.pexels.com/video/close-up-view-of-a-3d-abstract-design-in-motion-15200535/",
  },
  {
    id: "corazon-en-llamas",
    title: "CORAZÓN EN LLAMAS",
    kicker: "FILM 004 — FUEGO",
    runtime: "0:20",
    src: "https://videos.pexels.com/video-files/7670835/7670835-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/7670835/pexels-photo-7670835.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200",
    note: "Fuego con forma de órgano vivo.",
    credit: "ROSTISLAV UZUNOV",
    creditUrl: "https://www.pexels.com/video/a-heart-made-of-fire-on-a-black-background-7670835/",
  },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type ControlName = "play" | "pause" | "restart" | "sound" | "muted" | "expand" | "exit";

function ControlIcon({ name }: { name: ControlName }) {
  const paths: Record<ControlName, ReactElement> = {
    play: <path d="M8 5.5 19 12 8 18.5V5.5Z" />,
    pause: <path d="M9 5.5v13M15 5.5v13" />,
    restart: <path d="M19 12a7 7 0 1 1-2.1-5M19 4v4h-4" />,
    sound: <path d="M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4" />,
    muted: <path d="M5 9.5h3l4-3.5v12l-4-3.5H5v-5ZM16 9.8l4.5 4.4M20.5 9.8 16 14.2" />,
    expand: <path d="M9 4.5H4.5V9M15 4.5h4.5V9M19.5 15v4.5H15M4.5 15v4.5H9" />,
    exit: <path d="M4.5 9H9V4.5M19.5 9H15V4.5M15 19.5v-4.5h4.5M9 19.5v-4.5H4.5" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

export default function FilmRoom({ onClose }: { onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);
  const [intensity, setIntensity] = useState(62);
  const [glitching, setGlitching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glitchTimer = useRef<number | null>(null);
  const active = films[activeIndex];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const burst = useCallback(() => {
    setGlitching(true);
    if (glitchTimer.current) window.clearTimeout(glitchTimer.current);
    glitchTimer.current = window.setTimeout(() => setGlitching(false), 840);
  }, []);

  useEffect(() => () => {
    if (glitchTimer.current) window.clearTimeout(glitchTimer.current);
  }, []);

  useEffect(() => {
    if (reducedMotion || !playing || intensity < 72) return;
    const id = window.setInterval(() => {
      if (Math.random() > 0.42) burst();
    }, 3600);
    return () => window.clearInterval(id);
  }, [burst, intensity, playing, reducedMotion]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    void video.play().catch(() => undefined);
  }, []);

  const seekBy = useCallback((offset: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(video.currentTime + offset, 0), video.duration);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const screen = screenRef.current;
    if (!screen) return;
    try {
      if (!document.fullscreenElement) await screen.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* El navegador puede rechazar pantalla completa; el resto sigue funcionando. */
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    setMuted(true);
    const attemptPlay = () => {
      video.play().catch(() => setPlaying(false));
    };
    if (video.readyState >= 2) attemptPlay();
    else {
      const onCanPlay = () => attemptPlay();
      video.addEventListener("canplay", onCanPlay, { once: true });
      return () => video.removeEventListener("canplay", onCanPlay);
    }
  }, [activeIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "A" || tag === "SELECT") return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "m" || event.key === "M") {
        toggleMute();
      } else if (event.key === "f" || event.key === "F") {
        void toggleFullscreen();
      } else if (event.key === "ArrowRight") {
        seekBy(5);
      } else if (event.key === "ArrowLeft") {
        seekBy(-5);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [seekBy, toggleFullscreen, toggleMute, togglePlay]);

  const selectFilm = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setFailed(false);
    setBuffering(true);
    setCurrentTime(0);
    setDuration(0);
    if (!reducedMotion) burst();
  };

  const roomStyle = { "--film-v": intensity / 100 } as CSSProperties;

  return (
    <div
      className="film-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="film-room" style={roomStyle} role="dialog" aria-modal="true" aria-labelledby="film-room-title">
        <header className="film-room-head">
          <div className="film-room-heading">
            <p className="eyebrow eyebrow-light"><span className="eyebrow-marker" /> OTRO PLANO® — SALA DE CINE / 04 FILMS</p>
            <h2 id="film-room-title">La sala de <em>cine.</em></h2>
            <p className="film-room-lede">{active.note} Sube la intensidad hasta que la imagen empiece a romperse.</p>
          </div>
          <button type="button" className="modal-close modal-close-light" onClick={onClose} aria-label="Cerrar la sala de cine">
            <span />
            <span />
          </button>
        </header>

        <div className={`film-screen${glitching ? " is-glitching" : ""}`} ref={screenRef}>
          <div className="film-video-wrap">
            <video
              key={active.id}
              ref={videoRef}
              className="film-video"
              src={active.src}
              poster={active.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onWaiting={() => setBuffering(true)}
              onPlaying={() => setBuffering(false)}
              onCanPlay={() => setBuffering(false)}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onError={() => {
                setFailed(true);
                setBuffering(false);
                setPlaying(false);
              }}
              aria-label={`${active.title}, film experimental de Otro Plano`}
            >
              <source src={active.src} type="video/mp4" />
              Tu navegador no puede reproducir este vídeo.
            </video>
          </div>

          <div className="film-wash" aria-hidden="true" />
          <div className="film-crt" aria-hidden="true" />
          <div className="film-grain" aria-hidden="true" />
          <div className="film-scanline" aria-hidden="true" />
          <div className="film-vignette" aria-hidden="true" />
          <div className="film-letterbox" aria-hidden="true"><span /><span /></div>
          <div className="film-glitchbars" aria-hidden="true"><span /><span /><span /></div>

          <div className="film-hud" aria-hidden="true">
            <span className="film-hud-corner film-hud-tl" />
            <span className="film-hud-corner film-hud-tr" />
            <span className="film-hud-corner film-hud-bl" />
            <span className="film-hud-corner film-hud-br" />
            <span className="film-hud-label film-hud-label-top">{active.kicker}</span>
            <span className="film-hud-label film-hud-label-bottom">INT. {String(intensity).padStart(3, "0")} / 100 — {isFullscreen ? "PANTALLA COMPLETA" : "SALA OP/01"}</span>
          </div>

          {playing && (
            <span className="film-rec" aria-hidden="true">
              <i /> REC {formatTime(currentTime)}
            </span>
          )}

          {buffering && !failed && (
            <div className="film-buffer" role="status">
              <span className="film-buffer-ring" />
              <span>CARGANDO MATERIA…</span>
            </div>
          )}

          {!playing && !buffering && !failed && (
            <button type="button" className="film-bigplay" onClick={togglePlay} aria-label={`Reproducir ${active.title}`}>
              <ControlIcon name="play" />
            </button>
          )}

          {failed && (
            <div className="film-failed" role="status">
              <span>NO PUDIMOS PROYECTAR «{active.title}».</span>
              <a href={active.creditUrl} target="_blank" rel="noreferrer">VER EL ORIGINAL ↗</a>
              <button type="button" onClick={() => selectFilm((activeIndex + 1) % films.length)}>PROBAR OTRO FILM</button>
            </div>
          )}
        </div>

        <div className="film-controls">
          <div className="film-transport">
            <button type="button" className="film-btn film-btn-main" onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"}>
              <ControlIcon name={playing ? "pause" : "play"} />
            </button>
            <button type="button" className="film-btn" onClick={restart} aria-label="Reiniciar film">
              <ControlIcon name="restart" />
            </button>
            <button
              type="button"
              className="film-btn"
              onClick={toggleMute}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
              aria-pressed={!muted}
            >
              <ControlIcon name={muted ? "muted" : "sound"} />
            </button>
            <span className="film-timecode">{formatTime(currentTime)} <i>/</i> {formatTime(duration)}</span>
          </div>

          <label className="film-seek">
            <span className="sr-label">Posición del film</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              disabled={!duration}
              onChange={(event) => {
                const video = videoRef.current;
                if (!video) return;
                video.currentTime = Number(event.target.value);
                setCurrentTime(Number(event.target.value));
              }}
            />
          </label>

          <button
            type="button"
            className="film-btn"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
            aria-pressed={isFullscreen}
          >
            <ControlIcon name={isFullscreen ? "exit" : "expand"} />
          </button>
        </div>

        <div className="film-tuning">
          <label className="film-intensity">
            <span className="film-tuning-label">INTENSIDAD <i>{intensity}</i></span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
            />
          </label>
          <button type="button" className="film-glitch-btn" onClick={burst} disabled={reducedMotion}>
            <span aria-hidden="true">⌁</span> PROVOCAR FALLA
          </button>
          <span className="film-tuning-hint">
            {reducedMotion
              ? "MOVIMIENTO REDUCIDO ACTIVO — EFECTOS SUAVIZADOS"
              : intensity >= 72
                ? "POR ENCIMA DE 72 LA IMAGEN FALLA SOLA"
                : "ESPACIO REPRODUCE · M SILENCIA · F EXPANDE · ← → MUEVEN 5 S"}
          </span>
        </div>

        <div className="film-playlist">
          {films.map((film, index) => (
            <button
              key={film.id}
              type="button"
              className={`film-chip${index === activeIndex ? " film-chip-active" : ""}`}
              onClick={() => selectFilm(index)}
              aria-current={index === activeIndex}
              aria-label={`Proyectar ${film.title}, ${film.runtime}`}
            >
              <span className="film-chip-thumb">
                <Image
                  src={film.poster}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 42vw, 190px"
                />
                <span className="film-chip-index">{String(index + 1).padStart(2, "0")}</span>
                {index === activeIndex && <span className="film-chip-live"><i />EN SALA</span>}
              </span>
              <span className="film-chip-copy">
                <span className="film-chip-title">{film.title}</span>
                <span className="film-chip-meta">{film.runtime} — {film.credit}</span>
              </span>
            </button>
          ))}
        </div>

        <footer className="film-room-foot">
          <span>MATERIAL DE ARCHIVO — PEXELS</span>
          <a href={active.creditUrl} target="_blank" rel="noreferrer">FILM DE {active.credit} ↗</a>
        </footer>
      </section>
    </div>
  );
}
