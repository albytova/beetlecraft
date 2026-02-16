function load() {
    const chat_id = localStorage.getItem("currentUser");

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
                    $('#beerStyles').append($('<option>', {
                        text: styles[i]["name"],
                        value: styles[i]["name"],
                        id: "style_"+styles[i]["id"]
                    }));
                }

                loadUserProfil();
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
                $('#meetFrequency').append($('<option>', {
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
                $('#extraDrink').append($('<option>', {
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

function loadUserProfil() {
    const chat_id = localStorage.getItem("currentUser");

    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "loadUserProfil",
            chat_id: chat_id
        },
        contentType: 'application/json',
        success: function(response){

            const profilData = JSON.parse(response);
            if (profilData && profilData.length == 1)
                fillForm(profilData[0]);
        },
        error: function(error){
            console.log(error)
        }
    });
}

function fillForm(profilData) {

    $("#name").val(profilData["name"]);

    let styles = profilData["favorite_style"];
    let arr_styles = styles.split(", ");
    for (let i = 0; i < arr_styles.length; i++) {
        $("#beerStyles option[value='"+arr_styles[i]+"']").prop('selected', true);
    }

    $("#favoriteBeer").val(profilData["favorite_beer"]);

    let period = profilData["periodicity"];
    $("#meetFrequency option[value='"+period+"']").prop('selected', true);

    let drinks = profilData["favorte_drink"];
    let arr_drinks = drinks.split(", ");
    for (let i = 0; i < arr_drinks.length; i++) {
        $("#extraDrink option[value='"+arr_drinks[i]+"']").prop('selected', true);
    }

    $("#about").val(profilData["description"]);

    $("#img-photo").prop('src', "uploads/"+profilData["photo_link"]);
    window.linkPhoto = profilData["photo_link"];

    console.log(profilData);
}

function save() {

    const name = document.getElementById('name').value;
    const beer = document.getElementById('favoriteBeer').value;
    const description = document.getElementById('about').value;

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

    $.ajax({
        url: 'php/back.php',
        type: 'GET',
        data : {
            query: "editProfil",
            name: name,
            beer: beer,
            description: description,
            styles: check_styles.join(', '),
            drinks: check_drinks.join(', '),
            periods: check_periods.join(', '),
            photo: window.linkPhoto,
            chat_id: localStorage.getItem("currentUser")
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
function goToProfilesPage() {
    window.location.href = "profiles.html"; // Переход на страницу с анкетами
}

function changePhoto() {

    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    window.linkPhoto = photoFile["name"];
}