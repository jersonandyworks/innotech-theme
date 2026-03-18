(function () {
    'use strict';

    // ── Config ────────────────────────────────────────────────────────────────
    const DEBOUNCE_MS    = 300;
    const MIN_CHARS      = 2;
    const DROPDOWN_LIMIT = 6;

    const ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    // ── DOM refs ──────────────────────────────────────────────────────────────
    const container = document.getElementById('latest-blog-container');
    if (!container) return;

    const input    = container.querySelector('.innotech-blog__search-input');
    const postsDiv = container.querySelector('.innotech-blog__posts');
    const catBtns  = container.querySelectorAll('.innotech-blog__cat-btn');
    if (!input || !postsDiv) return;

    // ── REST endpoints (via wp_localize_script) ───────────────────────────────
    const cfg           = window.innotechBlogSearch || {};
    const POSTS_URL     = cfg.postsUrl      || '/wp-json/wp/v2/posts';
    const CATS_URL      = cfg.categoriesUrl || '/wp-json/wp/v2/categories';
    const PER_PAGE      = cfg.perPage       || 10;

    // ── State ─────────────────────────────────────────────────────────────────
    let debounceTimer  = null;
    let dropdownEl     = null;
    let activeIndex    = -1;
    let latestResults  = [];
    let catIdCache     = {};           // slug → id
    const originalHTML = postsDiv.innerHTML;

    // ── Utilities ─────────────────────────────────────────────────────────────
    function stripTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return (tmp.textContent || tmp.innerText || '').trim();
    }

    function formatDate(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function truncate(text, words) {
        const arr = text.split(/\s+/);
        return arr.length > words ? arr.slice(0, words).join(' ') + '...' : text;
    }

    // ── Category active state ─────────────────────────────────────────────────
    function setActiveCategory(clickedBtn) {
        catBtns.forEach(b => b.classList.remove('innotech-blog__cat-btn--active'));
        if (clickedBtn) clickedBtn.classList.add('innotech-blog__cat-btn--active');
    }

    function resetToAllCategory() {
        catBtns.forEach(b => {
            const isAll = b.dataset.category === 'all';
            b.classList.toggle('innotech-blog__cat-btn--active', isAll);
        });
    }

    // ── Dropdown ──────────────────────────────────────────────────────────────
    function getDropdown() {
        if (dropdownEl) return dropdownEl;
        dropdownEl = document.createElement('div');
        dropdownEl.className = 'innotech-blog__dropdown';
        dropdownEl.setAttribute('role', 'listbox');
        input.closest('.innotech-blog__search').appendChild(dropdownEl);
        return dropdownEl;
    }

    function renderDropdown(posts) {
        const dd = getDropdown();
        activeIndex = -1;

        if (!posts.length) {
            dd.innerHTML = '<div class="innotech-blog__dropdown-empty">No results found</div>';
            dd.classList.add('innotech-blog__dropdown--open');
            return;
        }

        dd.innerHTML = posts.map((p, i) => {
            const cat   = p._embedded?.['wp:term']?.[0]?.[0]?.name || '';
            const title = stripTags(p.title.rendered);
            return `<div class="innotech-blog__dropdown-item" data-index="${i}" role="option" tabindex="-1">
                <span class="innotech-blog__dropdown-title">${title}</span>
                ${cat ? `<span class="innotech-blog__dropdown-cat">${cat}</span>` : ''}
            </div>`;
        }).join('');

        dd.querySelectorAll('.innotech-blog__dropdown-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectResult(latestResults[parseInt(item.dataset.index, 10)]);
            });
        });

        dd.classList.add('innotech-blog__dropdown--open');
    }

    function closeDropdown() {
        if (!dropdownEl) return;
        dropdownEl.classList.remove('innotech-blog__dropdown--open');
        dropdownEl.innerHTML = '';
        activeIndex = -1;
    }

    function highlightItem(items, index) {
        items.forEach((el, i) => el.classList.toggle('innotech-blog__dropdown-item--active', i === index));
    }

    // ── Post HTML builder ─────────────────────────────────────────────────────
    function buildPostHTML(post, isFirst) {
        const cat      = post._embedded?.['wp:term']?.[0]?.[0]?.name || '';
        const catSlug  = post._embedded?.['wp:term']?.[0]?.[0]?.slug || '';
        const thumb    = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        const thumbAlt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text
                      || stripTags(post.title.rendered);
        const excerpt  = truncate(stripTags(post.excerpt.rendered), 25);
        const date     = formatDate(post.date);
        const title    = stripTags(post.title.rendered);
        const divider  = isFirst ? '' : '<hr class="innotech-blog__divider">';

        const imgCol = thumb
            ? `<div class="innotech-blog__post-img">
                   <img src="${thumb}" alt="${thumbAlt}" loading="lazy">
               </div>`
            : `<div class="innotech-blog__post-img">
                   <div class="innotech-blog__post-img-fallback"></div>
               </div>`;

        return `${divider}
        <article class="innotech-blog__post" data-category="${catSlug}">
            ${imgCol}
            <div class="innotech-blog__post-content">
                <div class="innotech-blog__post-meta">
                    <span class="innotech-blog__post-date">${date}</span>
                    ${cat ? `<span class="innotech-blog__post-sep">•</span>
                             <span class="innotech-blog__post-cat">${cat}</span>` : ''}
                </div>
                <h3 class="innotech-blog__post-title">
                    <a href="${post.link}">${title}</a>
                </h3>
                <p class="innotech-blog__post-excerpt">${excerpt}</p>
                <div class="innotech-blog__post-actions">
                    <a href="${post.link}" class="innotech-blog__post-btn">
                        Read More ${ARROW_SVG}
                    </a>
                </div>
            </div>
        </article>`;
    }

    function updatePosts(posts) {
        if (!posts.length) {
            postsDiv.innerHTML = '<p class="innotech-blog__no-results">No posts found.</p>';
            return;
        }
        postsDiv.innerHTML = posts.map((p, i) => buildPostHTML(p, i === 0)).join('');
    }

    // ── Select a search result ────────────────────────────────────────────────
    function selectResult(post) {
        input.value = stripTags(post.title.rendered);
        closeDropdown();
        resetToAllCategory();
        updatePosts([post]);
    }

    // ── Fetch: posts by search term ───────────────────────────────────────────
    async function fetchPostsBySearch(search) {
        const url = `${POSTS_URL}?search=${encodeURIComponent(search)}&_embed&per_page=${DROPDOWN_LIMIT}&orderby=date&order=desc`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return res.json();
    }

    // ── Fetch: resolve category slug → ID (cached) ───────────────────────────
    async function fetchCategoryId(slug) {
        if (catIdCache[slug] !== undefined) return catIdCache[slug];
        const res = await fetch(`${CATS_URL}?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`Category lookup failed: ${res.status}`);
        const data = await res.json();
        const id = data.length ? data[0].id : null;
        catIdCache[slug] = id;
        return id;
    }

    // ── Fetch: posts by category ID ───────────────────────────────────────────
    async function fetchPostsByCategory(categoryId) {
        const url = `${POSTS_URL}?categories=${categoryId}&_embed&per_page=${PER_PAGE}&orderby=date&order=desc`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Category fetch failed: ${res.status}`);
        return res.json();
    }

    // ── Category button clicks ────────────────────────────────────────────────
    catBtns.forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();

            const slug = this.dataset.category;
            setActiveCategory(this);

            // Clear search state
            input.value = '';
            closeDropdown();
            latestResults = [];

            if (slug === 'all') {
                postsDiv.innerHTML = originalHTML;
                return;
            }

            try {
                const catId = await fetchCategoryId(slug);
                if (!catId) {
                    postsDiv.innerHTML = '<p class="innotech-blog__no-results">No posts found.</p>';
                    return;
                }
                const posts = await fetchPostsByCategory(catId);
                updatePosts(posts);
            } catch (err) {
                console.error('[blog-category]', err);
            }
        });
    });

    // ── Input: debounced search ───────────────────────────────────────────────
    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const val = this.value.trim();

        // Reset category active state to "All" while searching
        resetToAllCategory();

        if (!val) {
            closeDropdown();
            postsDiv.innerHTML = originalHTML;
            return;
        }

        if (val.length < MIN_CHARS) {
            closeDropdown();
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                latestResults = await fetchPostsBySearch(val);
                renderDropdown(latestResults);
            } catch (err) {
                console.error('[blog-search]', err);
            }
        }, DEBOUNCE_MS);
    });

    // ── Keyboard navigation ───────────────────────────────────────────────────
    input.addEventListener('keydown', function (e) {
        const dd = dropdownEl;
        if (!dd || !dd.classList.contains('innotech-blog__dropdown--open')) return;

        const items = dd.querySelectorAll('.innotech-blog__dropdown-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            highlightItem(items, activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            highlightItem(items, activeIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && latestResults[activeIndex]) {
                selectResult(latestResults[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    // ── Search button: apply results to posts div ─────────────────────────────
    const searchBtn = container.querySelector('.innotech-blog__search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            if (latestResults.length) {
                updatePosts(latestResults);
                closeDropdown();
            }
        });
    }

    // ── Click outside: close dropdown ────────────────────────────────────────
    document.addEventListener('click', function (e) {
        if (!container.contains(e.target)) closeDropdown();
    });

})();
