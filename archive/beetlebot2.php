<?php 

if (!isset($_REQUEST)) { 
	return false; 
} 
session_start();

ini_set('error_reporting', E_ERROR);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require './VKCallBackBot/VKCallBackBot.php';

$spreadsheet_draft_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=126767324&single=true&output=csv";

$spreadsheet_bottle_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=1801578177&single=true&output=csv";

$spreadsheet_brewery_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=98429419&single=true&output=csv";

if(!ini_set('default_socket_timeout', 15)) 
	return false;

$draft_data = false;
$dataByStyle = false;
$dataByStyleBottle = false;

//чтение таблицы розлива, формирование текста результата
if (($handle = fopen($spreadsheet_draft_url, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $draft_data[] = $data;
    }
    fclose($handle);
    $draft_result = "";
    foreach ($draft_data as $obj) {
	    $draft_result = $draft_result.$obj[0].". ".$obj[1]." (".$obj[2].")<br>";

        if ($obj[10]) {
            $style1 = mb_strtolower($obj[10]);
            if (!$dataByStyle[ $style1 ])
                $dataByStyle[ $style1 ] = "";
            $dataByStyle[ $style1 ] = $dataByStyle[ $style1 ].$obj[1]." (".$obj[2].") / ".$obj[3]."<br>";                
        }
        
        if ($obj[11]) {
            $style2 = mb_strtolower($obj[11]);
            if (!$dataByStyle[ $style2 ])
                $dataByStyle[ $style2 ] = "";
            $dataByStyle[ $style2 ] = $dataByStyle[ $style2 ].$obj[1]." (".$obj[2].") / ".$obj[3]."<br>";                
        }
	}
}
else
	return false;


$bottleBrew = array();
//чтение таблицы стекла, формирование текста результата
if (($handle2 = fopen($spreadsheet_bottle_url, "r")) !== FALSE) {
    while (($data2 = fgetcsv($handle2, 1000, ",")) !== FALSE) {
        $bottle_data[] = $data2;
    }
    fclose($handle2);
    $bottle_results = array();
    $bottle_result = "";
    $brewery = '';
    foreach ($bottle_data as $obj2) {
    	if ($brewery != $obj2[0]) {
    		$bottleBrew [ mb_strtolower( trim ($brewery) ) ] = $bottle_result;
    		$brewery = $obj2[0];
    		$bottle_result = "$brewery:<br>";
    	}
	    $bottle_result = "{$bottle_result}= {$obj2[1]} ({$obj2[2]}) - {$obj2[3]}руб<br>";

        if ($obj2[4]) {
            $style1 = mb_strtolower($obj2[4]);
            if (!$dataByStyleBottle[ $style1 ])
                $dataByStyleBottle[ $style1 ] = "";
            $dataByStyleBottle[ $style1 ] = $dataByStyleBottle[ $style1 ].$obj2[0]." / ".$obj2[1]." / ".$obj2[2]." - ".$obj2[3]."руб<br>";                
        }
        
        if ($obj2[5]) {
            $style2 = mb_strtolower($obj2[5]);
            if (!$dataByStyleBottle[ $style2 ])
                $dataByStyleBottle[ $style2 ] = "";
            $dataByStyleBottle[ $style2 ] = $dataByStyleBottle[ $style2 ].$obj2[0]." / ".$obj2[1]." / ".$obj2[2]." - ".$obj2[3]."руб<br>";              
        }
	}
	$last_brewery = mb_strtolower( trim ( $brewery ) );
	$bottleBrew[ $last_brewery ] = $bottle_result;
	$i = 0;
	$res = "";
	foreach ($bottleBrew as $brew) { //делаю разбиение по 4 пивоварням, чтобы не отправлять всё одним сообщением
		if ($i % 4 == 0) {
			array_push($bottle_results, $res);
			$res = "";
		}
		else
			$res = "{$res}{$brew}";
		$i = $i + 1;
	}
	if ($res != "")
		array_push($bottle_results, $res);
}
else
	return false;

// $bot = new VKCallBackBot([
//     'access_token' => 'be05e29af8166a89596851657017151569140fe5f32e65f491a4df43ab5c19dfc5850e2f99936638091c3',
//     'confirmation_key' => '51e38ac6',
//     'callback_secret' => 'qdd9oovtdukxm56m3ckb', 
//     'fwdMessagesProcess' => true,
//     'WebServer' => 1, // 1 - nginx; 2 - apache.
//     'vAPI' => '5.101', ....
// ]);

$bot = new VKCallBackBot([
    'access_token' => '26f1b8280f18cd1ae23a20c4ac50258b42520c7293feb35fda262056312b86ac8351c757e309ea0013f30',
    'confirmation_key' => '3b615795',
    'callback_secret' => 'hru2323heuh32ueh32ui',
    'fwdMessagesProcess' => true,
    'WebServer' => 1, // 1 - nginx; 2 - apache.
    'vAPI' => '5.101',
]);

switch ($bot->event) {
    case 'message_new':

        //Обрабатывает сообщение пользователя и вводит нужные переменные.
        $bot->MessageProcessing();

        //Создаю стандартную клавитуру и помещаю её в переменную.
        $defaultKeyboard = $bot->message
            ->keyboard()
            ->row()
            ->button('Краны', 'primary', ['command' => 'clickbutton', 'parametr' => 1])
            ->button('Стекло / банки', 'primary', ['command' => 'clickbutton', 'parametr' => 2])
            ->row()
            ->button('Поиск по пивоварне', 'primary', ['command' => 'findbybrew', 'parametr' => 3])
            ->button('Поиск по стилю', 'primary', ['command' => 'findbystyle', 'parametr' => 4])
            ->row()
            ->one_time()//false by default
            ->getKeyboard();

        $stylesKeyboard = $bot->message
                                ->keyboard()
                                ->row()
                                ->button('APA / IPA / DIPA', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "101"])
                                ->button('стаут/портер', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "102"])
                                ->button('крепче 9%', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "103"])
                                ->row()
                                ->button('фруктовое', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "104"])
                                ->button('классика', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "105"])      
                                ->button('сидр / медовуха', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "106"])
                                ->row()
                                ->button('необычное', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "107"])
                                ->button('Sour Ale / Gose', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "108"])
                                ->button('Пшеничное', 'secondary', ['command' => 'clickbuttonstyle', 'parametr' => "109"])
                                ->row()
                                ->button('Меню', 'positive', ['command' => 'start'])
                                ->row()
                                ->one_time()
                                ->getKeyboard();

        switch ($bot->command) {
            case 'start':
            case 'начать':
                $bot->message
                    ->text("Добро пожаловать!")
                    ->setKeyboard($defaultKeyboard)
                    ->send();
                break;

                case 'clickbutton':
                    file_put_contents('commands.txt', "clickbutton");
                    switch ($bot->payload['parametr']) {
                        case 1:
                             $bot->message
                                ->text($draft_result)
                                ->setKeyboard($defaultKeyboard)
                                ->send();
                            break;

                        case 2:
                            foreach ($bottle_results as $res) {
                                $bot->message
                                    ->text($res)
                                    ->setKeyboard($defaultKeyboard)
                                    ->send();
                            }
                            break;
                        
                        default:
                            break;
                    }                           
                break;

                case 'findbybrew':                   
                    file_put_contents('commands.txt', "findbybrew");
                    $bot->message
                        ->text("Напишите название пивоварни")
                        ->setKeyboard($defaultKeyboard)
                        ->send();       
                break;

                case 'findbystyle':                   
                    file_put_contents('commands.txt', "findbystyle");
                    $bot->message
                        ->text("Выберите стиль")
                        ->setKeyboard($stylesKeyboard)
                        ->send();  
                break;



                case 'clickbuttonstyle':
                    file_put_contents('commands.txt', "clickbuttonstyle");
                    $result = getByStyle($bot->payload['parametr'], $dataByStyle, $dataByStyleBottle);
                    $bot->message
                                    ->text($result)
                                    ->setKeyboard($defaultKeyboard)
                                    ->send();
                break;

            default:
                $current = file_get_contents('commands.txt');
                if ($current == "findbybrew") {
                    $brewery = $bot->command;
                    $brewery2 = join(" ", $bot->commandOptions);
                    $brewery = "$brewery $brewery2";
                    $result = getByBrew($brewery, $draft_data, $bottleBrew);                    
                    $bot->message
                        ->text($result)
                        ->setKeyboard($defaultKeyboard)
                        ->send();     
                    if ($result != "Такая пивоварня не найдена")        
                        file_put_contents('commands.txt', "");       
                }                
                break;
        }

        break;

    case 'confirmation':
        exit($bot->confirmation_key);
        break;
}

