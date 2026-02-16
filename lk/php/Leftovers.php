<?php

include "service.php";
require_once __DIR__ . "/simple-xlsx/simplexlsx.class.php";
require_once __DIR__ . "/simple-xlsx/SimpleXLSXGen.php";
use Shuchkin\SimpleXLSXGen;

$GLOBAL_ID_SHOP = _get_profil_data($db);

// Инициализируем временное хранилище
$tempStorage = new TempFileStorage();

switch ($_GET["query"]) {
    case "getMenuBottle":
        getMenuBottle($db, $GLOBAL_ID_SHOP);
        break;

    case "getReadFile1C":
        getReadFile1C();
        break;

    case "loadFile":
        loadFile($_FILES["leftovers_file"], $tempStorage);
        break;

    case "testMatching":
        testMatching($tempStorage);
        break;

    case "createAkt":
        createAkt($db, $GLOBAL_ID_SHOP, $tempStorage);
        break;

    case "hasLeftoversData":
        hasLeftoversData($tempStorage);
        break;

    case "clearLeftoversData":
        clearLeftoversData($tempStorage);
        break;

    case "getLeftoversInfo":
        getLeftoversInfo($tempStorage);
        break;

    case "debugMatching":
        debugMatching($tempStorage, $db);
        break;

    case "deleteFile":
        deleteFile($_GET["filename"]);
        break;

    case "saveCountBottleBase":
        saveCountBottleBase($db, $_GET["count_base"], $_GET["id_purchase"]);
        break;
}

