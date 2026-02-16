<?php
	// Файлы phpmailer
	require 'class.phpmailer.php';
	require 'class.smtp.php';
	// Переменные
	$name = $_POST['name'];
	$phone = $_POST['phone'];
	$vk = $_POST['vk'];
	$resultText = $_POST['resultText'];

	// Настройки
	$mail = new PHPMailer;
	$mail->CharSet = 'UTF-8';
	$mail->isSMTP(); 
	$mail->Host = 'smtp.yandex.ru'; 
	$mail->SMTPAuth = true; 
	$mail->Username = 'albytova'; // Ваш логин в Яндексе. Именно логин, без @yandex.ru
	$mail->Password = 'xtvgbjyfn'; // Ваш пароль
	$mail->SMTPSecure = 'ssl'; 
	$mail->Port = 465;
	$mail->setFrom('albytova@yandex.ru'); // Ваш Email
	$mail->addAddress('albytova.elena@mail.ru'); // Email получателя
	$mail->addAddress('beetlecraft@mail.ru'); // Еще один email, если нужно
	 
	// Письмо
	$mail->isHTML(true); 
	$mail->Subject = "Новогодняя Посылка"; // Заголовок письма
	$mail->Body = "Имя $name . Телефон $phone . ВКонтакте $phone <br><hr> $resultText"; // Текст письма
	// Результат
	if(!$mail->send()) {
	 echo "Message could not be sent.";
	 echo "Mailer Error: " . $mail->ErrorInfo;
	} else {

		// if (isset($_SERVER["HTTP_REFERER"])) {
		//     header("Location: " . $_SERVER["HTTP_REFERER"]+'/success.html');
		// }

		header("Location: " . 'success.html');
			 	
	}
?>