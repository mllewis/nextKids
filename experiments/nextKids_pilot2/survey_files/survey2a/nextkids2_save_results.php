<?php
	 $result_string = $_POST['postresult_string'];
	 file_put_contents('nextKids2_parentsurvey.csv', $result_string, FILE_APPEND);
?>
