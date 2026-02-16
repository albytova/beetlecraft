let currentSlide = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slide').length;

function load() {

    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "loadStyles"
        },
        contentType: 'application/json',
        success: function(response){

            const styles = JSON.parse(response);
            window.Styles = styles;
            for (let i = 0; i < styles.length; i++) {
                $('#checkbox-styles').append($('<option>', {
                    text: styles[i]["name"],
                    value: styles[i]["name"],
                    id: "style_"+styles[i]["id"]
                }));
            }

        },
        error: function(error){
            console.log(error)
        }
    });

    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "loadPeriods"
        },
        contentType: 'application/json',
        success: function(response){

            const periods = JSON.parse(response);
            window.Periods = periods;
            for (let i = 0; i < periods.length; i++) {
                $('#checkbox-period').append($('<option>', {
                    text: periods[i]["name"],
                    value: periods[i]["name"],
                    id: "period_"+periods[i]["id"]
                }));
            }
        },
        error: function(error){
            console.log(error)
        }
    });

    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "loadDrinks"
        },
        contentType: 'application/json',
        success: function(response){

            const drinks = JSON.parse(response);
            window.Drinks = drinks;
            for (let i = 0; i < drinks.length; i++) {
                $('#checkbox-drinks').append($('<option>', {
                    text: drinks[i]["name"],
                    value: drinks[i]["name"],
                    id: "drink_"+drinks[i]["id"]
                }));
            }

        },
        error: function(error){
            console.log(error)
        }
    });
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        slides.style.transform = `translateX(-${currentSlide * 100}%)`; /* Используем проценты для адаптивности */
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        slides.style.transform = `translateX(-${currentSlide * 100}%)`; /* Используем проценты для адаптивности */
    }
}

function submitForm() {
    const name = document.getElementById('name').value;
    const beer = document.getElementById('beer').value;
    const description = document.getElementById('description').value;

    const check_styles = [];
    window.Styles.forEach(function(style, i, arr) {
        if (document.getElementById("style_"+style["id"]).selected) check_styles.push(style["name"]);
    });

    const check_drinks = [];
    window.Drinks.forEach(function(drink, i, arr) {
        if (document.getElementById("drink_"+drink["id"]).selected) check_drinks.push(drink["name"]);
    });

    const check_periods = [];
    window.Periods.forEach(function(period, i, arr) {
        if (document.getElementById("period_"+period["id"]).selected) check_periods.push(period["name"]);
    });

    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    //formData.append('check_id', check_periods.join(', ')); TODO
    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "registerUser",
            name: name,
            beer: beer,
            description: description,
            styles: check_styles.join(', '),
            drinks: check_drinks.join(', '),
            periods: check_periods.join(', '),
            photo: photoFile? photoFile["name"]: ""
        },
        contentType: 'application/json',
        success: function(response){
            if (response.trim() == "success")
                goToProfilesPage();
        },
        error: function(error){
            console.log(error)
        }
    });
}

// Переход на страницу с анкетами
function goToProfilesPage() { console.log("goToProfilesPage");
    window.location.href = "profiles.html"; // Переход на страницу с анкетами
}

function uploadPhoto() {
    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    if (!photoFile) {
        return;
    }

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('photo', photoFile);

    // Отправляем файл на сервер
    fetch('php/upload.php', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}