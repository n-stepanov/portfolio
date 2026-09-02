import { contact, profileLinks, projects } from "./data/projects.js";

const app = document.querySelector("#main");
const navLinks = [...document.querySelectorAll("[data-nav]")];

const metaDescription =
  "Original music, sound design and mixing for film, fashion, advertising and visual media.";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setMeta(title, description = metaDescription) {
  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  const canonical = document.querySelector("link[rel='canonical']");
  if (canonical) canonical.setAttribute("href", window.location.pathname);
}

function upsertMeta(kind, key, value) {
  let element = document.querySelector(`meta[${kind}='${key}']`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(kind, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function projectKicker(project) {
  return project.client || project.project || project.for || project.performance || "";
}

function projectFields(project) {
  const rows = [
    ["Client", project.client],
    ["Project", project.project],
    ["Production", project.production],
    ["Type", project.type],
    ["Film", project.film],
    ["For", project.for],
    ["Format", project.format],
    ["Performance", project.performance],
    ["Role", project.role],
    ["Credits", project.credits]
  ];

  if (project.additionalCredit) {
    rows.push(["", project.additionalCredit]);
  }

  return rows.filter(([, value]) => value);
}

function poster(project) {
  if (project.thumbnail) {
    return `<img loading="lazy" src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.title)} thumbnail" data-fallback-title="${escapeHtml(project.title)}" />`;
  }
  return `<div class="poster-fallback" aria-hidden="true">${escapeHtml(project.title)}</div>`;
}

function attachImageFallbacks() {
  document.querySelectorAll("img[data-fallback-title]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const fallback = document.createElement("div");
        fallback.className = "poster-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = image.dataset.fallbackTitle || "";
        image.replaceWith(fallback);
      },
      { once: true }
    );
  });
}

function renderWork() {
  setMeta("Nikolai Stepanov - Composer & Sound Designer");
  setActiveNav("work");
  app.className = "work-page";
  app.innerHTML = `
    <section class="mosaic" aria-label="Portfolio projects">
      ${projects.map(renderProjectTile).join("")}
    </section>
  `;
  attachImageFallbacks();
}

function renderProjectTile(project) {
  const kicker = projectKicker(project);
  return `
    <article class="project-tile ${escapeHtml(project.grid)}">
      <a href="/projects/${project.slug}" data-route aria-label="Open ${escapeHtml(project.title)}">
        <figure>
          <div class="tile-media">${poster(project)}</div>
          <figcaption>
            <span>${escapeHtml(project.title)}</span>
            <small>${escapeHtml([kicker, project.role].filter(Boolean).join(" / "))}</small>
          </figcaption>
        </figure>
      </a>
    </article>
  `;
}

function renderFeed(slug) {
  const feedProjects = orderedFeedProjects();
  const startIndex = Math.max(0, feedProjects.findIndex((project) => project.slug === slug));
  const selected = feedProjects[startIndex];

  setMeta(`${selected.title} - Nikolai Stepanov`);
  setActiveNav(null);
  app.className = "feed-page";
  app.innerHTML = `
    <div class="feed-meta">
      <span>Work</span>
      <span>${escapeHtml(selected.title)}</span>
    </div>
    <div class="project-feed">
      ${feedProjects.slice(startIndex).map(renderProjectSection).join("")}
    </div>
  `;
  observeEmbeds();
}

function orderedFeedProjects() {
  const radioSlug = "radio-morpheus-urvakan";
  const ivanSlug = "ivan-dorn-tic-tac";
  const feedProjects = projects.filter((project) => project.slug !== radioSlug);
  const radioProject = projects.find((project) => project.slug === radioSlug);
  const ivanIndex = feedProjects.findIndex((project) => project.slug === ivanSlug);

  if (!radioProject || ivanIndex < 0) {
    return projects;
  }

  feedProjects.splice(ivanIndex, 0, radioProject);
  return feedProjects;
}