function deleteFile($filename)
{
    unlink($filename);
    echo "файл удален";
}

        /* Изменение ккличества бутылок в базе */
        function saveCountBottleBase ($db, $count_base, $id_purchase) {

             $query = "update menu_bottle set count=$count_base where id_purchase=$id_purchase";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

/* Функция для отладки сопоставления */
function debugMatching($tempStorage, $db)
{
    $fileData = $tempStorage->load();
    $leftoversData = $fileData["data"];

    // Парсим данные из 1С
    $leftoversMap = [];
    $startProcessing = false;

    foreach ($leftoversData as $row) {
        if (empty($row) || count($row) < 2) {
            continue;
        }

        $firstCell = trim($row[0] ?? "");

        if (!$startProcessing) {
            if (strpos($firstCell, "Номенклатура") !== false) {
                $startProcessing = true;
            }
            continue;
        }

        if (count($row) >= 3) {
            $nomenclature = trim($row[0] ?? "");
            $quantity = isset($row[2])
                ? (float) str_replace([" ", ","], ["", "."], $row[2])
                : 0;

            $productName = trim(preg_replace('/,.*$/', "", $nomenclature));

            if (!empty($productName)) {
                $leftoversMap[mb_strtolower($productName)] = [
                    "original" => $nomenclature,
                    "cleaned" => $productName,
                    "quantity" => $quantity,
                ];
            }
        }
    }

    // Получаем beer_name из базы
    $query =
        "SELECT DISTINCT beer_name FROM get_basebeer WHERE beer_name IS NOT NULL";
    $result = $db->query($query);

    $beerNames = [];
    while ($row = $result->fetch_assoc()) {
        $beerNames[mb_strtolower($row["beer_name"])] = $row["beer_name"];
    }

    // Ищем совпадения
    $matches = [];
    $nonMatches1C = [];
    $nonMatchesDB = [];

    foreach ($leftoversMap as $lowerName => $item) {
        if (isset($beerNames[$lowerName])) {
            $matches[] = [
                "from_1c" => $item["cleaned"],
                "from_db" => $beerNames[$lowerName],
                "quantity" => $item["quantity"],
                "match_type" => "exact",
            ];
        } else {
            $nonMatches1C[] = $item;
        }
    }

    foreach ($beerNames as $lowerName => $originalName) {
        if (!isset($leftoversMap[$lowerName])) {
            $nonMatchesDB[] = $originalName;
        }
    }

    echo json_encode([
        "success" => true,
        "matches_count" => count($matches),
        "non_matches_1c_count" => count($nonMatches1C),
        "non_matches_db_count" => count($nonMatchesDB),
        "matches_sample" => array_slice($matches, 0, 300),
        "non_matches_1c_sample" => array_slice($nonMatches1C, 0, 300),
        "non_matches_db_sample" => array_slice($nonMatchesDB, 0, 300),
        "total_in_1c" => count($leftoversMap),
        "total_in_db" => count($beerNames),
    ]);
}

/* Получение бутылок в торговом зале */
function getMenuBottle($db, $id_shop)
{
    $query = "SELECT
                  p.id as p_id,
                  p.id_tare,
                  p.id_shop,
                  p.order,
                  p.id_beer,
                  p.status,
                  c.cost,
                  g.beer_name,
                  g.beer_dist,
                  g.beer_id,
                  g.brewery_name,
                  c.id as cost_id,
                  COALESCE(mb.count, p.count) as count_base,
                  p.count as purchase_count,
                  mb.count as menu_bottle_count,
                  mb.id as menu_bottle_id,
                  CASE
                      WHEN p.status IN (1, 2) THEN 'в пути'
                      WHEN p.status = 3 THEN 'на складе'
                      WHEN p.status = 4 THEN 'в холодильнике'
                      ELSE 'неизвестно'
                  END as status_text,
                  CASE
                      WHEN mb.id IS NOT NULL THEN 'в наличии (menu_bottle)'
                      ELSE 'не в наличии'
                  END as availability
              FROM purchase p
              LEFT JOIN tare t ON p.id_tare = t.id
              LEFT JOIN get_basebeer g ON p.id_beer = g.beer_id
              LEFT JOIN purchase_cost c ON p.ID = c.id_parent
              LEFT JOIN menu_bottle mb ON p.id = mb.id_purchase
              WHERE p.id_shop = $id_shop AND t.type = 1
              ORDER BY
                  g.brewery_name,
                  CASE
                      WHEN p.status IN (1, 2) THEN 4
                      WHEN p.status = 3 THEN 3
                      WHEN p.status = 4 THEN 2
                      ELSE 1
                  END;";

    ($_result = $db->query($query)) or
        die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Класс для работы с временными файлами */
class TempFileStorage
{
    private $tempDir;
    private $filename;

    public function __construct()
    {
        // Создаем директорию для временных файлов
        $this->tempDir = sys_get_temp_dir() . "/beetlecraft_leftovers/";
        if (!file_exists($this->tempDir)) {
            mkdir($this->tempDir, 0777, true);
        }

        // Генерируем уникальное имя файла на основе session_id
        $this->filename =
            $this->tempDir . "leftovers_" . session_id() . ".json";
    }

    /* Сохранение данных */
    public function save($data)
    {
        $fileData = [
            "data" => $data,
            "timestamp" => time(),
            "filename" => $_FILES["leftovers_file"]["name"] ?? "unknown",
            "rows_count" => count($data),
            "upload_time" => date("Y-m-d H:i:s"),
        ];

        return file_put_contents(
            $this->filename,
            json_encode($fileData, JSON_UNESCAPED_UNICODE)
        );
    }

    /* Загрузка данных */
    public function load()
    {
        if (file_exists($this->filename)) {
            $content = file_get_contents($this->filename);
            return json_decode($content, true);
        }
        return null;
    }

    /* Проверка существования данных */
    public function exists()
    {
        return file_exists($this->filename);
    }

    /* Проверка актуальности данных (не старше 24 часов) */
    public function isRecent($maxAge = 86400)
    {
        if ($this->exists()) {
            $data = $this->load();
            return time() - $data["timestamp"] < $maxAge;
        }
        return false;
    }

    /* Очистка данных */
    public function clear()
    {
        if ($this->exists()) {
            return unlink($this->filename);
        }
        return true;
    }

    /* Получение информации о файле */
    public function getInfo()
    {
        if ($this->exists()) {
            $data = $this->load();
            return [
                "filename" => $data["filename"],
                "upload_time" => $data["upload_time"],
                "rows_count" => $data["rows_count"],
                "age" => time() - $data["timestamp"],
                "is_recent" => $this->isRecent(),
            ];
        }
        return null;
    }

    /* Очистка старых файлов (старше 7 дней) */
    public function cleanupOldFiles($maxAge = 604800)
    {
        $files = glob($this->tempDir . "leftovers_*.json");
        $deleted = 0;

        foreach ($files as $file) {
            if (filemtime($file) < time() - $maxAge) {
                unlink($file);
                $deleted++;
            }
        }

        return $deleted;
    }
}

/* Загрузка файла на сервер */
function loadFile($file, $tempStorage)
{
    $file = $_FILES["leftovers_file"];
    $allowedExtensions = ["xlsx"];
    $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    // Проверяем расширение файла
    if (in_array($extension, $allowedExtensions)) {
        // Сохраняем файл
        $uploadDir = "./uploads/";
        $fileName = uniqid() . "." . $extension;
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($file["tmp_name"], $filePath)) {
            // Обрабатываем файл и сохраняем данные
            getReadFile1C($filePath, $tempStorage);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Ошибка сохранения файла",
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Разрешены только .xlsx файлы",
        ]);
    }
}

