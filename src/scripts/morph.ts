// Language switch without a page swap. The design switched EN/BG in place:
// scroll position, typed form input, revealed sections, the running hero and
// the map all stayed. The two language versions of a page share one structure,
// so this walks the current DOM alongside the other language's page and
// updates only text and attributes.

// State the page scripts manage; the switch keeps its current value.
const RUNTIME = new Set(['style', 'hidden', 'disabled', 'value', 'checked', 'aria-pressed', 'aria-expanded', 'aria-invalid']);

function syncAttributes(a: Element, b: Element) {
  const keep = new Set((a.getAttribute('data-morph-keep') || '').split(/\s+/).filter(Boolean));
  // data-morph-style: this element's inline style differs by language (and is not script-driven).
  const own = (name: string) => keep.has(name) || (RUNTIME.has(name) && !(name === 'style' && a.hasAttribute('data-morph-style')));
  for (const { name, value } of Array.from(b.attributes)) if (!own(name) && a.getAttribute(name) !== value) a.setAttribute(name, value);
  for (const { name } of Array.from(a.attributes)) if (!own(name) && !b.hasAttribute(name)) a.removeAttribute(name);
}

/** Updates `a` (live) to match `b` (the other language's page). */
export function morph(a: Element, b: Element) {
  syncAttributes(a, b);
  // data-morph-skip: the children are built or filled by script.
  if (a.hasAttribute('data-morph-skip')) return;
  const ac = Array.from(a.childNodes), bc = Array.from(b.childNodes);
  bc.forEach((y, i) => {
    const x = ac[i];
    if (!x) a.appendChild(document.importNode(y, true));
    else if (x.nodeType !== y.nodeType || (x instanceof Element && x.tagName !== (y as Element).tagName)) a.replaceChild(document.importNode(y, true), x);
    else if (x instanceof Element) morph(x, y as Element);
    else if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue;
  });
  for (let i = ac.length - 1; i >= bc.length; i--) ac[i].remove();
}
