<?php

include "service.php";

require_once __DIR__ . "/simple-xlsx/simplexlsx.class.php";
require_once __DIR__ . "/simple-xlsx/SimpleXLSXGen.php";
use Shuchkin\SimpleXLSXGen;

$GLOBAL_ID_SHOP = _get_profil_data($db);

// ОБЪЕДИНЕННАЯ ПРОВЕРКА GET И POST
$query = $_GET["query"] ?? ($_POST["query"] ?? "");

switch ($query) {
    case "getShifts":
        getShifts($db, $GLOBAL_ID_SHOP);
        break;

    case "getAdditional":
        getAdditional($db, $GLOBAL_ID_SHOP);
        break;

    case "getCash":
        getCash($db, $GLOBAL_ID_SHOP);
        break;

    case "addShift":
        addShift($db, $_GET["date_shift"], $GLOBAL_ID_SHOP);
        break;

    case "addAdditional":
        addAdditional($db, $_GET["name"], $GLOBAL_ID_SHOP);
        break;

    case "deleteAdditional":
        deleteAdditional($db, $_GET["id"]);
        break;

    case "editAdditional":
        editAdditional($db, $_GET["name"], $_GET["id"]);
        break;

    case "addCredit":
        addCredit($db, $GLOBAL_ID_SHOP, $_GET["name"], $_GET["money"]);
        break;

    case "getCloseShift":
        getCloseShift($db, $_GET["id_shift"]);
        break;

    case "getCreditAll":
        getCreditAll($db, $GLOBAL_ID_SHOP);
        break;

    case "closeShift":
        closeShift(
            $db,
            $_GET["id_shift"],
            $_GET["money_all"],
            $_GET["money_acquiring"],
            $_GET["money_transfer"],
            $_GET["money_credit"],
            $_GET["money_cash_at_box"],
            $_GET["money_cash"],
            $_GET["id_user"],
            $GLOBAL_ID_SHOP
        );
        break;

    case "closeCredits":
        closeCredits($db, $_GET["id"], $_GET["money"]);
        break;

    case "addCashToBox":
        addCashToBox($db, $GLOBAL_ID_SHOP, $_GET["money"]);
        break;

    case "toOutCash":
        toOutCash($db, $GLOBAL_ID_SHOP, $_GET["money"]);
        break;

    case "loadSalesFile":
        loadSalesFile($db, $GLOBAL_ID_SHOP, $_POST["id_shift"]);
        break;

    case "getActualStorage":
        getActualStorage($db, $GLOBAL_ID_SHOP, $_GET["date_shift"]);
        break;
}

    /* Получение актуальных остатков на складе */
    function getActualStorage($db, $id_shop, $date_shift)
    {

        // 1. Получаем количество сортов в продаже (из menu_bottle)
        $sqlInSale = "SELECT COUNT(DISTINCT mb.id_beer) as count_sorts
                      FROM menu_bottle mb
                      WHERE mb.count > 0 AND mb.id_shop = ?";
        $stmtInSale = $db->prepare($sqlInSale);
        $stmtInSale->bind_param("i", $id_shop);
        $stmtInSale->execute();
        $resultInSale = $stmtInSale->get_result();
        $inSale = $resultInSale->fetch_assoc();
        $inSaleCount = $inSale['count_sorts'];
        $stmtInSale->close();

        // 2. Получаем количество сортов на складе (purchase status=3)
        $sqlInStock = "SELECT COUNT(DISTINCT p.id_beer) as count_sorts
                       FROM purchase p
                       WHERE p.status = 3 AND p.id_tare = 7 AND p.count > 0 AND p.id_shop = ?";
        $stmtInStock = $db->prepare($sqlInStock);
        $stmtInStock->bind_param("i", $id_shop);
        $stmtInStock->execute();
        $resultInStock = $stmtInStock->get_result();
        $inStock = $resultInStock->fetch_assoc();
        $inStockCount = $inStock['count_sorts'];
        $stmtInStock->close();

        // 3. Получаем количество сортов в пути (purchase status=1-2)
        $sqlInTransit = "SELECT COUNT(DISTINCT p.id_beer) as count_sorts
                         FROM purchase p
                         WHERE p.status IN (1, 2) AND p.count > 0 AND p.id_shop = ?";
        $stmtInTransit = $db->prepare($sqlInTransit);
        $stmtInTransit->bind_param("i", $id_shop);
        $stmtInTransit->execute();
        $resultInTransit = $stmtInTransit->get_result();
        $inTransit = $resultInTransit->fetch_assoc();
        $inTransitCount = $inTransit['count_sorts'];
        $stmtInTransit->close();

        // 4. Получаем ВСЕ стили пива в продаже с количеством (учитываем все три типа)
        $sqlBeerStyles = "SELECT
                            tb1.name as style_name,
                            SUM(mb.count) as total_count
                          FROM menu_bottle mb
                          INNER JOIN beer b ON mb.id_beer = b.id
                          LEFT JOIN type_beer tb1 ON b.id_type_1 = tb1.id
                          WHERE mb.count > 0 AND mb.id_shop = ?
                          GROUP BY tb1.name
                          ORDER BY total_count DESC, style_name";
        $stmtBeerStyles = $db->prepare($sqlBeerStyles);
        $stmtBeerStyles->bind_param("i", $id_shop);
        $stmtBeerStyles->execute();
        $resultBeerStyles = $stmtBeerStyles->get_result();
        $beerStyles = $resultBeerStyles->fetch_all(MYSQLI_ASSOC);
        $stmtBeerStyles->close();

        // 5. Формируем сообщение в HTML стиле для Telegram
        $message = "<b>Наличие пива на $date_shift</b>\n\n";

        // Основная информация
        $aa =  getTotalBottlesInSale($db, $id_shop);
        $message .= "<b>В продаже</b> - {$inSaleCount} сортов ($aa штук)\n";

        if ($inStockCount > 0) {
            $message .= "<b>На складе</b> - {$inStockCount} сортов (" . getTotalBottlesInStock($db, $id_shop) . " штук)\n";
        }

        if ($inTransitCount > 0) {
            $message .= "<b>В пути</b> - {$inTransitCount} сортов (" . getTotalBottlesInTransit($db, $id_shop) . " штук)\n";
        }

        $message .= "\n<b>В ПРОДАЖЕ ПО СТИЛЯМ:</b>\n";

        // Добавляем информацию по стилям
        if (count($beerStyles) > 0) {
            foreach ($beerStyles as $style) {
                $message .= "• {$style['style_name']} - <b>{$style['total_count']} шт.</b>\n";
            }
        } else {
            $message .= "❌ Нет пива в продаже\n";
        }

        echo $message;
    }

    // Вспомогательные функции для получения общего количества штук
    function getTotalBottlesInSale($db, $id_shop) {
        $sql = "SELECT SUM(count) as total FROM menu_bottle WHERE count > 0 AND id_shop = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id_shop);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();
        return $data['total'] ?? 0;
    }

    function getTotalBottlesInStock($db, $id_shop) {
        $sql = "SELECT SUM(count) as total FROM purchase WHERE status = 3 AND id_tare = 7 AND count > 0 AND id_shop = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id_shop);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();
        return $data['total'] ?? 0;
    }

    function getTotalBottlesInTransit($db, $id_shop) {
        $sql = "SELECT SUM(count) as total FROM purchase WHERE status IN (1, 2) AND id_tare = 7 AND count > 0 AND id_shop = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $id_shop);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();
        return $data['total'] ?? 0;
    }

