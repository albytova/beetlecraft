<?php
    require_once __DIR__ . '/PHPExcel-1.8/Classes/PHPExcel/IOFactory.php';

    //$api_url = 'https://www.cmegroup.com/CmeWS/exp/voiProductsViewExport.ctl?media=xls&tradeDate=20210101&assetClassId=3&reportType=P&excluded=CEE,CEU,KCB';
    //$api_url = 'https://www.cmegroup.com/CmeWS/exp/voiProductsViewExport.ctl?media=xls&tradeDate=20210108&assetClassId=3&reportType=F&excluded=CEE,CEU,KCB';
    $api_url = 'https://www.cmegroup.com/CmeWS/exp/voiProductsViewExport.ctl?media=xls&tradeDate=20210112&assetClassId=3&reportType=P&excluded=CEE,CEU,KCB';


    /* Подключение к базе */
    $mysqli = new mysqli("213.159.210.185", "adminka", "beetlecraft2018", "cme");
    if ($mysqli->connect_errno) {
       exit("Не удалось подключиться к MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error);
    }
    $current_date = date('Y-m-d', time());

    /* Проверка есть ли в базе данные за сегодня */
    $datatoday = $mysqli->query("SELECT * FROM alldata WHERE alldata.datetime_insert = '".$current_date."'");

    if ($datatoday->num_rows == 0) {
            /* Получение xls */
            file_put_contents('excel.xls',
                  file_get_contents($api_url)
            );
            $xls = PHPExcel_IOFactory::load(__DIR__ . '/excel.xls');
            $xls->setActiveSheetIndex(0);
            $worksheet = $xls->getActiveSheet();

            /* Формирование json для записи в базу и запись в базу */
                $data = [];
                $lastRow = $worksheet->getHighestRow();
                $currency_сouple = array("AUD/USD", "GBP/USD", "CAD/USD", "EUR/USD", "JPY/USD");
                for ($row = 7; $row <= $lastRow; $row++) {
                    $name = $worksheet->getCell('A'.$row)->getValue();
                    $couple = substr($name, 0, 7);
                    $type = $worksheet->getCell('B'.$row)->getValue();
                    $globex = $worksheet->getCell('C'.$row)->getValue();
                    $oi = $worksheet->getCell('G'.$row)->getValue();
                    $oi_change = $worksheet->getCell('H'.$row)->getValue();

                    $globex = str_replace(",", ".", $globex);
                    $oi = str_replace(",", ".", $oi);
                    $oi_change = str_replace(",", ".", $oi_change);

                    if (in_array($couple, $currency_сouple)) {

                            $data[] = [
                                'Name' => $name,
                                'Type' => $type,
                                'Globex' => $globex,
                                'OpenInterest' => $oi,
                                'Change' => $oi_change
                            ];

                            if (!$mysqli->query("INSERT INTO alldata(name, type, globex, open_interest, oi_change, datetime_insert) VALUES ('".$name."','".$type."','".$globex."','".$oi."','".$oi_change."','".$current_date."')")) {
                              //exit ("INSERT INTO alldata(name, type, globex, open_interest, oi_change) VALUES ('".$name."','".($worksheet->getCell('B'.$row)->getValue())."','".($worksheet->getCell('C'.$row)->getValue())."','".($worksheet->getCell('G'.$row)->getValue())."','".($worksheet->getCell('H'.$row)->getValue())."')");
                                exit ( "Не удалось записать строку: (" . $mysqli->errno . ") " . $mysqli->error);
                            }
                    }
                    $datatoday = $data;
                }
    }
    else {
        $rows = array();
        while($r = mysqli_fetch_assoc($datatoday)) {
            $rows[] = $r;
        }
        $datatoday = $rows;
    }

    echo json_encode($datatoday);

    //формирование трейд даты
    //обработчики ошибок записи и чтения xls
?>