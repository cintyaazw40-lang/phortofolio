function renderProjects() {
    const projectContainer = document.getElementById('project-list');
    if (!projectContainer) return; // Hentikan jika bukan di halaman project

    let htmlContent = '';

    // Looping data dari projectData.js (Model)
    projectsData.forEach(project => {
        htmlContent += `
            <div class="glass-card">
                <img src="${project.image}" alt="${project.title}">
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">${project.title}</h3>
                <p style="font-size: 0.9rem; opacity: 0.9;">${project.description}</p>
            </div>
        `;
    });

    projectContainer.innerHTML = htmlContent;
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', renderProjects);