/* Получение списка смен */
function getShifts($db, $id_shop)
{
    ($_result = $db->query(
        "SELECT * FROM shift where id_shop = " .
            $id_shop .
            " order by date_shift desc"
    )) or die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Получение списка доп.товаров */
function getAdditional($db, $id_shop)
{
    ($_result = $db->query("SELECT * FROM additional")) or
        die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Получение суммы наличных в кассе */
function getCash($db, $id_shop)
{
    ($_result = $db->query(
        "SELECT * FROM shift_cash where id_shop = " . $id_shop
    )) or die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Получение списка долгов */
function getCreditAll($db, $id_shop)
{
    ($_result = $db->query(
        "SELECT * FROM shift_credit where id_shop = " . $id_shop
    )) or die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Получение списка депозитов */
function getDebetAll($db, $id_shop)
{
    ($_result = $db->query(
        "SELECT * FROM shift_debet where id_shop = " .
            $id_shop .
            " and status = 0"
    )) or die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Создание пустой смены */
function addShift($db, $date_shift, $id_shop)
{
    ($_result = $db->query(
        "insert into shift (id_shop, date_shift) values (" .
            $id_shop .
            ", '" .
            $date_shift .
            "')"
    )) or die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Создание доп.товара */
function addAdditional($db, $name, $id_shop)
{
    ($_result = $db->query(
        "insert into additional (id_shop, name) values ($id_shop, '$name')"
    )) or die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Удаление доп.товара */
function deleteAdditional($db, $id)
{
    ($_result = $db->query("delete from additional where id = $id")) or
        die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Получение информации о закрытой смене */
function getCloseShift($db, $id_shift)
{
    ($_result = $db->query(
        "SELECT * FROM shift sh left join user us on sh.id_user = us.id where sh.id = " .
            $id_shift
    )) or die("Connection Error: " . $db->connect_error);

    $set = _query_to_json($_result);
    print_r($set);
}

/* Закрытие смены */
function closeShift(
    $db,
    $id_shift,
    $money_all,
    $money_acquiring,
    $money_transfer,
    $money_credit,
    $money_cash_at_box,
    $money_cash,
    $id_user,
    $id_shop
) {
    ($_result = $db->query(
        "update shift set money_all=" .
            $money_all .
            ", money_acquiring=" .
            $money_acquiring .
            ", money_transfer=" .
            $money_transfer .
            ", money_credit=" .
            $money_credit .
            ", money_cash_at_box=" .
            $money_cash_at_box .
            ", money_cash=" .
            $money_cash .
            ", id_user=" .
            $id_user .
            ", is_close=1 where id=" .
            $id_shift
    )) or die("Connection Error: " . $db->connect_error);

    $sql_select = "SELECT cash FROM shift_cash WHERE id_shop = ?";
    $stmt = $db->prepare($sql_select);
    $stmt->bind_param("i", $id_shop);
    $stmt->execute();

    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Если запись существует, обновляем money
        $stmt->bind_result($current_money);
        $stmt->fetch();
        $new_money = $current_money + $money_cash;

        $sql_update = "UPDATE shift_cash SET cash = ? WHERE id_shop = ?";
        $stmt = $db->prepare($sql_update);
        $stmt->bind_param("ii", $new_money, $id_shop);
        $stmt->execute();
        echo $new_money;
    } else {
        echo 0;
    }
}

function addCredit($db, $id_shop, $name, $additional_money)
{
    $sql_select =
        "SELECT money FROM shift_credit WHERE name = ? AND id_shop = ?";
    $stmt = $db->prepare($sql_select);
    $stmt->bind_param("si", $name, $id_shop);
    $stmt->execute();

    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Если запись существует, обновляем money
        $stmt->bind_result($current_money);
        $stmt->fetch();
        $new_money = $current_money + $additional_money;

        $sql_update =
            "UPDATE shift_credit SET money = ? WHERE name = ? AND id_shop = ?";
        $stmt = $db->prepare($sql_update);
        $stmt->bind_param("isi", $new_money, $name, $id_shop);
        $stmt->execute();
        echo "Money updated successfully!";
    } else {
        // Если записи нет, создаем новую запись
        $new_money = $additional_money;

        $sql_insert =
            "INSERT INTO shift_credit (name, money, id_shop) VALUES (?, ?, ?)";
        $stmt = $db->prepare($sql_insert);
        $stmt->bind_param("sii", $name, $new_money, $id_shop);
        $stmt->execute();
        echo "New record created successfully!";
    }
}

/* Задать количество наличных в кассе */
function addCashToBox($db, $id_shop, $money)
{
    $sql_select = "SELECT cash FROM shift_cash WHERE id_shop = ?";
    $stmt = $db->prepare($sql_select);
    $stmt->bind_param("i", $id_shop);
    $stmt->execute();

    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $sql_update = "UPDATE shift_cash SET cash = ? WHERE id_shop = ?";
        $stmt = $db->prepare($sql_update);
        $stmt->bind_param("ii", $money, $id_shop);
        $stmt->execute();
    } else {
        $sql_update = "insert into shift_cash (cash, id_shop) values (?,?)";
        $stmt = $db->prepare($sql_update);
        $stmt->bind_param("ii", $money, $id_shop);
        $stmt->execute();
    }
    echo $money;
}

/* Изъять количество наличных в кассе */
function toOutCash($db, $id_shop, $money)
{
    $sql_select = "SELECT cash FROM shift_cash WHERE id_shop = ?";
    $stmt = $db->prepare($sql_select);
    $stmt->bind_param("i", $id_shop);
    $stmt->execute();

    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Если запись существует, обновляем money
        $stmt->bind_result($current_money);
        $stmt->fetch();
        $new_money = $current_money - $money;

        $sql_update = "UPDATE shift_cash SET cash = ? WHERE id_shop = ?";
        $stmt = $db->prepare($sql_update);
        $stmt->bind_param("ii", $new_money, $id_shop);
        $stmt->execute();
        echo $new_money;
    } else {
        echo "В кассе нет наличных";
    }
}

/* Закрыть долги */
function closeCredits($db, $id, $money)
{
    ($_result = $db->query(
        "update shift_credit set money=$money where id =$id"
    )) or die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Изменить доп.товар */
function editAdditional($db, $name, $id)
{
    ($_result = $db->query(
        "update additional set name='$name' where id =$id"
    )) or die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Закрыть депозиты */
function closeDebets($db, $ids)
{
    ($_result = $db->query(
        "update shift_debet set status=2 where id in (" . $ids . ")"
    )) or die("Connection Error: " . $db->connect_error);

    echo "1";
}

/* Загрузка файла продаж для ExtJS */
function loadSalesFile($db, $id_shop, $id_shift)
{
    // Проверяем, что файл был отправлен
    if (
        !isset($_FILES["sales_file"]) ||
        $_FILES["sales_file"]["error"] !== UPLOAD_ERR_OK
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Файл не был загружен или произошла ошибка",
        ]);
        return;
    }

    $file = $_FILES["sales_file"];
    $allowedExtensions = ["xlsx"];
    $extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions)) {
        echo json_encode([
            "success" => false,
            "message" => "Разрешены только .xlsx файлы",
        ]);
        return;
    }

    $uploadDir = "./uploads/sales/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = uniqid() . "." . $extension;
    $filePath = $uploadDir . $fileName;

    if (move_uploaded_file($file["tmp_name"], $filePath)) {
        // ВЫЗЫВАЕМ readSalesFile КОТОРЫЙ СРАЗУ ОБНОВЛЯЕТ БАЗУ
        readSalesFile($filePath, $db, $id_shop, $id_shift);
        unlink($filePath);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Ошибка сохранения файла на сервере",
        ]);
    }
}