$bot->sendOK();


function getByBrew($message, $draft_data, $bottle_data) {
    $brew = trim($message);
    $brew = mb_strtolower($brew);
 
    $draft_result = "";
    foreach ($draft_data as $obj) {
        if (mb_strtolower($obj[2]) == $brew)
            $draft_result = "{$draft_result}={$obj[1]}<br>";
    }

    $bottle_result = "";
    foreach ($bottle_data as $key => $value) {
        if ($key == $brew) {
            $bottle_result = $value;
            break;
        }
    }

    if ($draft_result != "") {
        $draft_result = "НА КРАНАХ:<br>{$draft_result}<br>";
    }
    if ($bottle_result != "") {
        $bottle_result = "СТЕКЛО:<br>{$bottle_result}";
    }
    
    $result_str = "{$draft_result}{$bottle_result}";

    if ($result_str == "")
        $result_str = "Такая пивоварня не найдена";

    return $result_str;
}

function getByStyle($code, $dataByStyle, $dataByStyleBottle) {
    $style = getStyleByCode($code);

    $draft_result = $dataByStyle[ $style ];

    $bottle_result = $dataByStyleBottle[ $style ];

    if ($draft_result != "") {
        $draft_result = "НА КРАНАХ:<br>{$draft_result}<br>";
    }
    if ($bottle_result != "") {
        $bottle_result = "СТЕКЛО:<br>{$bottle_result}";
    }
    
    $result_str = "{$draft_result}{$bottle_result}";

    if ($result_str == "")
        $result_str = "Такой стиль не найден";

    return $result_str;
}

function getStyleByCode ($code) {
    $codeStyle = [
        "101" => "APA/IPA/DIPA",
        "102" => "стаут/портер",
        "103" => "крепче 9%",
        "104" => "фруктовое",
        "105" => "классика",
        "106" => "сидр/медовуха",
        "107" => "необычное",
        "108" => "sour ale/gose",
        "109" => "пшеничное"
    ];
    return mb_strtolower($codeStyle[$code]); 
}

?>