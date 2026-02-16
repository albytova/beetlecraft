<?php

	require 'vendor/autoload.php';

 	$phpWord = new  \PhpOffice\PhpWord\PhpWord();

	$sorts = $_POST['sorts'];

	$phpWord->setDefaultFontName('Cambria');
	$phpWord->setDefaultFontSize(10);

	$fontStyleBrew = array('size'=>12, 'bold'=>TRUE, 'allCaps'=>TRUE);
	$parStyleBrew = array('align'=>'center','spaceBefore' => 0, 'spaceAfter' => 0);

	$fontStyle = array('size'=>10, 'bold'=>TRUE, 'allCaps'=>FALSE);
	$fontStyle2 = array('size'=>10, 'bold'=>FALSE, 'allCaps'=>FALSE);
	$parStyle = array('align'=>'center','spaceBefore' => 0, 'spaceAfter' => 0);

	$sectionStyle = array(
               'marginLeft' => 400, 
               'marginRight' => 400,
               'marginTop' => 400,
               'marginBottom' => 400
    );
	$section = $phpWord->addSection($sectionStyle);

	foreach ($sorts as $brew => $elems) {
		$section->addText($brew, $fontStyleBrew,$parStyleBrew);

		foreach ($sorts[$brew] as $sort) {
			$sort = str_replace ("➖", "➖/", $sort);
			$sort = str_replace ("✖", "", $sort);
			$sort = str_replace ("&", " ", $sort);
			$sort = str_replace ("️", "", $sort);
			//нельзя двоеточия

			$textrun = $section->createTextRun($parStyle);
			$arr = explode("➖", $sort);

		 	$textrun->addText($arr[0], $fontStyle);
		 	$textrun->addText($arr[1], $fontStyle2);
		}

		$section->addTextBreak(1, array('size'=>10), array('align'=>'center', 'spaceBefore' => 0, 'spaceAfter' => 0));
	}

	header("Content-type:application/vnd.ms-word");
	header("Content-Disposition:attachment;filename=menu.docx");
	header('Cache-Control:max-age=0');
	$objWriter->save('php://output');

	$objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');  
	$objWriter->save('http://beetlecraft.ru/menu.docx');
?>