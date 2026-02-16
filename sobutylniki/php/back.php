<?php

$host = "127.0.0.1:3307";
$dbname = "beetlecraft";
$username = "craft";
$password = "beetlecraft2018";
$db = null;

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Ошибка подключения к базе данных: " . $e->getMessage(),
    ]);
    exit();
}

switch ($_GET["query"]) {
    case "registerUser":
        registerUser(
            $pdo,
            $_GET["name"],
            $_GET["beer"],
            $_GET["description"],
            $_GET["styles"],
            $_GET["drinks"],
            $_GET["periods"],
            $_GET["photo"]
        );
        break;

    case "editProfil":
        editProfil(
            $pdo,
            $_GET["name"],
            $_GET["beer"],
            $_GET["description"],
            $_GET["styles"],
            $_GET["drinks"],
            $_GET["periods"],
            $_GET["photo"],
            $_GET["chat_id"]
        );
        break;

    case "loadProfiles":
        loadProfiles($pdo);
        break;

    case "loadUserProfil":
        loadUserProfil($pdo, $_GET["chat_id"]);
        break;

    case "loadStyles":
        loadStyles($pdo);
        break;

    case "loadPeriods":
        loadPeriods($pdo);
        break;

    case "loadDrinks":
        loadDrinks($pdo);
        break;
}

/* Регистрация пользователя */
function registerUser(
    $pdo,
    $name,
    $beer,
    $description,
    $styles,
    $drinks,
    $periods,
    $photo
) {
    $sql =
        "insert into sobutylniki.users (name, favorite_beer, description, favorite_style, favorte_drink, periodicity, photo_link) values (:name, :beer, :description, :styles, :drinks, :periods, :photo)";

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(":name", $name);
        $stmt->bindValue(":beer", $beer);
        $stmt->bindValue(":description", $description);
        $stmt->bindValue(":styles", $styles);
        $stmt->bindValue(":drinks", $drinks);
        $stmt->bindValue(":periods", $periods);
        $stmt->bindValue(":photo", $photo);
        $stmt->bindValue(":chat_id", $chat_id);
        $stmt->execute();

    print_r("success");
}

/* Изменение данных пользователя */
function editProfil(
    $pdo,
    $name,
    $beer,
    $description,
    $styles,
    $drinks,
    $periods,
    $photo,
    $chat_id
) {
    $sql = "update sobutylniki.users set name=:name, favorite_beer=:beer, description=:description, favorite_style=:styles, favorte_drink=:drinks, periodicity=:periods, photo_link=:photo  where chat_id = :chat_id";

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(":name", $name);
        $stmt->bindValue(":beer", $beer);
        $stmt->bindValue(":description", $description);
        $stmt->bindValue(":styles", $styles);
        $stmt->bindValue(":drinks", $drinks);
        $stmt->bindValue(":periods", $periods);
        $stmt->bindValue(":photo", $photo);
        $stmt->bindValue(":chat_id", $chat_id);
        $stmt->execute();

    print_r("success");
}

/* Загрузка списка профилей */
function loadProfiles($pdo)
{
    $sql = "SELECT * FROM sobutylniki.users";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $result;
    }

    print_r(json_encode($rows));
}

/* Загрузка списка стилей */
function loadStyles($pdo)
{
    $sql = "SELECT * FROM sobutylniki.styles";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $result;
    }

    print_r(json_encode($rows));
}

/* Загрузка списка периодов */
function loadPeriods($pdo)
{
    $sql = "SELECT * FROM sobutylniki.period";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $result;
    }

    print_r(json_encode($rows));
}

/* Загрузка списка напитков */
function loadDrinks($pdo)
{
    $sql = "SELECT * FROM sobutylniki.drinks";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $result;
    }

    print_r(json_encode($rows));
}

/* Загрузка данных профиля пользователя */
function loadUserProfil($pdo, $chat_id)
{
        $sql = "SELECT * FROM sobutylniki.users where chat_id=:chat_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(":chat_id", $chat_id);
        $stmt->execute();

        while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows[] = $result;
        }

        print_r(json_encode($rows));
}
?>


