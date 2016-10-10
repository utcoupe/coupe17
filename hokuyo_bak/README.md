Setup Raspi
===

### To do:

- changer le fichier `/etc/network/interfaces` par :
    ```
    allow-hotplug wlan0
    iface wlan0 inet dhcp
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
    iface default inet dhcp
    ```
- remplir le fichier `/etc/wpa_supplicant.conf`:
    ```conf
    ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
    update_config=1
    
    network={
    ssid="utcoupe"
    psk="54856868"
    
    # Protocol type can be: RSN (for WP2) and WPA (for WPA1)
    proto=RSN
    
    # Key management type can be: WPA-PSK or WPA-EAP (Pre-Shared or Enterprise)
    key_mgmt=WPA-PSK
    
    # Pairwise can be CCMP or TKIP (for WPA2 or WPA1)
    pairwise=CCMP
    
    #Authorization option should be OPEN for both WPA1/WPA2 (in less commonly used are SHARED and LEAP)
    auth_alg=OPEN
    }
    ```
- se connecter à internet
- installer `nodejs` genre comme [là](http://weworkweplay.com/play/raspberry-pi-nodejs/) (la version sur les dépôts Raspbian n'est pas à jour)
- installer :
    ```sh
    install nodejs-legacy libsdl1.2 libsdl1.2-dev cmake
    ```
- installer la [lib URG](https://github.com/utcoupe/coupe15/blob/master/hokuyo/urg-0.8.18.zip) pour les Hokuyos (voir [l'aide](https://github.com/utcoupe/coupe15/blob/master/hokuyo/urg_INSTALLATION))
- cloner le répo
- mettre la date
```
date --set="2015-05-07 02:30:00"
```
- Faire :
```
npm config set registry "http://registry.npmjs.org/"
```
- faire un npm install
- cmake et make le progamme de l'hokuyo
