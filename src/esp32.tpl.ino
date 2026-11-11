// ESP32-S3 — کنترل ۵ رله + دما/رطوبت DHT11 + راه‌اندازی با هات‌اسپات (Captive Portal) + اتصال به Cloudflare Worker
// Arduino IDE: Board = "ESP32S3 Dev Module" ، USB CDC On Boot = Enabled (برای Serial Monitor)
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>

// ================= تنظیمات کارخانه (قبل از فلش ویرایش شود) =================
const char* DEFAULT_SERVER = "https://iot.example.com";  // دامنه Worker، بدون / در انتها
const char* AP_PREFIX      = "Nova-Setup-";              // نام هات‌اسپات = AP_PREFIX + ۴ حرف آخر شناسه
const char* AP_PASS        = "12345678";                 // رمز هات‌اسپات (حداقل ۸ کاراکتر)
// پایه‌های امن ESP32-S3 (پایه‌های 0,3,45,46 استرپینگ؛ 19,20 یو‌اس‌بی؛ 26..37 فلش/PSRAM استفاده نشده‌اند)
#define DHT_PIN   4
#define RESET_PIN 0                                       // دکمه BOOT: ۳ ثانیه نگه دارید = پاک کردن وای‌فای
const uint8_t RELAY_PINS[5] = {5, 6, 7, 15, 16};
const bool RELAY_ACTIVE_LOW = true;                       // اگر رله‌ها برعکس بودند false کنید
const unsigned long POLL_MS  = 5000;    // فاصله ارتباط با سرور
const unsigned long LOST_MS  = 40000;   // قطعی وای‌فای بیشتر از این = ساخت هات‌اسپات
const unsigned long RETRY_MS = 60000;   // تلاش دوباره برای وای‌فای ذخیره‌شده وقتی هات‌اسپات فعال است
// ==========================================================================

const char PORTAL_HTML[] PROGMEM = R"=====(__PORTAL__)=====";

Preferences prefs;
WebServer web(80);
DNSServer dns;
DHT dht(DHT_PIN, DHT11);

String ssid, pass, server, devId, secret, claim, netsJson = "[]";
bool portalOn = false;
unsigned long lostSince = 0, lastPoll = 0, lastRetry = 0, tryStart = 0, okSince = 0;

// وضعیت LED داخلی برد: 1=آبی(راه‌اندازی) 2=زرد(در حال اتصال) 3=سبز(آنلاین) 4=قرمز(خطای سرور)
void ledState(uint8_t s) {
  static uint8_t last = 255;
  if (s == last) return;
  last = s;
#ifdef RGB_BUILTIN
  const uint8_t c[5][3] = {{0,0,0},{0,0,40},{40,22,0},{0,18,0},{40,0,0}};
  neopixelWrite(RGB_BUILTIN, c[s][0], c[s][1], c[s][2]);
#endif
}

String randHex(int n) {
  String s;
  while ((int)s.length() < n) { char b[9]; snprintf(b, 9, "%08X", esp_random()); s += b; }
  return s.substring(0, n);
}
String esc(String s) {
  s.replace("&", "&amp;"); s.replace("<", "&lt;"); s.replace(">", "&gt;"); s.replace("\"", "&quot;");
  return s;
}
String jsEsc(const String& s) {
  String o;
  for (size_t i = 0; i < s.length(); i++) {
    unsigned char c = s[i];
    if (c == '\\' || c == '"') { o += '\\'; o += (char)c; }
    else if (c == '<') o += "\\u003c";
    else if (c < 32) o += ' ';
    else o += (char)c;
  }
  return o;
}
void setRelay(int i, bool on) { digitalWrite(RELAY_PINS[i], (on != RELAY_ACTIVE_LOW) ? HIGH : LOW); }

// ---------------- Captive Portal ----------------
void scanNets() {
  int n = WiFi.scanNetworks();
  netsJson = "[";
  for (int i = 0; i < n && i < 20; i++) {
    if (i) netsJson += ",";
    netsJson += "{\"s\":\"" + jsEsc(WiFi.SSID(i)) + "\",\"r\":" + String(WiFi.RSSI(i)) +
                ",\"l\":" + String(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? 0 : 1) + "}";
  }
  netsJson += "]";
  WiFi.scanDelete();
}

void handleRoot() {
  if (web.hasArg("rescan")) scanNets();
  String h = FPSTR(PORTAL_HTML);
  h.replace("@@ID@@", devId);
  h.replace("@@CLAIM@@", claim);
  h.replace("@@SSID@@", jsEsc(ssid));
  h.replace("@@SERVER@@", esc(server));
  h.replace("@@NETS@@", netsJson);
  web.sendHeader("Cache-Control", "no-store");
  web.send(200, "text/html; charset=utf-8", h);
}

void handleSave() {
  String s = web.arg("s"), p = web.arg("p"), u = web.arg("u");
  s.trim(); u.trim();
  if (s.length() == 0) { web.send(400, "text/plain", "bad"); return; }
  while (u.endsWith("/")) u.remove(u.length() - 1);
  ssid = s; pass = p; if (u.length()) server = u;
  prefs.putString("ssid", ssid); prefs.putString("pass", pass); prefs.putString("server", server);
  web.send(200, "text/plain", "ok");
  delay(300);
  WiFi.disconnect();
  WiFi.begin(ssid.c_str(), pass.c_str());
  tryStart = millis(); okSince = 0; ledState(2);
}

