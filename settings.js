module.exports = {
  cookieSecret: "mydemo",
  co:"gemteks",
  //For meter iot api
  api_server: "",
  api_login: "user/v1/login/gemtek",
  api_get_device_list:"device/v1/sensor",
  // api_get_map_list:"map/v1/",//For old version
  api_get_map_list:"device/v1/maps",//For new version
  api_get_event_list: "device/v1/event",
  api_name: "sysAdmin",
  api_pw: "gemtek123",
  mqttName: 'gemtek',
  mqttPassword: "gemtek12345",
  mqttHost: "localhost",
  mqttPort: "1883",
  mytopic: "GIOT-GW/UL/+",
  //Zone
  timezone: 'Asia/Taipei'
};