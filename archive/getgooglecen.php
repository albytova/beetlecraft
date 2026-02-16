<?php
        require_once 'php/dompdf/autoload.inc.php';
        use Dompdf\Dompdf;

        //Загрузка таблицы Контент.Нужны ценники
		$spreadsheet_cen_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=1809283551&single=true&output=csv";
        $cen_data = [];
		$handle = fopen($spreadsheet_cen_url, "r");
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		    $cen_data[] = $data;
		}
		fclose($handle);

        $len = count($cen_data);
        $ipdata = [];
        $zhukdata = [];
        $k1 = 0; $k2 = 0;
		for ($i = 0; $i < $len; $i++) {
		    if ($cen_data[$i][0] == 'BeetleCraft') {
               $ipdata[$k1++] = $cen_data[$i];
            }
            else {
               $zhukdata[$k2++] = $cen_data[$i];
            }
		}

        $ipstr = formingPDF($ipdata);
        $zhukstr = formingPDF($zhukdata);

        if ($_GET["type"] == 1) {
                    $html = mb_convert_encoding($ipstr, 'HTML-ENTITIES', 'UTF-8');
                    $dompdf = new Dompdf();
                    $dompdf->loadHtml($html, "UTF-8");
                    $dompdf->setPaper('A4', 'portrait');
                    $dompdf->render();
                    $dompdf->stream('cen_beetle.pdf');
        }
        else {
                $htmlzhuk = mb_convert_encoding($zhukstr, 'HTML-ENTITIES', 'UTF-8');
                $dompdfzhuk = new Dompdf();
                $dompdfzhuk->loadHtml($htmlzhuk, "UTF-8");
                $dompdfzhuk->setPaper('A4', 'portrait');
                $dompdfzhuk->render();
                $dompdfzhuk->stream('cen_zamedlenie.pdf');
        }

        function formingPDF ($data) {

                //Формирование структуры HTML-документа
                $str = '<html style="width:70%"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><style type="text/css">'.
                                          'body { font-family: DejaVu Sans; font-size: 19px;}'.
                                          '.tg  {border-spacing:0;border-collapse:unset;}'.
                                          '.tg .tg-0lax > div {width: 100%;height: 19px;overflow:hidden;}'.
                                          '.tg .tg-1lax > div {width: 100%;height: 70px;overflow:hidden;}'.
                                          '.tg .tg-2lax > div {width: 100%;height: 30px;overflow:hidden;}'.
                                          '.tg .tg-3lax > div {width: 100%;height: 20px;overflow:hidden;}'.
                                          '.tg td{border-color:black;border-style:solid;border-width:1px;font-size:12px;'.
                                          '  overflow:hidden;padding:0;word-break:normal;}'.
                                          '.tg .tg-0lax{text-align:center;border-bottom:solid white;font-size:10px;}'.
                                          '.tg .tg-1lax{border-bottom:solid white;border-top:solid white;text-align:center;font-size:12px;padding:1;line-height:1;}'.
                                          '.tg .tg-2lax{text-align:center;vertical-align:bottom;border-top:solid white;padding:0;line-height:1;font-size:16px;font-weight:bolder;}'.
                                          '.tg .tg-3lax{text-align:center;vertical-align:top;border-top:solid white;padding:0;font-size:9px;}'.
                                          '</style></head><body>'.
                                          '<table class="tg">';

                $len = count($data);
                for ($i = 0; $i < $len; $i++) {

                    //формирование перехода на следующую строку
                    $k = $len - $i;
                    if ($k < 5)
                        $i6 = $i+$k;
                    else
                        $i6 = $i+5;

                    //Заполнение строки с пивоварней
                    $ii = $i;
                    $str = $str.'<tr style="line-height: 15px">';
                    while ($ii < $i6 ) {
                        if ($ii == $len)
                            break;

                        $str = $str.'<td class="tg-0lax" ><div>'.$data[$ii][1].'</div></td>';
                        $ii = $ii + 1;
                    }
                    $str = $str.'</tr><tr>';

                    //Заполнение строки с названием, стилем и градусом
                     $ii = $i;
                     while ($ii < $i6 ) {
                         if ($ii == $len)
                             break;

                         $str = $str.'<td class="tg-1lax" ><div><b>'.$data[$ii][2].'</b><div style="font-size:11px">'.$data[$ii][3].'<br>ABV '.$data[$ii][4].'%</div></div></td>';
                         $ii = $ii + 1;
                     }
                     $str = $str.'</tr><tr">';

                     //Заполнение строки с ценой
                     $ii = $i;
                     while ($ii < $i6 ) {
                         if ($ii == $len)
                             break;

                        $str = $str.'<td class="tg-2lax" ><div>'.$data[$ii][7].'₽</div></td>';
                        $ii = $ii + 1;
                     }
                    $str = $str.'</tr><tr>';

                    //Заполнение строки с юр.лицом
                    $ii = $i;

                     while ($ii < $i6 ) {
                         if ($ii == $len)
                             break;


                         $urlico = "ИП Албутова Е.В.";

                        $str = $str.'<td class="tg-3lax" ><div>'.$urlico.'</div></td>';
                        $ii = $ii + 1;
                     }
                    $str = $str.'</tr>';

                    if ($ii == $i6) {
                        $i = $i+4;
                    }
                }

                $str = $str."</table></body></html>";

                return $str;
        }
?>