import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { Attendance } from "./models/Attendance.js";
import { setLastEvent } from "./state.js";
import player from "play-sound";

// Sound player
const play = player({});

let port;
let parser;

function startSerial() {
  try {
    port = new SerialPort(
      {
        path: "COM7",   // Change this if your port is different
        baudRate: 9600,
        autoOpen: false,
      },
      (err) => {
        if (err) {
          console.log("Serial init error:", err.message);
        }
      }
    );

    // Try opening the port
    port.open((err) => {
      if (err) {
        console.log("❌ Could not open COM7:", err.message);
        console.log("🔁 Retrying in 5 seconds...");
        setTimeout(startSerial, 5000);
        return;
      }

      console.log("✅ Serial port opened successfully!");

      parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
      parser.on("data", onSerialData);
    });

    port.on("error", (err) => {
      console.log("❌ Serial Error:", err.message);
      console.log("🔁 Restarting serial connection in 5 seconds...");
      setTimeout(startSerial, 5000);
    });

    port.on("close", () => {
      console.log("⚠️ Serial port CLOSED unexpectedly.");
      console.log("🔁 Reconnecting in 5 seconds...");
      setTimeout(startSerial, 5000);
    });

  } catch (e) {
    console.log("Unhandled Serial Exception:", e.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(startSerial, 5000);
  }
}

let lastUID = "";
let lastName = "";

async function getRecentUids(minutes = 5) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  const uids = await Attendance.distinct("uid", { timestamp: { $gte: since } });
  return new Set(uids);
}

async function onSerialData(data) {
  const text = data.toString().trim();
  console.log("Raw:", text);

  // Read UID line
  if (text.startsWith("RFID Tag UID:")) {
    lastUID = text.replace("RFID Tag UID:", "").trim();
    return;
  }

  // Read Name line
  if (text.startsWith("Name:")) {
    lastName = text.replace("Name:", "").trim();

    try {
      // Build recent list (last 5 minutes) and check membership
      const fiveMinutesMs = 5 * 60 * 1000;
      const recentUids = await getRecentUids(5);

      if (recentUids.has(lastUID)) {
        // Fetch latest for accurate nextAllowedAt
        const latest = await Attendance.findOne({ uid: lastUID }).sort({ timestamp: -1 });
        const nextAllowedAt = latest
          ? new Date(new Date(latest.timestamp).getTime() + fiveMinutesMs).toISOString()
          : null;
        console.log("⏳ Duplicate within 5 minutes →", lastUID, lastName);
        setLastEvent({
          type: "duplicate",
          uid: lastUID,
          name: lastName,
          message: "Your attendance is already marked. Try again after 5 minutes.",
          nextAllowedAt,
        });
      } else {
        const entry = new Attendance({
          uid: lastUID,
          name: lastName,
        });
        await entry.save();
        console.log("✅ Saved →", lastUID, lastName);

        setLastEvent({
          type: "accepted",
          uid: lastUID,
          name: lastName,
          message: "Attendance marked successfully.",
        });

        // 🔊 PLAY SOUND ON RFID SCAN (only on accepted)
        play.play("./beep.mp3", (err) => {
          if (err) console.log("Sound Error:", err);
        });
      }

      // Reset
      lastUID = "";
      lastName = "";

    } catch (err) {
      console.error("❌ DB Save Error:", err);
    }
  }
}

console.log("🔄 Starting serial listener...");
startSerial();

export default {};
