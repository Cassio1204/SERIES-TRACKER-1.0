const apiKey = '6fc634c5bb235086ac90667be3fa5e22'; // Substitua pela sua chave de API do TMDB

document.getElementById('searchSeriesBtn').addEventListener('click', searchSeries);

async function searchSeries() {
    const query = document.getElementById('searchSeriesInput').value;
    if (!query) {
        alert("Por favor, insira um termo de pesquisa.");
        return;
    }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const recommendationsDiv = document.getElementById('recommendations');
        if (data.results && data.results.length > 0) {
            recommendationsDiv.innerHTML = "<h3>Séries e Filmes recomendados:</h3><ul>" +
                data.results.map(item => {
                    const title = item.name || item.title;
                    const year = item.release_date ? item.release_date.split('-')[0] : 'N/A';
                    const type = item.media_type === 'tv' ? 'Série' : 'Filme';
                    return `<li>${title} (${year}) - ${type}</li>`;
                }).join('') +
                "</ul>";
        } else {
            recommendationsDiv.innerHTML = "<h3>Séries e Filmes recomendados:</h3><p>Nenhuma série ou filme encontrado.</p>";
        }
    } catch (error) {
        console.error("Erro ao buscar recomendações:", error);
        alert("Erro ao buscar recomendações. Tente novamente.");
    }
}