/* Чтение файла с остатками */
function getReadFile1C($fileName, $tempStorage)
{
    try {
        if ($xlsx = SimpleXLSX::parse($fileName)) {
            $data = [];

            foreach ($xlsx->rows() as $row) {
                $filteredRow = array_filter($row, function ($value) {
                    return $value !== null && $value !== "";
                });

                if (!empty($filteredRow)) {
                    $data[] = array_values($filteredRow);
                }
            }

            // Сохраняем данные во временный файл
            if ($tempStorage->save($data)) {
                header("Content-Type: application/json");
                echo json_encode([
                    "success" => true,
                    "message" => "Файл успешно обработан и сохранен",
                    "data" => $data,
                    "rowsCount" => count($data),
                    "columnsCount" => !empty($data) ? count($data[0]) : 0,
                    "saved" => true,
                ]);
            } else {
                throw new Exception("Ошибка сохранения данных файла");
            }

            // Удаляем временный файл после обработки
            if (file_exists($fileName)) {
                unlink($fileName);
            }
        } else {
            throw new Exception(SimpleXLSX::parseError());
        }
    } catch (Exception $e) {
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(
            [
                "error" => $e->getMessage(),
            ],
            JSON_UNESCAPED_UNICODE
        );
    }
}

/* Формирование акта инвентаризации */
function createAkt($db, $id_shop, $tempStorage)
{
    // Проверяем, есть ли данные во временном файле
    if (!$tempStorage->exists() || !$tempStorage->isRecent()) {
        echo json_encode([
            "success" => false,
            "message" =>
                "Нет актуальных данных из файла остатков. Сначала загрузите файл.",
        ]);
        return;
    }

    $fileData = $tempStorage->load();
    $leftoversData = $fileData["data"];

    $currentDate = date("d.m.Y");
    $filename = "akt_inventarizacii_" . date("Y-m-d_His") . ".xlsx";

    // 1. Получаем товары из purchase (с количеством)
    $query = "SELECT p.id as p_id, p.id_tare, p.id_shop, p.order, p.id_beer, c.cost,
                     g.beer_name, g.beer_dist, g.beer_id, g.brewery_name,
                     c.id as cost_id, m.count as count_base
              FROM menu_bottle m
              LEFT JOIN purchase p ON p.id = m.id_purchase
              LEFT JOIN tare t ON p.id_tare = t.id
              LEFT JOIN get_basebeer g ON p.id_beer = g.beer_id
              LEFT JOIN purchase_cost c ON p.ID = c.id_parent
              WHERE p.id_shop = $id_shop AND p.status = 4 AND t.type = 1
              ORDER BY g.brewery_name, g.beer_name";

    $result = $db->query($query);

    $purchaseData = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $normalizedName = mb_strtolower(trim($row["beer_name"]));
            $purchaseData[$normalizedName] = $row;
        }
    }

    // 2. Получаем ВСЕ наименования из get_basebeer (кроме тех, что уже в purchase)
    $query = "SELECT DISTINCT beer_name, brewery_name, beer_id
              FROM get_basebeer
              WHERE beer_name IS NOT NULL AND beer_name != ''
              ORDER BY brewery_name, beer_name";
    $result = $db->query($query);

    $allBeerFromDB = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $normalizedName = mb_strtolower(trim($row["beer_name"]));
            // Исключаем те, что уже есть в purchase
            if (!isset($purchaseData[$normalizedName])) {
                $allBeerFromDB[$normalizedName] = $row;
            }
        }
    }

    // 3. Парсим данные из 1С
    $leftoversMap = [];
    $startProcessing = false;

    foreach ($leftoversData as $row) {
        if (empty($row) || count($row) < 2) {
            continue;
        }

        $firstCell = trim($row[0] ?? "");

        if (!$startProcessing) {
            if (strpos($firstCell, "Номенклатура") !== false) {
                $startProcessing = true;
            }
            continue;
        }

        if (count($row) >= 3) {
            $nomenclature = trim($row[0] ?? "");

            // ФИЛЬТР: пропускаем строки, которые НЕ содержат "шт"
            if (stripos($nomenclature, "шт") === false) {
                continue;
            }

            $quantity = isset($row[2])
                ? (float) str_replace([" ", ","], ["", "."], $row[2])
                : 0;

            $productName = trim(preg_replace('/,\s*,\s*шт/i', "", $nomenclature));

            if (!empty($productName)) {
                $normalizedName = mb_strtolower($productName);
                $leftoversMap[$normalizedName] = $quantity;
            }
        }
    }

    // 4. Таблица 1: Все что есть в purchase + совпадения из 1С
    $table1Data = [
        ["<b>ТОВАРЫ В БАЗЕ</b>"],
        [
            "<b>Пивоварня</b>",
            "<b>Сорт</b>",
            "<b><wraptext><center>Количество в базе</center></wraptext></b>",
            "<b><wraptext><center>Количество в 1С</center></wraptext></b>",
            "<b><wraptext><center>Расхождение</center></wraptext></b>",
            "<b><wraptext><center>Фактическое наличие</center></wraptext></b>",
        ],
    ];

    $table1TotalBase = 0;
    $table1Total1C = 0;
    $table1Count = 0;
    $with1CMatchCount = 0;
    $without1CMatchCount = 0;

    foreach ($purchaseData as $normalizedName => $purchaseItem) {
        $beerName = $purchaseItem["beer_name"];
        $breweryName = $purchaseItem["brewery_name"];
        $countBase = (int) $purchaseItem["count_base"];
        $count1C = $leftoversMap[$normalizedName] ?? 0;

        $difference = $countBase - $count1C;
        $differenceText =
            $difference == 0
                ? ""
                : ($difference > 0
                    ? "+" . $difference
                    : $difference);

        $table1Data[] = [
            "<style border=\"#808080 none none none\"><left>$breweryName</left></style>",
            "<style border=\"#808080 none none none\"><left>$beerName</left></style>",
            "<style border=\"#808080 none none none\"><center>$countBase</center></style>",
            "<style border=\"#808080 none none none\"><center>$count1C</center></style>",
            "<style border=\"#808080 none none none\"><center>$differenceText</center></style>",
            "<style border=\"#808080 none none none\"></style>",
        ];

        $table1TotalBase += $countBase;
        $table1Total1C += $count1C;
        $table1Count++;

        if ($count1C > 0) {
            $with1CMatchCount++;
        } else {
            $without1CMatchCount++;
        }
    }

    // Итог для таблицы 1
    $table1Data[] = [
        "<style border=\"#808080 none none none\"><center><i>ИТОГО</i></center></style>",
        "<style border=\"#808080 none none none\"><center></center></style>",
        "<style border=\"#808080 none none none\"><center><i>$table1TotalBase</i></center></style>",
        "<style border=\"#808080 none none none\"><center><i>$table1Total1C</i></center></style>",
        "<style border=\"#808080 none none none\"><center><i>" .
        ($table1TotalBase - $table1Total1C) .
        "</i></center></style>",
        "<style border=\"#808080 none none none\"><center></center></style>",
    ];

    // 5. Таблица 2: Совпадения из 1С и get_basebeer (кроме тех, что в purchase)
    $table2Data = [
        [],
        ["<b>ТОВАРЫ ИЗ 1С</b>"],
        ["<b>Пивоварня</b>", "<b>Сорт</b>", "<b>Количество в 1С</b>"],
    ];

    $table2Total1C = 0;
    $table2Count = 0;

    foreach ($allBeerFromDB as $normalizedName => $beerItem) {
        $beerName = $beerItem["beer_name"];
        $breweryName = $beerItem["brewery_name"];
        $count1C = $leftoversMap[$normalizedName] ?? 0;

        // Только те, что есть в 1С и НЕТ в purchase
        if ($count1C > 0) {
            $table2Data[] = [
                "<style border=\"#808080 none none none\"><left>$breweryName</left></style>",
                "<style border=\"#808080 none none none\"><left>$beerName</left></style>",
                "<style border=\"#808080 none none none\"><center>$count1C</center></style>",
            ];

            $table2Total1C += $count1C;
            $table2Count++;
        }
    }

    // Итог для таблицы 2
    $table2Data[] = ["<i>ИТОГО</i>", "", "<i>" . $table2Total1C . "</i>"];

    // 6. Создаем общий массив для акта
    $aktData = [
        [
            "<b>Акт инвентаризации от " .
            $currentDate .
            " для BeetleCraft / Пенза, Московская 2</b>",
        ],
        ["<i>Сформирован на основе файла: " . $fileData["filename"] . "</i>"],
        ["<i>Дата загрузки файла: " . $fileData["upload_time"] . "</i>"],
        [],
    ];

    // Объединяем таблицы
    $aktData = array_merge($aktData, $table1Data, $table2Data);

    // 7. Статистика
    $aktData[] = [];
    $aktData[] = ["СТАТИСТИКА"];
    $aktData[] = ["Всего товаров в 1С: " . count($leftoversMap)];
    $aktData[] = ["Товаров в продаже (purchase): " . count($purchaseData)];
    $aktData[] = [
        "Товаров в базе (get_basebeer) кроме purchase: " .
        count($allBeerFromDB),
    ];
    $aktData[] = ["Товаров в Таблице 1: " . $table1Count];
    $aktData[] = ["Из них с совпадением в 1С: " . $with1CMatchCount];
    $aktData[] = ["Из них без совпадения в 1С: " . $without1CMatchCount];
    $aktData[] = ["Товаров в Таблице 2: " . $table2Count];

    // 9. Создаем Excel

    $xlsx = new SimpleXLSXGen();
    $xlsx
        ->fromArray($aktData)
        ->mergeCells("A1:F1")
        ->mergeCells("A5:F5")
        ->mergeCells("A25:C25")
        ->setColWidth(1, 20)
        ->setColWidth(2, 30)
        ->setColWidth(3, 10)
        ->setColWidth(4, 10)
        ->setColWidth(5, 10)
        ->setColWidth(6, 12)
        ->setDefaultFontSize(11)
        ->saveAs($filename);

    // Возвращаем ссылку для скачивания
    echo $filename;
}

