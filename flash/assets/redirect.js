(() => {
  /* ======================
     CONFIG: list your base hosts here (no protocol)
     Matches exact host and subdomains (e.g. "example.com" -> "cdn.example.com").
     ====================== */
  const BASE_HOSTS = [
    "www.kongregate.com",
    "yepi.com"
  ];

  /* ---------- Helpers ---------- */
  function isMatchingHost(urlString) {
    try {
      const hostname = new URL(urlString, location.href).hostname;
      return BASE_HOSTS.some(base => hostname === base || hostname.endsWith("." + base));
    } catch (e) {
      return false;
    }
  }

  // Build "local/<filename>" (no leading slash). If no filename, use "index".
  function localPathFor(urlString) {
    try {
      const u = new URL(urlString, location.href);
      const parts = u.pathname.split("/").filter(Boolean);
      let name = parts.pop() || "index";
      // If filename contains forbidden characters, sanitize a bit
      name = name.replace(/[^A-Za-z0-9.\-_~]/g, "_");
      return "local/" + name;
    } catch (e) {
      return "local/index";
    }
  }

  // For a given attribute/string, return replacement string or null
  function replacementForValue(val) {
    if (!val) return null;
    // Don't treat data: or blob: or about: etc
    if (/^[a-z]+:/i.test(val) && !/^https?:/i.test(val) && !/^\//.test(val)) {
      // keep non-http protocols untouched (data:, blob:, about:, javascript:, etc)
      return null;
    }
    let abs;
    try {
      abs = new URL(val, location.href).href;
    } catch (e) {
      return null;
    }
    if (isMatchingHost(abs)) return localPathFor(abs);
    return null;
  }

  // Parse and rewrite srcset attribute entries
  function rewriteSrcset(value) {
    if (!value) return value;
    // srcset entries: "<url> [<descriptor>], ...". We'll split on commas and trim.
    const parts = value.split(",").map(p => p.trim()).filter(Boolean);
    const newParts = parts.map(entry => {
      // URL is the first token (others are descriptors like '1x', '100w')
      const tokens = entry.split(/\s+/);
      const urlToken = tokens[0];
      const rest = tokens.slice(1).join(" ");
      const rep = replacementForValue(urlToken);
      return (rep || urlToken) + (rest ? " " + rest : "");
    });
    return newParts.join(", ");
  }

  /* ---------- DOM rewriting ---------- */
  function rewriteElement(el) {
    if (!el || el.nodeType !== 1) return;
    // Handle common attributes
    const ATTRS = ["src", "href", "data", "srcset"];
    for (const attr of ATTRS) {
      if (!el.hasAttribute || !el.hasAttribute(attr)) continue;
      const orig = el.getAttribute(attr);
      try {
        if (attr === "srcset") {
          const rewritten = rewriteSrcset(orig);
          if (rewritten !== orig) el.setAttribute(attr, rewritten);
        } else {
          const rep = replacementForValue(orig);
          if (rep) el.setAttribute(attr, rep);
        }
      } catch (e) {
        // ignore per-item errors
      }
    }
  }

  // Initial pass on existing nodes (broad selector)
  function rewriteExisting() {
    const selector = [
      'script[src]',
      'link[href]',
      'img[src]',
      'img[srcset]',
      'source[src]',
      'source[srcset]',
      'iframe[src]',
      'audio[src]',
      'video[src]',
      'track[src]',
      'embed[src]',
      'object[data]',
      '[style]' // not parsing inline CSS, but keep here if you want to extend
    ].join(",");
    document.querySelectorAll(selector).forEach(node => {
      // object uses "data" attribute; others handled in rewriteElement
      if (node.tagName && node.tagName.toLowerCase() === "object") {
        const data = node.getAttribute("data");
        const rep = replacementForValue(data);
        if (rep) node.setAttribute("data", rep);
      } else {
        rewriteElement(node);
      }
    });
  }

  /* ---------- Observe DOM for dynamic changes ---------- */
  function observeDOM() {
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            rewriteElement(n);
            // rewrite descendants that might have attributes
            n.querySelectorAll && n.querySelectorAll('script[src],link[href],img[src],img[srcset],source[src],source[srcset],iframe[src],audio[src],video[src],track[src],embed[src],object[data]').forEach(rewriteElement);
          });
        } else if (m.type === "attributes") {
          rewriteElement(m.target);
        }
      }
    });

    mo.observe(document.documentElement || document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "href", "data", "srcset"]
    });
  }

  /* ---------- API surface patches ---------- */
  // Patch fetch to rewrite URLs
  function patchFetch() {
    if (!window.fetch) return;
    const origFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      try {
        if (input instanceof Request) {
          const url = input.url;
          const rep = replacementForValue(url);
          if (rep) input = new Request(rep, input);
        } else {
          const url = String(input);
          const rep = replacementForValue(url);
          if (rep) input = rep;
        }
      } catch (e) { /* swallow */ }
      return origFetch(input, init);
    };
  }

  // Patch XMLHttpRequest.open
  function patchXHR() {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      try {
        const abs = new URL(url, location.href).href;
        const rep = replacementForValue(abs);
        if (rep) url = rep;
      } catch (e) { /* ignore */ }
      return origOpen.call(this, method, url, async, user, password);
    };
  }

  // Override Element.setAttribute so attributes are normalized even before insertion or if frameworks call setAttribute
  function patchSetAttribute() {
    const orig = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      try {
        if (!value) return orig.call(this, name, value);
        const lower = String(name).toLowerCase();
        if (lower === "srcset") {
          const rewritten = rewriteSrcset(String(value));
          return orig.call(this, name, rewritten);
        }
        if (lower === "src" || lower === "href" || lower === "data") {
          const rep = replacementForValue(String(value));
          if (rep) value = rep;
        }
      } catch (e) { /* ignore */ }
      return orig.call(this, name, value);
    };
  }

  /* ---------- Initialization ---------- */
  try {
    rewriteExisting();
    observeDOM();
    patchFetch();
    patchXHR();
    patchSetAttribute();
  } catch (err) {
    console.error("multi-local-redirector init error:", err);
  }

  // Expose helpers for debugging / runtime usage
  window.__multiLocalRedirector = {
    BASE_HOSTS,
    isMatchingHost,
    localPathFor,
    replacementForValue,
    rewriteExisting,
    rewriteElement,
    rewriteSrcset
  };

  // Helpful console message
  if (window && window.console && window.console.info) {
    console.info("multi-local-redirector active for hosts:", BASE_HOSTS);
  }
})();