function renderProjectSection(project) {
  return `
    <section class="feed-project" id="${project.slug}" aria-labelledby="${project.slug}-title">
      <div class="media-stack">
        ${project.media.map((media, index) => renderMedia(project, media, index)).join("")}
      </div>
      <div class="project-info">
        <h1 id="${project.slug}-title">${escapeHtml(project.title)}</h1>
        ${project.officialTitle ? `<p class="official-title">${escapeHtml(project.officialTitle)}</p>` : ""}
        <dl>
          ${projectFields(project)
            .map(([label, value]) =>
              label
                ? `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
                : `<div class="credit-note"><dd>${escapeHtml(value)}</dd></div>`
            )
            .join("")}
        </dl>
        ${project.description ? `<p class="description">${escapeHtml(project.description)}</p>` : ""}
        ${project.note ? `<p class="description">${escapeHtml(project.note)}</p>` : ""}
        ${project.links ? renderLinks(project.links) : ""}
      </div>
    </section>
  `;
}

function renderLinks(links) {
  return `
    <ul class="external-links">
      ${links
        .map(
          (link) =>
            `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a></li>`
        )
        .join("")}
    </ul>
  `;
}

function renderMedia(project, media, index) {
  const label = media.label || project.title;
  const ratioClass = media.vertical ? "is-vertical" : "";

  if (media.provider === "placeholder") {
    return `
      <div class="embed-shell placeholder-media ${ratioClass}">
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(media.note || "Video placeholder")}</strong>
        </div>
      </div>
    `;
  }

  if (media.externalOnly) {
    return `
      <a class="embed-shell external-media ${ratioClass}" href="${escapeHtml(media.url)}" target="_blank" rel="noreferrer">
        ${poster(project)}
        <span class="play-label">Watch ${escapeHtml(label)} on YouTube</span>
      </a>
    `;
  }

  return `
    <button class="embed-shell lazy-embed ${ratioClass}" type="button"
      data-provider="${escapeHtml(media.provider)}"
      data-video-id="${escapeHtml(media.id || "")}"
      data-url="${escapeHtml(media.url)}"
      data-embed-url="${escapeHtml(media.embedUrl || "")}"
      data-title="${escapeHtml(label)}">
      ${poster(project)}
      <span class="play-label">Play ${escapeHtml(label)}</span>
    </button>
  `;
}

function observeEmbeds() {
  const embeds = [...document.querySelectorAll(".lazy-embed")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadEmbed(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "900px 0px" }
  );

  embeds.forEach((embed) => {
    embed.addEventListener("click", () => loadEmbed(embed));
    observer.observe(embed);
  });
}

function loadEmbed(element) {
  if (element.dataset.loaded === "true") return;
  const provider = element.dataset.provider;
  const id = element.dataset.videoId;
  const url = element.dataset.url;
  const embedUrl = element.dataset.embedUrl;
  const title = element.dataset.title;
  let src = "";

  if (embedUrl) {
    src = embedUrl;
  } else if (provider === "youtube") {
    src = `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`;
  }

  if (provider === "vimeo") {
    src = `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
  }

  if (provider === "soundcloud" && !src) {
    src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&visual=false`;
  }

  if (!src) return;
  element.dataset.loaded = "true";
  element.innerHTML = `
    <iframe
      src="${src}"
      title="${escapeHtml(title)}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>
  `;
}

function renderAbout() {
  setMeta("About - Nikolai Stepanov");
  setActiveNav("about");
  app.className = "about-page";
  app.innerHTML = `
    <section class="about-layout" aria-label="About Nikolai Stepanov">
      <div class="about-media">
        <figure class="about-portrait">
          <img src="/public/images/nikolai-stepanov-portrait.jpg" alt="Nikolai Stepanov in a recording studio" loading="lazy" />
        </figure>
      </div>
      <div class="about-copy">
        <p class="lead">
          Nikolai Stepanov is a composer, sound designer and multi-instrumentalist focused on
          original music and sound for fashion and advertising. His approach is rooted in
          experimental and electronic music, improvisation and live performance.
        </p>
        <p>
          Outside of commissioned work, he is active in
          <a href="https://stummschalter.com/" target="_blank" rel="noreferrer">Stummschalter</a>
          and
          <a href="https://elektricheskayasobaka.bandcamp.com/?utm_source=chatgpt.com" target="_blank" rel="noreferrer">Elektricheskaya Sobaka</a>,
          co-founded
          <a href="https://soundcloud.com/radio_morpheus" target="_blank" rel="noreferrer">Radio Morpheus</a>,
          and is an invited musician with
          <a href="https://www.berghain.berlin/en/event/82063/" target="_blank" rel="noreferrer">Orchestral Sessions at Berghain</a>.
        </p>
        <div class="about-link-group" aria-label="Links">
          <h2>Links</h2>
          <div class="about-link-list">
            ${profileLinks.links
              .filter((link) => !link.label.includes("Nicolai Schizoph"))
              .map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
              .join("")}
          </div>
        </div>
        <div class="about-link-group" id="contact" aria-label="Contact">
          <h2>Contact</h2>
          <div class="about-link-list compact">
            <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
            ${contact.links.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function setActiveNav(section) {
  navLinks.forEach((link) => {
    link.toggleAttribute("aria-current", link.dataset.nav === section);
  });
}

function render() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const projectMatch = path.match(/^\/projects\/([^/]+)$/);

  if (projectMatch) {
    const slug = projectMatch[1];
    const exists = projects.some((project) => project.slug === slug);
    if (exists) {
      renderFeed(slug);
      return;
    }
  }

  if (path === "/about") {
    renderAbout();
    return;
  }

  renderWork();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");
  if (!link || link.origin !== window.location.origin) return;
  event.preventDefault();
  history.pushState({}, "", link.pathname + link.hash);
  render();
  requestAnimationFrame(() => {
    if (link.hash) {
      document.querySelector(link.hash)?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0 });
    }
    app.focus({ preventScroll: true });
  });
});

window.addEventListener("popstate", render);
render();
