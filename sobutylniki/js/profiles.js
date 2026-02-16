// Данные анкет
var profiles = [];

// Рендерим плитки на основной странице
function renderProfiles(profiles) {
    const grid = document.getElementById('grid');
    grid.innerHTML = profiles.map(profile => `
                <div class="card" onclick="showDetail(${profile.id})">
                    <img src=uploads/${profile.photo_link} alt="${profile.name}">
                    <div class="card-content">
                        <h3>${profile.name}</h3>
                        <p>${profile.favorite_style}</p>
                        <button class="like-button" onclick="likeProfile(${profile.id}); event.stopPropagation();">❤️ Лайк</button>
                    </div>
                </div>
            `).join('');
}

// Показываем детальную страницу
function showDetail(id) {
    let profile;

    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i]["id"] == id) {
            profile = profiles[i];
            break;
        }
    }

    if (profile) {
        document.getElementById('detail-photo').src = "uploads/"+profile.photo_link;
        document.getElementById('detail-name').textContent = profile.name;
        document.getElementById('detail-beer-styles').textContent = profile.favorite_style;
        document.getElementById('detail-favorite-beer').textContent = profile.favorite_beer;
        document.getElementById('detail-meet-frequency').textContent = profile.periodicity;
        document.getElementById('detail-extra-drink').textContent = profile.favorte_drink;
        document.getElementById('detail-about').textContent = profile.description;

        document.getElementById('main-page').style.display = 'none';
        document.getElementById('detail-page').style.display = 'block';
    }
}

// Возвращаемся на основную страницу
function goBack() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('detail-page').style.display = 'none';
}

// Лайк профиля
function likeProfile(id) {
    alert(`Лайк отправлен профилю с ID: ${id}`);
}

// Инициализация
function loadProfiles() {

    localStorage.setItem("currentUser", "67849433");

    //TODO добавить фильтр по chat_id
    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "loadProfiles"
        },
        contentType: 'application/json',
        success: function(response){

            profiles = JSON.parse(response);

            console.log(profiles);
            renderProfiles(profiles);
        },
        error: function(error){
            console.log(error)
        }
    });
}

// Обработчики для верхнего меню
function showNewBuddies() {
    alert('Показать новых собутыльников');
}

function showBuddies() {
    alert('Показать список собутыльников');
}

function showProfile() {
    window.location.href = "profile.html";
}

loadProfiles();
