document.addEventListener('DOMContentLoaded', function () {
    function getImagesForUid(uid) {
        // try an inline JSON blob first
        try {
            var scriptId = 'jl-gallery-data-' + uid;
            var el = document.getElementById(scriptId);
            if (el) {
                var parsed = JSON.parse(el.textContent || el.innerText || '[]');
                if (parsed && parsed.length) return parsed;
            }
        } catch (e) { /* ignore parse errors */ }

        var imgs = (window.JL_GALLERY_IMAGES && window.JL_GALLERY_IMAGES[uid]) || [];
        if (imgs && imgs.length) return imgs;
        try {
            if (window.JL_GALLERY_IMAGES) {
                var byPath = window.JL_GALLERY_IMAGES[document.location.pathname.replace(/\/$/, '')];
                if (byPath && byPath.length) return byPath;
                for (var k in window.JL_GALLERY_IMAGES) {
                    if (window.JL_GALLERY_IMAGES[k] && window.JL_GALLERY_IMAGES[k].length) return window.JL_GALLERY_IMAGES[k];
                }
            }
        } catch (e) { /* ignore */ }
        return [];
    }

    function Gallery(root) {
        this.root = root;
        this.uid = root.dataset.galleryUid;
        this.images = getImagesForUid(this.uid);
        this.index = 0;
        this.imgEl = root.querySelector('.jl-gallery-img');
        this.titleEl = root.querySelector('.jl-gallery-title');
        this.dateEl = root.querySelector('.jl-gallery-date');
        this.dimEl = root.querySelector('.jl-gallery-dimensions');
        this.notesEl = root.querySelector('.jl-gallery-notes');
        this.prev = root.querySelector('.jl-prev');
        this.next = root.querySelector('.jl-next');
        if (this.prev) this.prev.addEventListener('click', this.prevIdx.bind(this));
        if (this.next) this.next.addEventListener('click', this.nextIdx.bind(this));
        // only show initial image if the main image element exists
        if (this.imgEl) this.show(0);
        try {
            console.log('[JL-Gallery] init', { uid: this.uid, images: this.images && this.images.length });
            this.root.setAttribute('data-jl-gallery-init', '1');
        } catch (e) { /* ignore */ }
    }

    Gallery.prototype.show = function (i) {
        if (!this.images || !this.images.length) return;
        this.index = (i + this.images.length) % this.images.length;
        var img = this.images[this.index];
        if (!img) return;
        if (this.imgEl) {
            this.imgEl.src = img.url || img.file || '';
            this.imgEl.alt = img.title || img.original_name || '';
        }
        if (this.titleEl) this.titleEl.textContent = img.title || '';
        if (this.dateEl) this.dateEl.textContent = img.date ? String(img.date) : '';
        if (this.dimEl) this.dimEl.textContent = img.dimensions || '';
        if (this.notesEl) this.notesEl.textContent = img.notes || '';
    };

    // For PhotoSwipe v5 we rely on data-pswp-* attributes on anchors and the PhotoSwipeLightbox
    // buildItems is kept for potential programmatic usage
    Gallery.prototype.buildItems = function () {
        var self = this;
        return this.images.map(function (it) {
            var src = it.display || it.url || it.file || '';
            var w = it.w || it.width || 0;
            var h = it.h || it.height || 0;
            return {
                src: src,
                w: w,
                h: h,
                title: it.title || '',
                dimensions: it.dimensions || it.dimensions_physical || '',
                date: it.date || ''
            };
        });
    };

    // open PhotoSwipe v5 programmatically if the module is available; otherwise rely on the Lightbox bound to anchors
    Gallery.prototype.openPhotoSwipe = function (startIndex) {
        var items = this.buildItems();
        // Try programmatic open via global PhotoSwipe (v5 exposes PhotoSwipe as window.PhotoSwipe when using non-ESM builds)
        try {
            if (window.PhotoSwipe && typeof window.PhotoSwipe === 'function') {
                // construct items in PhotoSwipe v5 format
                var psItems = items.map(function (it) {
                    return {
                        src: it.src,
                        width: it.w || 0,
                        height: it.h || 0,
                        title: it.title || ''
                    };
                });
                // if PhotoSwipeLightbox is present and can open, prefer it
                if (window.PhotoSwipeLightbox && typeof window.PhotoSwipeLightbox === 'function') {
                    // cannot reliably open programmatically from lightbox instance from here; fall through to anchor click
                }
            }
        } catch (e) {
            // ignore and let anchor-based lightbox handle it
        }
        // Fallback: trigger click on the corresponding anchor to let PhotoSwipeLightbox handle opening
        try {
            var el = this.root.querySelector("a.jl-tile-link[data-index='" + (startIndex || this.index) + "']");
            if (el) el.click();
        } catch (e) { /* ignore */ }
    };

    // attach click and controls
    Gallery.prototype.attachHandlers = function () {
        var self = this;
        if (this.imgEl) {
            this.imgEl.style.cursor = 'zoom-in';
            this.imgEl.addEventListener('click', function () { self.openPhotoSwipe(self.index); });
        }
        // Attach to tiles if present
        try {
            var links = this.root.querySelectorAll('.jl-tile-link');
            links.forEach(function (a) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    var idx = parseInt(a.getAttribute('data-index'), 10) || 0;
                    self.openPhotoSwipe(idx);
                });
            });
        } catch (e) { /* ignore */ }
    };

    Gallery.prototype.prevIdx = function () { this.show(this.index - 1); };
    Gallery.prototype.nextIdx = function () { this.show(this.index + 1); };

    document.querySelectorAll('.jl-gallery').forEach(function (el) {
        try {
            // ensure element has gallery-uid attribute
            if (!el.dataset || !el.dataset.galleryUid) return;
            var g = new Gallery(el);
            if (g && typeof g.attachHandlers === 'function') g.attachHandlers();
        } catch (err) {
            console.error('[JL-Gallery] init failed for element', el, err);
        }
    });
});
