const auth = {
    users: JSON.parse(localStorage.getItem('users')) || [],

    init: function() {
        document.getElementById('showRegister').addEventListener('click', this.showRegisterForm.bind(this));
        document.getElementById('showLogin').addEventListener('click', this.showLoginForm.bind(this));
        document.getElementById('registerBtn').addEventListener('click', this.register.bind(this));
        document.getElementById('loginBtn').addEventListener('click', this.login.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.logout.bind(this));
    },

    showRegisterForm: function() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    },

    showLoginForm: function() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    },

    register: function() {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!username || !password || !confirmPassword) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        if (this.users.some(user => user.username === username)) {
            alert("Username já existe!");
            return;
        }

        this.users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(this.users));
        alert("Cadastro realizado com sucesso!");
        this.showLoginForm();
    },

    login: function() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(user => user.username === username && user.password === password);

        if (user) {
            alert("Login realizado com sucesso!");
            localStorage.setItem('loggedInUser', username); // Armazena o usuário logado
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('container').style.display = 'block';
            seriesTracker.currentUser = username; // Atualiza o usuário no seriesTracker
            seriesTracker.showDashboard(); // Atualiza as listas
        } else {
            alert("Username ou senha incorretos!");
        }
    },

    logout: function() {
        localStorage.removeItem('loggedInUser');
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('container').style.display = 'none';
        alert("Logout realizado com sucesso!");
    }
};

auth.init();