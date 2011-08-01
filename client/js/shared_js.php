<?php
  require("../settings.php");
  header("Content-Type: text/plain");
?>

smeagol = { 
  settings: {
    proxyURL: "<?php echo $settings['proxyURL'] ?>",
		baseEndpointURL: "<?php echo $settings['baseEndpointURL'] ?>",
		discovererURL: "<?php echo $settings['discovererURL'] ?>",
		finderURL: "<?php echo $settings['finderURL'] ?>"
  },
  
  clientId: "<?php echo $_COOKIE['SmeagolClientId']; ?>",
  packetId: "9999"
};
