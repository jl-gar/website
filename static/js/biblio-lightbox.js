// Simple Lightbox for Bibliography Images
(function () {
    'use strict';

    // Create lightbox HTML structure
    const lightboxHTML = `
    <div class="biblio-lightbox" id="biblio-lightbox">
      <button class="biblio-lightbox-close" aria-label="Close">&times;</button>
      <div class="biblio-lightbox-content">
        <img src="" alt="Bibliography Image" id="biblio-lightbox-img">
      </div>
    </div>
  `;

    // Add lightbox to page when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLightbox);
    } else {
        initLightbox();
    }

    function initLightbox() {
        // Add lightbox HTML to body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = lightboxHTML;
        document.body.appendChild(tempDiv.firstElementChild);

        const lightbox = document.getElementById('biblio-lightbox');
        const lightboxImg = document.getElementById('biblio-lightbox-img');
        const closeBtn = lightbox.querySelector('.biblio-lightbox-close');

        // Add click handlers to all biblio links
        document.querySelectorAll('.biblio-lightbox-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const imageSrc = this.getAttribute('data-biblio-image');
                if (imageSrc) {
                    lightboxImg.src = imageSrc;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Close lightbox on close button click
        closeBtn.addEventListener('click', closeLightbox);

        // Close lightbox on background click
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close lightbox on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
        }
    }
})();