void handleSt() {
  if (WiFi.status() == WL_CONNECTED) web.send(200, "text/plain", "ok");
  else if (millis() - tryStart > 20000) web.send(200, "text/plain", "fail");
  else web.send(200, "text/plain", "wait");
}

void redirectHome() {   // برای باز شدن خودکار صفحه در گوشی
  web.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/", true);
  web.send(302, "text/plain", "");
}

void startPortal() {
  if (portalOn) return;
  Serial.println("Starting setup hotspot");
  WiFi.mode(WIFI_AP_STA);
  WiFi.disconnect();
  scanNets();
  String name = String(AP_PREFIX) + devId.substring(8);
  WiFi.softAP(name.c_str(), AP_PASS);
  delay(300);
  dns.start(53, "*", WiFi.softAPIP());
  web.begin();
  portalOn = true; okSince = 0; lastRetry = millis();
  ledState(1);
}

void stopPortal() {
  Serial.println("Stopping hotspot");
  dns.stop(); web.stop();
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
  portalOn = false;
}

// ---------------- ارتباط با سرور ----------------
void poll() {
  float h = dht.readHumidity(), t = dht.readTemperature();
  String body = "id=" + devId + "&secret=" + secret + "&claim=" + claim;
  if (!isnan(h) && !isnan(t)) body += "&t=" + String(t, 1) + "&h=" + String(h, 1);
  String url = server + "/api/device";

  WiFiClientSecure sc; WiFiClient pc; HTTPClient http;
  http.setTimeout(8000);
  bool ok;
  if (url.startsWith("https")) { sc.setInsecure(); ok = http.begin(sc, url); }
  else ok = http.begin(pc, url);
  if (!ok) { ledState(4); return; }
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int code = http.POST(body);
  if (code == 200) {
    String r = http.getString(); r.trim();
    if (r.length() >= 5) for (int i = 0; i < 5; i++) setRelay(i, r[i] == '1');
    Serial.printf("T=%.1f H=%.1f relays=%s\n", t, h, r.c_str());
    ledState(3);
  } else {
    Serial.printf("server error %d\n", code);   // رله‌ها آخرین وضعیت را نگه می‌دارند
    ledState(4);
  }
  http.end();
}

void checkButton() {
  static unsigned long since = 0;
  if (digitalRead(RESET_PIN) == LOW) {
    if (!since) since = millis();
    else if (millis() - since > 3000) {
      prefs.remove("ssid"); prefs.remove("pass"); ssid = ""; pass = "";
      WiFi.disconnect();
      startPortal();
      while (digitalRead(RESET_PIN) == LOW) delay(50);
      since = 0;
    }
  } else since = 0;
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 5; i++) { digitalWrite(RELAY_PINS[i], RELAY_ACTIVE_LOW ? HIGH : LOW); pinMode(RELAY_PINS[i], OUTPUT); }
  pinMode(RESET_PIN, INPUT_PULLUP);
  dht.begin();

  char b[13]; snprintf(b, 13, "%012llX", (unsigned long long)ESP.getEfuseMac()); devId = b;
  prefs.begin("cfg", false);
  ssid = prefs.getString("ssid", ""); pass = prefs.getString("pass", "");
  server = prefs.getString("server", DEFAULT_SERVER);
  secret = prefs.getString("secret", ""); claim = prefs.getString("claim", "");
  if (secret.length() != 32 || claim.length() != 8) {   // اولین روشن شدن: ساخت کلید یکتا
    secret = randHex(32); claim = randHex(8);
    prefs.putString("secret", secret); prefs.putString("claim", claim);
  }
  Serial.println("ID: " + devId + "  CLAIM: " + claim);

  web.on("/", handleRoot);
  web.on("/save", HTTP_POST, handleSave);
  web.on("/st", handleSt);
  web.onNotFound(redirectHome);

  WiFi.persistent(false);
  WiFi.setAutoReconnect(true);
  WiFi.mode(WIFI_STA);
  if (ssid.length()) { WiFi.begin(ssid.c_str(), pass.c_str()); ledState(2); }
}

void loop() {
  checkButton();
  if (portalOn) { dns.processNextRequest(); web.handleClient(); }

  if (WiFi.status() == WL_CONNECTED) {
    lostSince = 0;
    if (portalOn) {                       // چند ثانیه صبر تا گوشی پیام «متصل شد» را ببیند
      if (!okSince) okSince = millis();
      else if (millis() - okSince > 8000) stopPortal();
    }
    if (millis() - lastPoll >= POLL_MS) { lastPoll = millis(); poll(); }
  } else {
    okSince = 0;
    if (!lostSince) lostSince = millis();
    if (!portalOn && (ssid.length() == 0 || millis() - lostSince > LOST_MS)) startPortal();
    if (!portalOn) ledState(2);
    if (portalOn && ssid.length() && WiFi.softAPgetStationNum() == 0 && millis() - lastRetry > RETRY_MS) {
      lastRetry = millis(); tryStart = millis();
      WiFi.begin(ssid.c_str(), pass.c_str());
    }
  }
}
