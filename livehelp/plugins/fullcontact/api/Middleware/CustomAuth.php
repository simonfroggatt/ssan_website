<?php
namespace stardevelop\chatstack;

class CustomAuth extends \Slim\Middleware
{

	protected $session;

	/*
	public function __construct($session)
	{
		$this->session = $session;
	}
	*/

	protected function isAuthenticated($auth) {
		if (!empty($auth)) {
			$this->session = $auth;
		}

		// Validate Encrypted Operator Session
		if (isset($this->session)) {

			// Authentication Key
			$authkey = Setting::where_id_is('AuthKey')->find_one();

			if ($authkey !== false) {
				// Decode Session
				$this->session = base64_decode($this->session);
				$aes = new AES256($authkey->value);

				$size = strlen($aes->iv);
				$iv = substr($this->session, 0, $size);
				$verify = substr($this->session, $size, 40);
				$ciphertext = substr($this->session, 40 + $size);

				$decrypted = $aes->decrypt($ciphertext, $iv);

				if (sha1($decrypted) == $verify) {
					$this->session = json_decode($decrypted, true);

					$id = (int)$this->session['id'];

					$operator = Operator::where_id_is($id)->find_one();
					if ($operator !== false) {
						return true;
					}
				}
			}
		}
		return false;
	}

	public function call()
	{

		$this->app->hook('slim.before.dispatch', array($this, 'onBeforeDispatch'));
		$this->next->call();

	}

	public function onBeforeDispatch()
	{
		$req = $this->app->request();
		$auth = $req->headers('Authentication');

		if (!$this->isAuthenticated($auth)) {
			$res = $this->app->response();
			$res->status(403);
			$this->app->stop();
			return;
		}
	}

}

?>
