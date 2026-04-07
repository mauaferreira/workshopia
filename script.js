document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Active State on Scroll (Intersection Observer)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const body = document.body;
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarCollapse = document.querySelector('.sidebar-collapse');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
    const mobileMenuQuery = window.matchMedia('(max-width: 1100px)');
    const sidebarStorageKey = 'workshop-sidebar-collapsed';
    let isSidebarCollapsed = localStorage.getItem(sidebarStorageKey) === 'true';

    const ensureNavLabels = () => {
        navLinks.forEach(link => {
            if (!link.querySelector('.nav-label')) {
                const textNodes = [...link.childNodes].filter(node => (
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                ));

                if (textNodes.length) {
                    const label = document.createElement('span');
                    label.className = 'nav-label';
                    label.textContent = textNodes
                        .map(node => node.textContent.replace(/\s+/g, ' ').trim())
                        .join(' ');

                    textNodes.forEach(node => node.remove());
                    link.append(label);
                }
            }

            if (!link.getAttribute('title')) {
                const labelText = link.querySelector('.nav-label')?.textContent?.trim() || link.textContent.trim();

                if (labelText) {
                    link.setAttribute('title', labelText);
                }
            }
        });
    };

    const setSidebarCollapsed = (collapsed, persist = false) => {
        isSidebarCollapsed = collapsed;
        body.classList.toggle('sidebar-collapsed', collapsed && !mobileMenuQuery.matches);

        if (sidebarCollapse) {
            const isExpanded = !collapsed;
            const label = collapsed ? 'Expandir menu' : 'Recolher menu';
            const icon = sidebarCollapse.querySelector('.material-symbols-outlined');

            sidebarCollapse.setAttribute('aria-expanded', String(isExpanded));
            sidebarCollapse.setAttribute('aria-label', label);
            sidebarCollapse.setAttribute('title', label);

            if (icon) {
                icon.textContent = collapsed ? 'menu' : 'menu_open';
            }
        }

        if (persist) {
            localStorage.setItem(sidebarStorageKey, String(collapsed));
        }
    };

    const syncMenuState = (isOpen) => {
        body.classList.toggle('menu-open', isOpen);

        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        }

        if (sidebar) {
            const shouldHide = mobileMenuQuery.matches && !isOpen;
            sidebar.setAttribute('aria-hidden', String(shouldHide));
        }
    };

    const closeMenu = () => syncMenuState(false);
    const toggleMenu = () => syncMenuState(!body.classList.contains('menu-open'));
    const toggleSidebarCollapse = () => {
        if (mobileMenuQuery.matches) {
            closeMenu();
            return;
        }

        setSidebarCollapsed(!isSidebarCollapsed, true);
    };

    const handleViewportChange = (event) => {
        if (event.matches) {
            body.classList.remove('sidebar-collapsed');
            syncMenuState(false);
            setSidebarCollapsed(isSidebarCollapsed);
            return;
        }

        body.classList.remove('menu-open');

        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }

        if (sidebar) {
            sidebar.removeAttribute('aria-hidden');
        }

        setSidebarCollapsed(isSidebarCollapsed);
    };

    ensureNavLabels();
    setSidebarCollapsed(isSidebarCollapsed);
    handleViewportChange(mobileMenuQuery);

    if (typeof mobileMenuQuery.addEventListener === 'function') {
        mobileMenuQuery.addEventListener('change', handleViewportChange);
    } else {
        mobileMenuQuery.addListener(handleViewportChange);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', toggleSidebarCollapse);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeMenu);
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMenu();
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active class from all
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                // Add active class to current
                const currentLink = document.querySelector(`.nav-links li a[href="#${id}"]`);
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuQuery.matches) {
                closeMenu();
            }
        });
    });

    // 2. Copy Prompt Functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const promptBlock = e.currentTarget.closest('.prompt-block');
            const textToCopy = promptBlock.querySelector('.prompt-content').innerText;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-outlined">check</span> Copiado';
                btn.style.color = 'var(--success)';
                btn.style.background = 'rgba(16, 185, 129, 0.2)';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.color = '';
                    btn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });

    // 3. Tabs System Logic
    const tabContainers = document.querySelectorAll('.tabs-container');
    
    tabContainers.forEach(container => {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and contents in this container
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Show corresponding content
                const targetId = btn.getAttribute('data-tab');
                const targetContent = container.querySelector(targetId);
                if(targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });
});
