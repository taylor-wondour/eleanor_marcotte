# Eleanor Marcotte — Live What Is Yours

A two-page author site. Static HTML, CSS, and one small JavaScript file — no
build step, no framework, no dependencies to install. Drop it in a repository
and turn on GitHub Pages.

- **`index.html`** — the home page. The sun from the workbook cover, Eleanor's
  name, two buttons, a footer. Nothing else.
- **`books.html`** — the Live What Is Yours series: the statement, all six
  books with their status and Amazon links, Eleanor's bio, the closing quote.

---

## 1. Before you publish

Everything you need to change is marked in the files. Two of the four below are
already done; the Amazon links and the site URL still need you.

All site communication — the subscribe form and the Contact link — goes to
**authoreleanormarcotte@gmail.com**.

### a. Amazon links — one still missing

The Workbook and the Daily Tracker & Notes are linked. **The Companion Journal
is still a placeholder.** Open `books.html`, search for **`AMAZON-LINK`** — the
one remaining comment marks it — and replace the `href` on the line below it:

```html
<a class="btn btn-outline btn-sm" href="https://www.amazon.com/dp/REPLACE_WITH_ASIN" ...>
```

Use the book's Amazon detail-page URL. The short form works well:
`https://www.amazon.com/dp/B0XXXXXXXX`.

> If Eleanor is in Amazon Associates, append her tracking tag
> (`?tag=yourtag-20`) — and note that Amazon requires the affiliate disclosure
> to appear on the page. There's a spot for it in the footer.

### b. Subscribe form — already wired, but activate it once

Subscriptions go to **authoreleanormarcotte@gmail.com** through FormSubmit,
which just emails each new address. No account, nothing to log into. It is set
at the top of `assets/js/main.js`:

```js
const SUBSCRIBE_ENDPOINT =
  "https://formsubmit.co/ajax/authoreleanormarcotte@gmail.com";
```

**One thing to do after the site is live:** subscribe once yourself. FormSubmit
replies to that inbox asking to confirm the address — click the link in that
email and every submission from then on is delivered. Until someone confirms,
nothing arrives.

That confirmation email also contains a hashed endpoint
(`https://formsubmit.co/ajax/<random-string>`). Pasting that in place of the
address keeps the Gmail out of the page source, where scrapers read it. Worth
doing.

Switching services later is a one-line change — Formspree
(`https://formspree.io/f/xxxxxxxx`), Buttondown, and ConvertKit all take the
same shape, and make more sense once there's a real list to send to. Set the
value to `""` and the popup says it isn't connected rather than pretending.

### c. Contact address — done

The Contact link in both footers goes to **authoreleanormarcotte@gmail.com**,
the same inbox as the subscribe form. To change it later, it's the one `mailto:`
in each footer.

### d. Site URL

Near the top of `index.html` and `books.html` — replace `https://example.com/`
in the `canonical` and `og:url` tags with the real address. This is what link
previews and search engines use.

---

## 2. Deploy to GitHub Pages

1. Create a new repository (public, or private on a paid plan).
2. Upload everything in this folder — `index.html` must be at the repository
   root, not inside a subfolder.
3. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main`, folder: `/ (root)` → **Save**
4. Wait about a minute. The site appears at
   `https://USERNAME.github.io/REPOSITORY/`.

If the repository is named `USERNAME.github.io`, the site is served from
`https://USERNAME.github.io/` instead.

### From the command line

```bash
git init
git add .
git commit -m "Live What Is Yours — author site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### A custom domain (e.g. eleanormarcotte.com)

1. Create a file named `CNAME` at the root containing only the domain:
   ```
   eleanormarcotte.com
   ```
2. At your DNS provider add four `A` records for the apex domain pointing to
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   and a `CNAME` record for `www` pointing to `USERNAME.github.io`.
3. In **Settings → Pages**, enter the domain and tick **Enforce HTTPS** once
   the certificate is issued (usually within the hour).

---

## 3. What's in here

```
index.html                      home page (name, sun, two buttons)
books.html                      the series, the six books, the bio
assets/css/styles.css           all styling, design tokens at the top
assets/js/main.js               subscribe popup, scroll reveal, config
assets/fonts/                   Bodoni Moda, self-hosted (OFL 1.1)
assets/img/workbook.*           front covers, cropped from the print wraps
assets/img/journal.*            .webp is served first, .jpg is the fallback
assets/img/tracker.*
assets/img/og.jpg               link-preview image (1200×630)
assets/img/favicon.svg          browser tab mark
assets/img/apple-touch-icon.png home-screen icon
.nojekyll                       tells GitHub Pages to serve files as-is
```

The home page is the top half of the workbook cover — full bleed, running off
the top of the page, the colour graduating to white exactly where the page
takes over and the name sitting low on the sun. It is drawn, not photographed:
the sun is SVG inside `index.html`, the field and the halftone are CSS in
`styles.css`. Nothing is a cropped image, so it stays exact at any size.

The site is **light only**. The books are printed on cream and the art is a
sunrise; there is no honest dark version of it.

Every colour comes from the printed covers, sampled from the art:

| Token         | Value     | Where it comes from                   |
|---------------|-----------|---------------------------------------|
| `--sun-core`  | `#F3D550` | the centre of the cover's sun          |
| `--sky-crown` | `#E8D368` | the yellow at the top of the cover     |
| `--paper`     | `#FFFFFF` | the page below the art                 |

Fonts are self-hosted rather than loaded from Google, so the site has no
third-party requests at all — faster, and nothing to disclose in a privacy
policy.

---

## 4. Common edits

**Move a book from Forthcoming to Available.** In `books.html`, find that
book's `<li class="book">` and make three changes:

1. Replace the placeholder block
   ```html
   <div class="book-cover book-cover--placeholder" aria-hidden="true"> … </div>
   ```
   with a `<picture>` block copied from one of the published books, pointing at
   the new cover files.
2. Change `<p class="status status--soon"><span class="dot"></span>Forthcoming</p>`
   to `status--live` and `Available now`.
3. Replace the `Get notified` button with the `View on Amazon` link, again
   copied from a published book, and set its Amazon URL.

**Add a cover image.** Crop the front panel out of the print wrap, save it as
both `.jpg` and `.webp` in `assets/img/`, roughly 520 × 806 pixels, and update
the `src`, `srcset`, and `alt` text.

**Retitle a working title.** Delete the
`<span class="tag">Working title</span>` once the title is final.

**Change the colours or spacing.** Everything lives in the `:root` block at the
top of `styles.css` — one place for ink, paper, the sun yellow, the rhythm of
the section padding. The dark-mode palette sits directly below it.

---

## 5. Notes

- Works without JavaScript: everything is readable and the Amazon links work.
  Only the popup and the fade-in need JS.
- Respects `prefers-reduced-motion` — animation is switched off for anyone who
  has asked their system for less of it.
- The popup traps focus, closes on Escape or a click outside, and returns focus
  to whatever opened it.
- Tested down to 320px wide. No horizontal scroll.
- Any marketing copy that makes a claim about outcomes is worth a second read
  before it goes live.

Bodoni Moda is licensed under the SIL Open Font License 1.1, which permits
self-hosting and redistribution.
