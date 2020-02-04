<?php
class ModelAccountSubscribe extends Model {
		public function checkValid($emailtoken, $type) {
					$sql = "SELECT customer_id FROM ". DB_PREFIX . "customer WHERE subemailtoken = '" . $emailtoken. "'";
					$valid_sql = $this->db->query($sql);

					return ($valid_sql->num_rows == 1);
		}


	public function updateSubs($emailtoken, $type) {
		$allow = 0;
		switch(strtoupper($type))
		{
			case 'Y': $allow = 1; break;
			default: $allow = 0; break;
		}
			$sql = "UPDATE ". DB_PREFIX . "customer SET newsletter = " . $allow . ", consentchangedate = NOW() WHERE subemailtoken = '" . $emailtoken. "'";
			$blsql = $this->db->query($sql);

			return $blsql->num_rows > 0;
	}

}
