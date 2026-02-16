<?php

switch ($_GET["query"]) {
    // ... существующие cases ...

    case "readSalesFile":
        $file = $_FILES["sales_file"];
        $uploadDir = "./uploads/";
        $fileName = uniqid() . ".xlsx";
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($file["tmp_name"], $filePath)) {
            readSalesFile($filePath);
            unlink($filePath); // Удаляем после чтения
        }
        break;

    case "readSalesFileDetailed":
        $file = $_FILES["sales_file"];
        $uploadDir = "./uploads/";
        $fileName = uniqid() . ".xlsx";
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($file["tmp_name"], $filePath)) {
            readSalesFileDetailed($filePath);
            unlink($filePath);
        }
        break;
}

function readSalesFile($filePath) {
    require_once __DIR__ . "/simple-xlsx/simplexlsx.class.php";

    try {
        if ($xlsx = SimpleXLSX::parse($filePath)) {
            $data = $xlsx->rows();

            echo json_encode([
                "success" => true,
                "message" => "Файл успешно прочитан",
                "total_rows" => count($data),
                "data" => $data
            ]);

        } else {
            throw new Exception(SimpleXLSX::parseError());
        }
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Ошибка чтения файла: " . $e->getMessage()
        ]);
    }
}

?>