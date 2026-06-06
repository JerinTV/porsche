import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Car,
  ChevronRight,
  Cpu,
  Gem,
  Gauge,
  Menu,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Timer,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import './styles.css';

const heroFrameCount = 100;
const heroFrames = Array.from({ length: heroFrameCount }, (_, index) => {
  const frameNumber = Math.min(300, index * 3 + 1);
  const frame = String(frameNumber).padStart(3, '0');
  return `/frames/ezgif-frame-${frame}.png`;
});

const transitionFrameCount = 208;
const transitionFrames = Array.from({ length: transitionFrameCount }, (_, index) => {
  const frame = String(index + 1).padStart(3, '0');
  return `/transition/ezgif-frame-${frame}.png`;
});

const gallery = [
  {
    src: '/porsche/track-rear.jpeg',
    label: 'Track presence',
    title: 'A shape built for absolute focus.',
  },
  {
    src: '/porsche/aero-studio.jpeg',
    label: 'Airflow',
    title: 'Performance visible in every surface.',
  },
  {
    src: '/porsche/rear-wing.jpeg',
    label: 'Rear wing',
    title: 'Confidence written in carbon and light.',
  },
  {
    src: '/porsche/interior.jpeg',
    label: 'Cockpit',
    title: 'Everything placed around the driver.',
  },
];

const trims = [
  {
    id: 'shark',
    name: 'Shark Blue',
    image: '/frames/ezgif-frame-035.png',
    accent: '#8edcff',
    surface: 'Studio blue finish',
    note: 'A cool, high-contrast visual specification with black aero details.',
  },
  {
    id: 'white',
    name: 'Carrara White',
    image: '/porsche/aero-studio.jpeg',
    accent: '#f4fbff',
    surface: 'Track white finish',
    note: 'Clean bodywork, red wheel accents, and a focused circuit stance.',
  },
  {
    id: 'silver',
    name: 'GT Silver',
    image: '/porsche/track-rear.jpeg',
    accent: '#c8d2d7',
    surface: 'Classic metallic finish',
    note: 'A timeless Porsche look shaped by motorsport proportions.',
  },
];

