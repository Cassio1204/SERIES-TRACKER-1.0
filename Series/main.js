const seriesTracker = {
    apiKey: '6fc634c5bb235086ac90667be3fa5e22', // Substitua pela sua chave de API do TMDB
    currentUser: null, // Armazena o usuário logado
    usersData: JSON.parse(localStorage.getItem('usersData')) || {}, // Dados dos usuários

    init: function() {
        // Verifica se há um usuário logado
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            this.currentUser = loggedInUser;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('container').style.display = 'block';
        }

        // Inicializa as funcionalidades
        this.showDashboard();
        document.getElementById('addSeriesBtn').addEventListener('click', this.addSeries.bind(this));
        document.getElementById('changeStatusBtn').addEventListener('click', this.changeStatus.bind(this));
        document.getElementById('categoryFilter').addEventListener('change', this.updateLists.bind(this));  // Altere para chamar a função de filtro
        document.getElementById('searchSeriesBtn').addEventListener('click', this.searchSeries.bind(this));
        document.getElementById('searchSeriesInput').addEventListener('input', this.autocompleteSearch.bind(this));
    },

    showDashboard: function() {
        this.updateLists();
    },

    addSeries: function() {
        if (!this.currentUser) {
            alert("Você precisa estar logado para adicionar uma série!");
            return;
        }

        const name = prompt("Nome da Série:");
        if (!name) {
            alert("Nome da série é obrigatório!");
            return;
        }

        const seasons = parseInt(prompt("Quantas temporadas?"));
        if (!seasons || seasons <= 0) {
            alert("Número de temporadas inválido!");
            return;
        }

        const episodesPerSeason = [];
        for (let i = 1; i <= seasons; i++) {
            const episodes = parseInt(prompt(`Quantos episódios na temporada ${i}?`));
            if (!episodes || episodes <= 0) {
                alert("Número de episódios inválido!");
                return;
            }
            episodesPerSeason.push(episodes);
        }

        const category = prompt("Informe a categoria da série (ex: Drama, Comédia, Ação):");
        if (!category) {
            alert("Categoria é obrigatória!");
            return;
        }

        const series = { 
            id: Date.now(), 
            name, 
            seasons, 
            episodesPerSeason, 
            status: "Para Assistir", 
            category, 
            progress: { season: 1, episode: 1 } 
        };

        // Adiciona a série ao usuário atual
        if (!this.usersData[this.currentUser]) {
            this.usersData[this.currentUser] = { seriesList: [] };
        }
        this.usersData[this.currentUser].seriesList.push(series);
        localStorage.setItem('usersData', JSON.stringify(this.usersData));
        this.updateLists();
        alert("Série adicionada com sucesso!");
    },

    updateLists: function() {
        const listsDiv = document.getElementById("lists");
        listsDiv.innerHTML = "";
        const filterValue = document.getElementById('categoryFilter').value; // Obtém o valor do filtro de categoria

        const categories = ["Para Assistir", "Assistindo", "Assistidas"];
        categories.forEach(category => {
            if (filterValue !== "all" && filterValue !== category) return;  // Aplica o filtro de categoria

            const seriesInCategory = this.usersData[this.currentUser]?.seriesList.filter(s => s.status === category) || [];
            let listHTML = `<div class="category" id="category-${category}"> 
                            <h3>${category}</h3>`;
            seriesInCategory.forEach((series, index) => {
                if (filterValue !== "all" && series.category !== filterValue) return;  // Aplica o filtro de categoria na listagem

                listHTML += `
                    <div class="series">
                        <strong>${series.name} (${series.category})</strong>
                        <div class="series-actions">
                            ${category === "Assistindo" ? ` 
                                <br> Temporada: <input type="number" min="1" max="${series.seasons}" value="${series.progress.season}" onchange="seriesTracker.updateProgress(${series.id}, 'season', this.value)">
                                Episódio: <input type="number" min="1" max="${series.episodesPerSeason[series.progress.season - 1]}" value="${series.progress.episode}" onchange="seriesTracker.updateProgress(${series.id}, 'episode', this.value)">
                            ` : ""}
                            <button class="edit" onclick="seriesTracker.editSeries(${series.id})">Editar Série</button>
                            <button class="remove" onclick="seriesTracker.removeSeries(${series.id})">Remover Série</button>
                        </div>
                    </div>
                `;
            });
            listHTML += `</div>`;
            listsDiv.innerHTML += listHTML;
        });
    },

    changeStatus: function() {
        const seriesNames = this.usersData[this.currentUser]?.seriesList.map(s => s.name) || [];
        if (seriesNames.length === 0) {
            alert("Nenhuma série cadastrada!");
            return;
        }

        const selectedSeries = prompt(`Escolha a série:\n${seriesNames.join("\n")}`);
        if (!selectedSeries || !seriesNames.includes(selectedSeries)) {
            alert("Série inválida!");
            return;
        }

        const newStatus = prompt("Escolha o novo status:\n1. Para Assistir\n2. Assistindo\n3. Assistidas");
        if (!["1", "2", "3"].includes(newStatus)) {
            alert("Status inválido!");
            return;
        }

        const statusMap = { "1": "Para Assistir", "2": "Assistindo", "3": "Assistidas" };
        const series = this.usersData[this.currentUser].seriesList.find(s => s.name === selectedSeries);
        series.status = statusMap[newStatus];

        localStorage.setItem('usersData', JSON.stringify(this.usersData));
        this.updateLists();
        alert("Status alterado com sucesso!");
    },

    editSeries: function(id) {
        const series = this.usersData[this.currentUser].seriesList.find(s => s.id === id);
        if (!series) return;

        const name = prompt("Nome da Série:", series.name);
        if (!name) return;

        const seasons = parseInt(prompt("Quantas temporadas?", series.seasons));
        if (!seasons) return;

        const episodesPerSeason = [];
        for (let i = 1; i <= seasons; i++) {
            const episodes = parseInt(prompt(`Quantos episódios na temporada ${i}?`, series.episodesPerSeason[i - 1]));
            episodesPerSeason.push(episodes || 0);
        }

        const category = prompt("Categoria da Série:", series.category);
        if (!category) return;

        this.usersData[this.currentUser].seriesList = this.usersData[this.currentUser].seriesList.map(s => s.id === id ? { 
            ...s, 
            name, 
            seasons, 
            episodesPerSeason,
            category
        } : s);
        
        localStorage.setItem('usersData', JSON.stringify(this.usersData));
        this.updateLists();
    },

    updateProgress: function(id, type, value) {
        const series = this.usersData[this.currentUser].seriesList.find(s => s.id === id);
        if (series) {
            series.progress[type] = parseInt(value);
            localStorage.setItem('usersData', JSON.stringify(this.usersData));
        }
    },

    saveProgress: function(id) {
        alert('Progresso salvo!');
        localStorage.setItem('usersData', JSON.stringify(this.usersData));
    },

    removeSeries: function(id) {
        if (confirm("Tem certeza que deseja remover essa série?")) {
            this.usersData[this.currentUser].seriesList = this.usersData[this.currentUser].seriesList.filter(s => s.id !== id);
            localStorage.setItem('usersData', JSON.stringify(this.usersData));
            this.updateLists();
        }
    },

    searchSeries: async function() {
        const query = document.getElementById('searchSeriesInput').value;
        if (!query) {
            alert("Por favor, insira um termo de pesquisa.");
            return;
        }

        const url = `https://api.themoviedb.org/3/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const recommendationsDiv = document.getElementById('recommendations');
            if (data.results && data.results.length > 0) {
                recommendationsDiv.innerHTML = "<h3>Sugestões:</h3><ul>" +
                    data.results.map(series => `<li>${series.name}</li>`).join('') +
                    "</ul>";
            } else {
                recommendationsDiv.innerHTML = "<h3>Séries recomendadas:</h3><p>Nenhuma série encontrada.</p>";
            }
        } catch (error) {
            console.error("Erro ao buscar recomendações:", error);
            alert("Erro ao buscar recomendações. Tente novamente.");
        }
    },

    autocompleteSearch: async function() {
        const query = document.getElementById('searchSeriesInput').value;
        if (query.length > 2) {
            const response = await this.fetchRecommendations(query);
            if (response) {
                const recommendationsDiv = document.getElementById('recommendations');
                recommendationsDiv.innerHTML = "<h3>Sugestões:</h3><ul>" + 
                    response.map(series => `<li>${series}</li>`).join('') + 
                    "</ul>";
            }
        }
    },

    fetchRecommendations: async function(query) {
        const url = `https://api.themoviedb.org/3/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                const recommendations = data.results.map(series => series.name);
                return recommendations;
            } else {
                return ["Nenhuma série encontrada."];
            }
        } catch (error) {
            console.error("Erro ao buscar recomendações:", error);
            alert("Erro ao buscar recomendações. Tente novamente.");
            return null;
        }
    }
};

seriesTracker.init();