/* Функция для тестирования сопоставления */
function testMatching($tempStorage)
{
    $fileData = $tempStorage->load();
    $leftoversData = $fileData["data"];

    // Просто возвращаем данные для анализа на фронтенде
    echo json_encode([
        "success" => true,
        "leftovers_sample" => array_slice($leftoversData, 0, 10), // Первые 10 строк
        "total_rows" => count($leftoversData),
    ]);
}

/* Проверка наличия данных */
function hasLeftoversData($tempStorage)
{
    echo json_encode([
        "success" => true,
        "hasData" => $tempStorage->exists() && $tempStorage->isRecent(),
        "isRecent" => $tempStorage->isRecent(),
    ]);
}

/* Очистка данных */
function clearLeftoversData($tempStorage)
{
    if ($tempStorage->clear()) {
        echo json_encode([
            "success" => true,
            "message" => "Данные файла остатков очищены",
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Ошибка при очистке данных",
        ]);
    }
}

/* Информация о загруженном файле */
function getLeftoversInfo($tempStorage)
{
    $info = $tempStorage->getInfo();

    if ($info) {
        echo json_encode([
            "success" => true,
            "data" => $info,
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Нет данных о загруженном файле",
        ]);
    }
}

// Очистка старых файлов при запуске (раз в день)
$tempStorage->cleanupOldFiles();

?>
