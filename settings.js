module.exports = {
  cookieSecret: "mydemo",
  co:"gemteks",
  //For meter iot api
  // api_server: "http://161.202.32.59:8000/",
  api_server: "http://localhost:8000/",
  api_login: "user/v1/login/gemtek",
  api_get_device_list:"device/v1/sensor",
  api_device: "device/v1/device",
  // api_get_map_list:"map/v1/",//For old version
  api_get_map_list:"device/v1/maps",//For new version
  api_get_event_list: "device/v1/event",
  api_users: "user/v1/users",
  api_users_register: "user/v1/register/gemtek",
  api_zones: "device/v1/zones",
  mqttName: 'gemtek',
  mqttPassword: "gemtek12345",
  mqttHost: "localhost",
  mqttPort: "1883",
  mytopic: "GIOT-GW/UL/+",
  //Zone
  timezone: 'Asia/Taipei'
};