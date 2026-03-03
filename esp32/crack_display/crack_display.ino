/*
  crack_display.ino
  ------------------
  Fetches the latest annotated crack-detection JPEG from the backend
  and displays it on a 480x320 TFT display.

  Endpoint:  GET http://192.168.68.106:8000/api/frame
  Response:  image/jpeg  (480x320 by default)

  Required libraries (install via Arduino Library Manager):
    - TFT_eSPI       by Bodmer
    - TJpg_Decoder   by Bodmer

  Before compiling, paste the block below into:
    Arduino/libraries/TFT_eSPI/User_Setup.h
  (replace everything in that file with this)

  ── User_Setup.h ────────────────────────────────────────────────
  #define ILI9488_DRIVER       // 480x320 — try ST7796_DRIVER if blank/wrong

  #define TFT_WIDTH  480
  #define TFT_HEIGHT 320

  #define TFT_CS    5    // CS   → G5
  #define TFT_RST   4    // RESET→ G4
  #define TFT_DC    2    // DC/RS→ G2
  #define TFT_MOSI  23   // SDI  → G23
  #define TFT_SCLK  18   // SCK  → G18
  #define TFT_MISO  19   // SDO  → G19  (optional)

  #define LOAD_GLCD
  #define LOAD_FONT2
  #define LOAD_FONT4

  #define SPI_FREQUENCY  27000000
  ────────────────────────────────────────────────────────────────
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <TFT_eSPI.h>
#include <TJpg_Decoder.h>

// ---------------------------------------------------------------------------
// Config — edit these
// ---------------------------------------------------------------------------
const char *WIFI_SSID = "Sebastian";
const char *WIFI_PASSWORD = "blackninjas69";
const char *FRAME_URL = "http://172.20.10.2:8000/api/frame";

// How often to fetch a new frame (milliseconds)
const unsigned long FETCH_INTERVAL_MS = 150; // ~6-7 fps

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------
TFT_eSPI tft;

// TJpg_Decoder callback — called for each MCU block during JPEG decode.
// Draws directly to the TFT.
bool tft_output(int16_t x, int16_t y, uint16_t w, uint16_t h, uint16_t *bitmap)
{
    if (y >= tft.height())
        return false;
    tft.pushImage(x, y, w, h, bitmap);
    return true;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
void setup()
{
    Serial.begin(115200);

    // Init display
    tft.init();
    tft.setRotation(1); // landscape — adjust (0-3) if image is rotated
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(1);

    // TJpg_Decoder setup
    TJpgDec.setJpgScale(1);     // 1 = full size
    TJpgDec.setSwapBytes(true); // needed for TFT_eSPI on ESP32
    TJpgDec.setCallback(tft_output);

    // Connect to WiFi
    tft.setCursor(4, 4);
    tft.print("Connecting to WiFi...");
    Serial.printf("Connecting to %s\n", WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.println(WiFi.status());
    }

    Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
    tft.fillScreen(TFT_BLACK);
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
void loop()
{
    static unsigned long last_fetch = 0;
    unsigned long now = millis();

    if (now - last_fetch < FETCH_INTERVAL_MS)
        return;
    last_fetch = now;

    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi disconnected, reconnecting...");
        WiFi.reconnect();
        return;
    }

    HTTPClient http;
    http.begin(FRAME_URL);
    http.setTimeout(3000);

    int code = http.GET();

    if (code == 200)
    {
        int len = http.getSize();

        if (len > 0 && len < 200000)
        { // sanity cap at ~200 KB
            uint8_t *buf = (uint8_t *)malloc(len);
            if (buf)
            {
                http.getStream().readBytes(buf, len);
                TJpgDec.drawJpg(0, 0, buf, len);
                free(buf);
            }
            else
            {
                Serial.println("malloc failed");
            }
        }
        else if (len <= 0)
        {
            // Unknown content-length — read into a growable buffer
            WiFiClient *stream = http.getStreamPtr();
            std::vector<uint8_t> buf;
            buf.reserve(50000);
            while (http.connected() && stream->available())
            {
                buf.push_back(stream->read());
            }
            if (!buf.empty())
            {
                TJpgDec.drawJpg(0, 0, buf.data(), buf.size());
            }
        }
    }
    else if (code == 204)
    {
        // Detection not started yet — show a message
        tft.fillScreen(TFT_BLACK);
        tft.setCursor(4, 4);
        tft.print("Waiting for detection...");
        Serial.println("No frame yet (204)");
    }
    else
    {
        Serial.printf("HTTP error: %d\n", code);
    }

    http.end();
}