/* Чтение файла продаж и обновление базы */
function readSalesFile($filePath, $db, $id_shop, $id_shift)
{
    require_once __DIR__ . "/simple-xlsx/simplexlsx.class.php";

    try {
        if ($xlsx = SimpleXLSX::parse($filePath)) {
            $data = $xlsx->rows();
            $salesData = [];
            $reportDate = null;

            // Парсим данные согласно структуре с объединенными ячейками
            foreach ($data as $lineNumber => $row) {
                $lineNum = $lineNumber + 1;

                // Пропускаем первые 11 строк
                if ($lineNum < 12) {
                    if (!$reportDate) {
                        $reportDate = extractReportDate($row);
                    }
                    continue;
                }

                // Пропускаем пустые строки
                if (empty(array_filter($row))) {
                    continue;
                }

                // Останавливаемся на итогах
                $rowText = implode(" ", $row);
                if (strpos($rowText, "Всего наименований") !== false) {
                    break;
                }

                // Парсим строку данных
                $parsedRow = parseSalesRow($row, $lineNum);
                if ($parsedRow) {
                    $salesData[] = $parsedRow;
                }
            }

            // ОБНОВЛЯЕМ БАЗУ ДАННЫХ
            $updateResult = updateMenuBottleFromSalesData(
                $db,
                $id_shop,
                $salesData,
                $reportDate
            );

            // ОБНОВЛЯЕМ СТАТУС СМЕНЫ
            ($_result = $db->query(
                "update shift set is_load_leftover='1' where id=$id_shift"
            )) or die("Connection Error: " . $db->connect_error);

            // ВОЗВРАЩАЕМ РЕЗУЛЬТАТ ДЛЯ ExtJS
            echo json_encode(
                [
                    "success" => true,
                    "message" => "Файл продаж обработан и база обновлена",
                    "report_date" => $reportDate,
                    "sales_data" => [
                        "total_sales" => count($salesData),
                        "total_quantity" => array_sum(
                            array_column($salesData, "quantity")
                        ),
                    ],
                    "update_result" => $updateResult,
                ],
                JSON_UNESCAPED_UNICODE
            );
        } else {
            throw new Exception(SimpleXLSX::parseError());
        }
    } catch (Exception $e) {
        echo json_encode(
            [
                "success" => false,
                "message" => "Ошибка обработки файла: " . $e->getMessage(),
            ],
            JSON_UNESCAPED_UNICODE
        );
    }
}

