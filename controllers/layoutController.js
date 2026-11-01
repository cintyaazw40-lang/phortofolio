// Fungsi untuk memuat komponen eksternal (Navbar/Footer)
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Logika untuk menandai menu navbar yang aktif
        const currentPage = window.location.pathname.split("/").pop();
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            if(link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error loading component:', error);
    }
}