const specs = [
  { value: '518', suffix: 'hp', label: 'Power output' },
  { value: '3.0', suffix: 's', label: '0-60 mph' },
  { value: '184', suffix: 'mph', label: 'Top track speed' },
  { value: '911', suffix: '', label: 'Iconic model line' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

function usePageMotion() {
  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      const scroll = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--scroll-ratio', String(scroll / max));
      document.documentElement.style.setProperty('--hero-shift', `${Math.min(90, scroll * 0.12)}px`);
      document.documentElement.style.setProperty('--hero-scale', String(1 + Math.min(0.08, scroll * 0.00008)));
      frame = 0;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}

function HeroCanvas({ onCaptionActive }) {
  const canvasRef = React.useRef(null);
  const imagesRef = React.useRef([]);
  const rafRef = React.useRef(0);
  const lastTickRef = React.useRef(0);
  const [frame, setFrame] = React.useState(0);
  const [loadedFirst, setLoadedFirst] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const drawFrame = React.useCallback((index) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[index];
    if (!canvas || !image?.complete) return;

    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * ratio));
    const height = Math.max(1, Math.floor(rect.height * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    heroFrames.forEach((src, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!mounted) return;
        imagesRef.current[index] = image;
        if (index === 0) setLoadedFirst(true);
      };
      image.src = src;
    });

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    drawFrame(frame);
  }, [drawFrame, frame, loadedFirst]);

  React.useEffect(() => {
    const onResize = () => drawFrame(frame);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFrame, frame]);

  React.useEffect(() => {
    if (reducedMotion) return undefined;

    const tick = (time) => {
      if (!lastTickRef.current) lastTickRef.current = time;
      if (time - lastTickRef.current > 24) {
        setFrame((current) => (current + 1) % heroFrameCount);
        lastTickRef.current = time;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]);

  React.useEffect(() => {
    onCaptionActive?.(frame >= Math.floor(heroFrameCount * 0.68));
  }, [frame, onCaptionActive]);

  return (
    <div className="hero-media" aria-hidden="true">
      <canvas ref={canvasRef} className="cinematic-canvas" />
      <div className="media-vignette" />
      {!loadedFirst && (
        <div className="loader">
          <span>Loading</span>
          <div className="loader-track">
            <i style={{ width: '38%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar() {
  const [active, setActive] = React.useState('top');
  const navItems = [
    ['models', 'Models'],
    ['performance', 'Performance'],
    ['studio', 'Studio'],
    ['gallery', 'Gallery'],
    ['contact', 'Enquire'],
  ];

  React.useEffect(() => {
    const sections = ['top', ...navItems.map(([id]) => id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.35, 0.65] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="topbar">
      <a className="crest" href="#top" aria-label="Porsche home">PORSCHE</a>
      <nav aria-label="Primary">
        {navItems.map(([id, label]) => (
          <a className={active === id ? 'active' : ''} href={`#${id}`} key={id}>{label}</a>
        ))}
      </nav>
      <button className="menu-button" type="button" aria-label="Open menu">
        <Menu size={20} />
      </button>
    </header>
  );
}

function Hero() {
  const [showCaption, setShowCaption] = React.useState(false);

  return (
    <section className="hero-shell" id="top" aria-label="Porsche campaign hero">
      <Topbar />
      <HeroCanvas onCaptionActive={setShowCaption} />
      <div className={`hero-side-copy left ${showCaption ? 'visible' : ''}`} aria-hidden={!showCaption}>
        <span>Motorsport DNA</span>
        <strong>Aerodynamics sharpened for grip.</strong>
      </div>
      <div className={`hero-side-copy right ${showCaption ? 'visible' : ''}`} aria-hidden={!showCaption}>
        <span>Driver first</span>
        <strong>Every input returns precision.</strong>
      </div>
    </section>
  );
}

function AnimatedSpec({ value, suffix, label }) {
  const ref = React.useRef(null);
  const [display, setDisplay] = React.useState('0');

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const target = Number(value);
    const decimals = value.includes('.') ? 1 : 0;
    let raf = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1200;
        const tick = (time) => {
          const progress = Math.min(1, (time - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay((target * eased).toFixed(decimals));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.45 }
    );
    observer.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [value]);

  return (
    <div className="stat" ref={ref}>
      <strong>{display}<small>{suffix}</small></strong>
      <span>{label}</span>
    </div>
  );
}

function ModelSection() {
  return (
    <section className="model-section section-pad" id="models">
      <div className="section-head reveal">
        <p className="eyebrow">The 911 spirit</p>
        <h2>Motorsport poise, road presence.</h2>
      </div>
      <div className="model-layout">
        <div className="model-image reveal">
          <img src="/porsche/aero-studio.jpeg" alt="Porsche 911 GT3 RS in aerodynamic studio testing" />
        </div>
        <div className="model-copy reveal">
          <p>
            The 911 GT3 RS turns motorsport technology into a focused road car:
            direct, lightweight, aerodynamic, and visually unmistakable from
            every angle.
          </p>
          <div className="stats-row">
            {specs.map((spec) => (
              <AnimatedSpec key={spec.label} {...spec} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TransitionFilm() {
  const canvasRef = React.useRef(null);
  const imageCache = React.useRef(new Map());
  const rafRef = React.useRef(0);
  const lastTickRef = React.useRef(0);
  const [frame, setFrame] = React.useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const getImage = React.useCallback((index) => {
    const src = transitionFrames[index];
    const cached = imageCache.current.get(src);
    if (cached) return cached;

    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    imageCache.current.set(src, image);
    return image;
  }, []);

  const drawFrame = React.useCallback((index) => {
    const canvas = canvasRef.current;
    const image = getImage(index);
    if (!canvas || !image.complete) return;

    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * ratio));
    const height = Math.max(1, Math.floor(rect.height * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const horizontalCrop = image.width * 0.09;
    const sourceWidth = image.width - horizontalCrop * 2;
    const scale = Math.max(width / sourceWidth, height / image.height);
    const drawWidth = sourceWidth * scale;
    const drawHeight = image.height * scale;

    ctx.drawImage(
      image,
      horizontalCrop,
      0,
      sourceWidth,
      image.height,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
  }, [getImage]);

  React.useEffect(() => {
    for (let offset = 0; offset < 12; offset += 1) {
      getImage((frame + offset) % transitionFrameCount);
    }
    drawFrame(frame);
  }, [drawFrame, frame, getImage]);

  React.useEffect(() => {
    const onResize = () => drawFrame(frame);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFrame, frame]);

  React.useEffect(() => {
    if (reducedMotion) return undefined;

    const tick = (time) => {
      if (!lastTickRef.current) lastTickRef.current = time;
      if (time - lastTickRef.current > 42) {
        setFrame((current) => (current + 1) % transitionFrameCount);
        lastTickRef.current = time;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]);

  return (
    <section className="transition-film" aria-label="Porsche motion feature">
      <div className="transition-copy transition-left reveal">
        <span>Designed to look calm</span>
      </div>
      <div className="transition-video reveal">
        <canvas ref={canvasRef} />
        <div className="transition-shine" />
      </div>
      <div className="transition-copy transition-right reveal">
        <span>at impossible speed</span>
      </div>
    </section>
  );
}

function StudioSection() {
  const [selected, setSelected] = React.useState(trims[0]);

  return (
    <section className="studio-section section-pad" id="studio">
      <div className="studio-copy reveal">
        <p className="eyebrow">Interactive studio</p>
        <h2>Choose the presence. Keep the attitude.</h2>
        <p>
          A scalable product section for trims, colors, media, and campaign
          variants. The layout can expand into a full configurator without
          changing the page architecture.
        </p>
      </div>
      <div className="studio-stage reveal" style={{ '--trim-accent': selected.accent }}>
        <div className="studio-image">
          <img src={selected.image} alt={`Porsche 911 GT3 RS in ${selected.name}`} />
        </div>
        <div className="trim-panel">
          <span>{selected.surface}</span>
          <h3>{selected.name}</h3>
          <p>{selected.note}</p>
          <div className="swatches" aria-label="Select exterior finish">
            {trims.map((trim) => (
              <button
                className={selected.id === trim.id ? 'selected' : ''}
                key={trim.id}
                onClick={() => setSelected(trim)}
                style={{ '--swatch': trim.accent }}
                type="button"
                aria-label={`Select ${trim.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card reveal">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function PerformanceSection() {
  return (
    <section className="performance-section section-pad" id="performance">
      <div className="section-head center reveal">
        <p className="eyebrow">Performance language</p>
        <h2>Luxury with tension, not decoration.</h2>
      </div>
      <div className="feature-grid">
        <Feature icon={<Gauge size={24} />} title="Driver Focus" text="Dark cockpit contrast and clean UI rhythm keep attention on the machine." />
        <Feature icon={<Wind size={24} />} title="Aero Presence" text="Wing, stance, and airflow details are treated as premium visual anchors." />
        <Feature icon={<Cpu size={24} />} title="Technical Precision" text="Every detail supports response, feedback, and confidence at speed." />
        <Feature icon={<ShieldCheck size={24} />} title="Brand Finish" text="Sharp spacing, responsive scale, and restrained blue-white color create polish." />
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section className="gallery-section section-pad" id="gallery">
      <div className="section-head reveal">
        <p className="eyebrow">Gallery</p>
        <h2>Exterior, aero, cockpit, motion.</h2>
      </div>
      <div className="gallery-grid">
        {gallery.map((item) => (
          <article className="gallery-card reveal" key={item.src}>
            <img src={item.src} alt={item.title} />
            <div>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CraftSection() {
  return (
    <section className="craft-section" id="craft">
      <img src="/porsche/track-front.jpeg" alt="Porsche 911 GT3 RS on track" />
      <div className="craft-panel reveal">
        <p className="eyebrow">Motorsport character</p>
        <h2>Performance that looks fast before it moves.</h2>
        <p>
          From its wide stance to the signature rear wing, the 911 GT3 RS is a
          statement of control, grip, and intent.
        </p>
        <a className="text-link" href="#contact">
          Request a private viewing <ChevronRight size={18} />
        </a>
      </div>
    </section>
  );
}

function ImmersiveSection() {
  return (
    <section className="immersive-section">
      <div className="sticky-copy reveal">
        <p className="eyebrow">Dynamic by design</p>
        <h2>The page responds like a product reveal.</h2>
        <p>
          Sticky imagery, progressive copy, animated measurements, and interactive
          selection patterns create a premium site that can scale across an
          entire model family.
        </p>
      </div>
      <div className="timeline">
        <article className="timeline-card reveal">
          <MousePointer2 size={22} />
          <h3>Explore</h3>
          <p>Visitors move from cinematic impact into model details without a hard visual break.</p>
        </article>
        <article className="timeline-card reveal">
          <Gem size={22} />
          <h3>Configure</h3>
          <p>Color and trim modules can expand into wheels, interiors, packages, and pricing.</p>
        </article>
        <article className="timeline-card reveal">
          <Timer size={22} />
          <h3>Convert</h3>
          <p>The final enquiry area is built for booking, test drives, dealer routing, or lead capture.</p>
        </article>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="experience-section section-pad">
      <div className="experience-copy reveal">
        <p className="eyebrow">Scalable website system</p>
        <h2>Ready for models, launches, events, and enquiries.</h2>
      </div>
      <div className="experience-list">
        <div className="experience-item reveal">
          <Car size={24} />
          <span>Model showroom pages</span>
        </div>
        <div className="experience-item reveal">
          <Sparkles size={24} />
          <span>Campaign visuals and launch stories</span>
        </div>
        <div className="experience-item reveal">
          <Wrench size={24} />
          <span>Performance technology and design stories</span>
        </div>
        <div className="experience-item reveal">
          <Timer size={24} />
          <span>Event, test drive, and booking flows</span>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="contact-section section-pad" id="contact">
      <div className="contact-copy reveal">
        <p className="eyebrow">Porsche 911 GT3 RS</p>
        <h2>Make the first impression feel engineered.</h2>
      </div>
      <form className="contact-form reveal">
        <label>
          Name
          <input type="text" placeholder="Your name" />
        </label>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Interest
          <select defaultValue="911">
            <option value="911">911 GT3 RS</option>
            <option value="launch">Track experience</option>
            <option value="showroom">Digital showroom</option>
          </select>
        </label>
        <button type="button">
          Request private consultation <Zap size={18} />
        </button>
      </form>
    </section>
  );
}

function RevealObserver() {
  React.useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.18 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return null;
}

function App() {
  usePageMotion();

  return (
    <main>
      <RevealObserver />
      <Hero />
      <div className="brand-divider" aria-label="Porsche">
        <span>PORSCHE</span>
      </div>
      <TransitionFilm />
      <ModelSection />
      <PerformanceSection />
      <StudioSection />
      <GallerySection />
      <CraftSection />
      <ImmersiveSection />
      <ExperienceSection />
      <ContactSection />
      <footer>
        <span>PORSCHE</span>
        <p>911 GT3 RS performance, design, gallery, and enquiry experience.</p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