/* Функция обновления menu_bottle на основе данных продаж */
function updateMenuBottleFromSalesData($db, $id_shop, $salesData, $reportDate)
{
    // Группируем продажи по наименованию
    $groupedSales = [];
    foreach ($salesData as $sale) {
        $name = $sale["normalized_name"];
        $groupedSales[$name] = ($groupedSales[$name] ?? 0) + $sale["quantity"];
    }

    // Получаем текущие данные из menu_bottle
    $query = "SELECT mb.id, mb.count, g.beer_name,
                     LOWER(TRIM(g.beer_name)) as normalized_name
              FROM menu_bottle mb
              JOIN purchase p ON p.id = mb.id_purchase
              JOIN get_basebeer g ON p.id_beer = g.beer_id
              JOIN tare t ON p.id_tare = t.id
              WHERE p.id_shop = $id_shop AND p.status = 4 AND t.type = 1";

    $result = $db->query($query);
    $menuBottleData = [];

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $menuBottleData[$row["normalized_name"]] = $row;
        }
    }

    // Обновляем количество в menu_bottle
    $updatedItems = [];
    $notFoundItems = [];
    $errors = [];

    foreach ($groupedSales as $productName => $soldQuantity) {
        if (isset($menuBottleData[$productName])) {
            $item = $menuBottleData[$productName];
            $newCount = max(0, $item["count"] - $soldQuantity);

            $updateQuery =
                "UPDATE menu_bottle SET count = $newCount WHERE id = " .
                $item["id"];

            if ($db->query($updateQuery)) {
                $updatedItems[] = [
                    "product_name" => $item["beer_name"],
                    "old_count" => $item["count"],
                    "sold_quantity" => $soldQuantity,
                    "new_count" => $newCount,
                ];
            } else {
                $errors[] =
                    "Ошибка обновления: " .
                    $item["beer_name"] .
                    " - " .
                    $db->error;
            }
        } else {
            $notFoundItems[] = [
                "product_name" => $productName,
                "sold_quantity" => $soldQuantity,
            ];
        }
    }

    return [
        "updated_items" => $updatedItems,
        "not_found_items" => $notFoundItems,
        "errors" => $errors,
        "summary" => [
            "total_products_in_sales" => count($groupedSales),
            "successfully_updated" => count($updatedItems),
            "not_found" => count($notFoundItems),
            "total_sold" => array_sum(
                array_column($updatedItems, "sold_quantity")
            ),
        ],
    ];
}

