// /gd-redirect.js
(() => {
  'use strict';

  // Match root-relative or absolute URLs that include /StreamingAssets/...
  // Captures "StreamingAssets/..." (no leading slash)
  const STREAMING_RE = /^(?:https?:\/\/[^\/]+)?\/(StreamingAssets\/[^\s"'<>?#]+)/i;

  // Compute a forced page-directory base (ignores <base> tag so we always resolve
  // relative to the folder containing the current document).
  // e.g. location.href = "http://host/path/to/index.html"
  // pageDirHref -> "http://host/path/to/"
  const pageDirHref = (function () {
    try {
      return location.href.replace(/\/[^\/]*$/, '/');
    } catch (e) {
      return location.href;
    }
  })();

  function getStreamingReplacement(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const s = String(url);
      const m = s.match(STREAMING_RE);
      if (m && m[1]) {
        // Resolve the captured path relative to the page directory.
        // This gives an absolute URL like:
        // http://host/path/to/StreamingAssets/aa15z.../settings.json
        return new URL(m[1], pageDirHref).href;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  // Helper used everywhere: if a replacement URL exists, return it; otherwise null.
  function getReplacement(url) {
    return getStreamingReplacement(url);
  }

  // Replace a script element's src (if needed)
  function rewriteScriptTag(el) {
    try {
      if (!el || el.tagName !== 'SCRIPT') return false;
      const currentSrc = el.getAttribute && el.getAttribute('src');
      if (!currentSrc) return false;
      const replacement = getReplacement(currentSrc);
      if (replacement) {
        if (el.hasAttribute('integrity')) el.removeAttribute('integrity');
        if (el.hasAttribute('crossorigin')) el.removeAttribute('crossorigin');
        el.setAttribute('src', replacement);
        try { el.src = replacement; } catch (e) {}
        el.setAttribute('data-gd-redirected', '1');
        console.info('[gd-redirect] script rewritten ->', replacement, ' (was:', currentSrc, ')');
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  // Patch DOM insertion APIs to rewrite added script tags
  const origAppend = Node.prototype.appendChild;
  Node.prototype.appendChild = function (node) {
    rewriteScriptTag(node);
    return origAppend.call(this, node);
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, ref) {
    rewriteScriptTag(newNode);
    return origInsertBefore.call(this, newNode, ref);
  };

  // Intercept setAttribute for script.src
  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    try {
      if (this.tagName === 'SCRIPT' && String(name).toLowerCase() === 'src') {
        const replacement = getReplacement(value);
        if (replacement) {
          if (this.hasAttribute && this.hasAttribute('integrity')) this.removeAttribute('integrity');
          if (this.hasAttribute && this.hasAttribute('crossorigin')) this.removeAttribute('crossorigin');
          console.info('[gd-redirect] setAttribute(src) rewritten ->', replacement, ' (was:', value, ')');
          return origSetAttribute.call(this, name, replacement);
        }
      }
    } catch (e) { /* ignore */ }
    return origSetAttribute.call(this, name, value);
  };

  // Intercept direct script.src assignment
  try {
    const desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    if (desc && desc.set) {
      const origSetter = desc.set;
      Object.defineProperty(HTMLScriptElement.prototype, 'src', {
        set: function (val) {
          try {
            const replacement = getReplacement(val);
            if (replacement) {
              if (this.hasAttribute && this.hasAttribute('integrity')) this.removeAttribute('integrity');
              if (this.hasAttribute && this.hasAttribute('crossorigin')) this.removeAttribute('crossorigin');
              console.info('[gd-redirect] property src setter rewritten ->', replacement, ' (was:', val, ')');
              return origSetter.call(this, replacement);
            }
          } catch (e) {}
          return origSetter.call(this, val);
        },
        get: function () {
          return desc.get ? desc.get.call(this) : (this.getAttribute ? this.getAttribute('src') : undefined);
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) { /* ignore */ }

  // Replace matches inside HTML strings (document.write / insertAdjacentHTML)
  function replaceInHtmlString(html) {
    if (typeof html !== 'string') return html;

    // absolute-origin occurrences like "http://host/.../StreamingAssets/..."
    html = html.replace(/https?:\/\/[^"'<>\s]*\/StreamingAssets\/[^\s"'<>]*/gi, (m) => {
      const replacement = getReplacement(m);
      return replacement || m;
    });

    // root-relative occurrences like "/StreamingAssets/..."
    html = html.replace(/\/StreamingAssets\/[^\s"'<>]*/gi, (m) => {
      const replacement = getReplacement(m);
      return replacement || m;
    });

    return html;
  }

  // Patch insertAdjacentHTML and document.write/writeln
  const origInsertAdjacentHTML = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function (pos, html) {
    return origInsertAdjacentHTML.call(this, pos, replaceInHtmlString(html));
  };

  const origWrite = document.write.bind(document);
  document.write = function (...args) {
    const replaced = args.map(a => typeof a === 'string' ? replaceInHtmlString(a) : a);
    return origWrite(...replaced);
  };
  document.writeln = function (...args) {
    const replaced = args.map(a => typeof a === 'string' ? replaceInHtmlString(a) : a);
    return origWrite(...replaced.map(x => x + '\n'));
  };

  // MutationObserver to catch dynamically-added nodes
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n && n.nodeType === 1) {
          if (n.tagName === 'SCRIPT') rewriteScriptTag(n);
          const scripts = n.querySelectorAll ? n.querySelectorAll('script') : [];
          for (const s of scripts) rewriteScriptTag(s);
        }
      }
    }
  });
  observer.observe(document.documentElement || document, { childList: true, subtree: true });

  // Run over existing scripts
  queueMicrotask(() => {
    const s = document.getElementsByTagName('script');
    for (let i = 0; i < s.length; i++) rewriteScriptTag(s[i]);
  });

  // Intercept fetch
  if (window.fetch) {
    const origFetch = window.fetch.bind(window);
    window.fetch = async function (resource, init) {
      try {
        let urlStr = null;
        if (typeof resource === 'string') urlStr = resource;
        else if (resource && resource.url) urlStr = resource.url;

        const replacement = getReplacement(urlStr);
        if (replacement) {
          console.info('[gd-redirect] fetch ->', replacement, ' (was:', urlStr, ')');
          if (resource instanceof Request) {
            // copy existing request but point to replacement
            resource = new Request(replacement, {
              method: resource.method,
              headers: resource.headers,
              body: resource.body,
              mode: resource.mode,
              credentials: resource.credentials,
              cache: resource.cache,
              redirect: resource.redirect,
              referrer: resource.referrer,
              integrity: resource.integrity
            });
          } else {
            resource = replacement;
          }
        }
      } catch (e) {}
      return origFetch(resource, init);
    };
  }

  // Intercept XHR.open
  (function () {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      try {
        if (typeof url === 'string') {
          const replacement = getReplacement(url);
          if (replacement) {
            console.info('[gd-redirect] XHR.open ->', replacement, ' (was:', url, ')');
            arguments[1] = replacement;
          }
        }
      } catch (e) {}
      return origOpen.apply(this, arguments);
    };
  })();

  // Patch Worker constructor
  try {
    const OrigWorker = window.Worker;
    window.Worker = function (scriptURL, options) {
      if (typeof scriptURL === 'string') {
        const replacement = getReplacement(scriptURL);
        if (replacement) {
          console.info('[gd-redirect] Worker script ->', replacement, ' (was:', scriptURL, ')');
          scriptURL = replacement;
        }
      }
      return new OrigWorker(scriptURL, options);
    };
  } catch (e) {}

  // Patch importScripts (best-effort)
  try {
    if (typeof importScripts === 'function') {
      const origImport = importScripts;
      window.importScripts = function (...args) {
        const rewritten = args.map(a => getReplacement(a) || a);
        return origImport.apply(this, rewritten);
      };
    }
  } catch (e) {}

  // Debug info
  window.__gdRedirect = {
    replacementFor: getReplacement.toString(),
    pageDirHref: pageDirHref,
    streamingRe: STREAMING_RE.toString()
  };

  console.info('[gd-redirect] active; rewriting /StreamingAssets/... (root/absolute) -> same-folder StreamingAssets URL');
})();
