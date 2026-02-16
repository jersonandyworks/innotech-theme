/**
 * Blob Icon Mouse Follow Animation
 * Follows mouse vertically with elastic bounce effect using GSAP
 * Activates dot labels when blob enters nested items
 */
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.innotech-nested-container');

    if (container && typeof blobAnimationData !== 'undefined') {
        // Create and append blob icon
        const blobIcon = document.createElement('img');
        blobIcon.src = blobAnimationData.themeUrl + '/_assets/blob.svg';
        blobIcon.alt = '';
        blobIcon.className = 'blob-icon';
        container.appendChild(blobIcon);

        // Get the parent section that contains both dots and nested items
        const parentSection = container.closest('.et_pb_section');

        // Initialize GSAP
        gsap.set(blobIcon, { yPercent: -50 });

        const padding = 40;
        const followDelay = 0.15; // Delay for blob and dot follow
        let isAtEdge = false;
        let currentActiveIndex = -1;
        let dotUpdateTimeout = null;

        // Function to reset all dots to original size
        function resetAllDots() {
            const dots = parentSection ? parentSection.querySelectorAll('.innotech-dot-label-module .dot') : [];
            dots.forEach((dot) => {
                gsap.to(dot, {
                    width: 8,
                    height: 8,
                    duration: 0.8,
                    ease: "elastic.out(0.6, 0.4)"
                });
                dot.classList.remove('active');
            });
            currentActiveIndex = -1;
        }

        // Function to check which nested item the mouse is in and activate its dot
        function updateActiveDot(mouseY) {
            const nestedItems = container.querySelectorAll('.innotech-nested-item');
            const dots = parentSection ? parentSection.querySelectorAll('.innotech-dot-label-module .dot') : [];
            const containerRect = container.getBoundingClientRect();

            // Only activate dots if mouse Y is within the container bounds
            if (mouseY < containerRect.top || mouseY > containerRect.bottom) {
                if (currentActiveIndex >= 0) {
                    resetAllDots();
                }
                return;
            }

            let newActiveIndex = -1;

            nestedItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();

                // Check if mouse Y is within this item's vertical bounds
                if (mouseY >= itemRect.top && mouseY <= itemRect.bottom) {
                    newActiveIndex = index;
                }
            });

            // If active index changed, update the dots
            if (newActiveIndex !== currentActiveIndex) {
                // Deactivate previous dot
                if (currentActiveIndex >= 0 && dots[currentActiveIndex]) {
                    gsap.to(dots[currentActiveIndex], {
                        width: 8,
                        height: 8,
                        duration: 0.8,
                        ease: "elastic.out(0.6, 0.4)"
                    });
                    dots[currentActiveIndex].classList.remove('active');
                }

                // Activate new dot
                if (newActiveIndex >= 0 && dots[newActiveIndex]) {
                    gsap.to(dots[newActiveIndex], {
                        width: 16,
                        height: 16,
                        duration: 1,
                        ease: "elastic.out(0.8, 0.35)"
                    });
                    dots[newActiveIndex].classList.add('active');
                }

                currentActiveIndex = newActiveIndex;
            }
        }

        // Reset dots when mouse leaves the section
        if (parentSection) {
            parentSection.addEventListener('mouseleave', resetAllDots);
        }

        document.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const iconHeight = blobIcon.offsetHeight;

            const minY = rect.top + iconHeight / 2 + padding;
            const maxY = rect.bottom - iconHeight / 2 - padding;

            const rawY = e.clientY;
            const hitTop = rawY < minY;
            const hitBottom = rawY > maxY;

            const clampedY = Math.max(minY, Math.min(maxY, rawY));
            const relativeY = clampedY - rect.top;

            // Update dot with matching delay
            if (dotUpdateTimeout) {
                clearTimeout(dotUpdateTimeout);
            }
            dotUpdateTimeout = setTimeout(() => {
                updateActiveDot(e.clientY);
            }, followDelay * 1000);

            if ((hitTop || hitBottom) && !isAtEdge) {
                isAtEdge = true;
                gsap.to(blobIcon, {
                    top: relativeY,
                    duration: 1.2,
                    delay: followDelay,
                    ease: "elastic.out(1, 0.3)"
                });
            } else if (!hitTop && !hitBottom) {
                isAtEdge = false;
                gsap.to(blobIcon, {
                    top: relativeY,
                    duration: 0.8,
                    delay: followDelay,
                    ease: "elastic.out(0.8, 0.5)"
                });
            }
        });
    }
});
