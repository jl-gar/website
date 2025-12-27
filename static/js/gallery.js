document.addEventListener('DOMContentLoaded', function () {
    function getImagesForUid(uid) {
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
        this.show(0);
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
        this.imgEl.src = img.url || img.file || '';
        this.imgEl.alt = img.title || img.original_name || '';
        if (this.titleEl) this.titleEl.textContent = img.title || '';
        if (this.dateEl) this.dateEl.textContent = img.date ? String(img.date) : '';
        if (this.dimEl) this.dimEl.textContent = img.dimensions || '';
        if (this.notesEl) this.notesEl.textContent = img.notes || '';
    };

    // build PhotoSwipe items from images array
    Gallery.prototype.buildItems = function () {
        var self = this;
        return this.images.map(function (it) {
            // Try to use dimensions if present in metadata (dimensions_pixels expected as {w,h} or string)
            var w = it.width || it.w || 0;
            var h = it.height || it.h || 0;
            // fallback if dimensions not set, PhotoSwipe can accept undefined and we'll preload before opening
            return {
                src: it.url || it.file || '',
                w: w,
                h: h,
                title: it.title || ''
            };
        });
    };

    // open PhotoSwipe at current index; if items miss sizes, preload to get natural dimensions
    Gallery.prototype.openPhotoSwipe = function (startIndex) {
        var self = this;
        var items = this.buildItems();
        var needPreload = items.some(function (it) { return !it.w || !it.h; });

        var open = function () {
            try {
                var pswpElem = document.querySelectorAll('.pswp')[0];
                var options = { index: startIndex || self.index, bgOpacity: 0.85, showHideOpacity: true };
                if (typeof PhotoSwipe !== 'function' && typeof PhotoSwipe !== 'object') {
                    console.error('[JL-Gallery] PhotoSwipe is not available on window');
                    return;
                }
                if (typeof PhotoSwipeUI_Default === 'undefined') {
                    console.warn('[JL-Gallery] PhotoSwipe UI default not found; trying to continue');
                }
                console.debug('[JL-Gallery] opening PhotoSwipe', { index: options.index, itemsCount: items.length });
                var gallery = new PhotoSwipe(pswpElem, PhotoSwipeUI_Default, items, options);
                gallery.init();
            } catch (err) {
                console.error('[JL-Gallery] failed to open PhotoSwipe', err);
            }
        };

        if (!needPreload) {
            open();
            return;
        }

        // preload missing sizes sequentially
        var toLoad = [];
        items.forEach(function (it, idx) {
            if (!it.w || !it.h) toLoad.push({ it: it, idx: idx });
        });

        var loaded = 0;
        if (!toLoad.length) return open();
        toLoad.forEach(function (entry) {
            var img = new Image();
            img.onload = function () {
                entry.it.w = img.naturalWidth || img.width;
                entry.it.h = img.naturalHeight || img.height;
                loaded++;
                if (loaded === toLoad.length) open();
            };
            img.onerror = function () {
                // leave sizes 0 - PhotoSwipe will handle it
                loaded++;
                if (loaded === toLoad.length) open();
            };
            img.src = entry.it.src;
        });
    };

    // attach click and controls
    Gallery.prototype.attachHandlers = function () {
        var self = this;
        if (this.imgEl) {
            this.imgEl.style.cursor = 'zoom-in';
            this.imgEl.addEventListener('click', function () { self.openPhotoSwipe(self.index); });
        }
    };

    Gallery.prototype.prevIdx = function () { this.show(this.index - 1); };
    Gallery.prototype.nextIdx = function () { this.show(this.index + 1); };

    document.querySelectorAll('.jl-gallery').forEach(function (el) { var g = new Gallery(el); g.attachHandlers(); });
});
