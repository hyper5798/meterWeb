module.exports = {
  cookieSecret: "mydemo",
  co:"gemteks",
  dbhost: "localhost",
  dbport: 27017,
  dbpath: "mongodb://localhost/sakura",
  name: "daniel_chen@gemteks.com",
  pw: "1234567890",
  api_key : "cvr-8911839605",
  api_secret : "ejuu8wzuyn",
  s5_server :'https://s5.securepilot.com/',
  // service_server :'https://service.securepilot.com/',
  service_server :'https://serm001-oem.securepilot.com/',
  query:"v1/device/data_query",
  login:"v1/device/login",
  get_event_list:"cvr/v1/user/get_event_list",
  get_device_list:"v1/user/get_device_list",
  //For agri iot api
  api_server: "http://161.202.32.59:8000/",
  api_login: "user/v1/login/gemtek",
  api_get_device_list:"device/v1/sensor/3",
  api_get_map_list:"map/v1/",//For old version
  // api_get_map_list:"device/v1/maps",//For new version
  api_get_event_list: "device/v1/event",
  api_name: "sysAdmin",
  api_pw: "gemtek123",
  mqttName: 'gemtek',
  mqttPassword: "gemtek12345",
  mqttHost: "161.202.32.59",
  mqttPort: "1883",
  mytopic: "GIOT-GW/UL/+",
  //Zone
  timezone: 'Asia/Taipei'
};