/* Парсинг строки с данными продаж */
function parseSalesRow($row, $lineNumber)
{
    // Извлекаем номер строки (ячейки 1-2)
    $itemNumber = "";
    for ($i = 1; $i <= 2; $i++) {
        if (isset($row[$i]) && trim($row[$i]) !== "") {
            $itemNumber = trim($row[$i]);
            break;
        }
    }

    // Извлекаем название сорта (ячейки 3-27)
    $productName = "";
    for ($i = 3; $i <= 27; $i++) {
        if (isset($row[$i]) && trim($row[$i]) !== "") {
            $productName = trim($row[$i]);
            break;
        }
    }

    // Извлекаем количество (ячейки 28-30)
    $quantity = 0;
    for ($i = 28; $i <= 30; $i++) {
        if (isset($row[$i]) && trim($row[$i]) !== "") {
            $quantityStr = trim($row[$i]);
            $quantity = (float) str_replace(
                [" ", ","],
                ["", "."],
                $quantityStr
            );
            break;
        }
    }

    if (empty($productName) || $quantity <= 0) {
        return null;
    }

    $cleanProductName = trim(preg_replace('/,.*$/', "", $productName));

    return [
        "line_number" => $lineNumber,
        "item_number" => $itemNumber,
        "product_name" => $cleanProductName,
        "quantity" => (int) $quantity,
        "normalized_name" => mb_strtolower($cleanProductName),
    ];
}

/* Функция для извлечения даты отчета */
function extractReportDate($row)
{
    if (empty($row)) {
        return null;
    }

    $fullText = implode(" ", array_map("trim", $row));

    if (preg_match("/(\d{2}\.\d{2}\.\d{4})/", $fullText, $matches)) {
        $dateString = $matches[1];

        if (preg_match("/от\s+(\d{2}\.\d{2}\.\d{4})/", $fullText, $matches)) {
            $dateString = $matches[1];
        }

        $dateParts = explode(".", $dateString);
        if (
            count($dateParts) === 3 &&
            checkdate($dateParts[1], $dateParts[0], $dateParts[2])
        ) {
            return [
                "original_string" => $dateString,
                "formatted" => $dateString,
                "iso" =>
                    $dateParts[2] . "-" . $dateParts[1] . "-" . $dateParts[0],
            ];
        }
    }

    return null;
}
?>
