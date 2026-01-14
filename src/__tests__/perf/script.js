import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import exec from "k6/execution";

const users = new SharedArray("users", function () {
  return JSON.parse(open("../../scripts/k6-users.json")).slice(0, 5);
});

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "1m", target: 5 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = "http://localhost:3000";
const ROOM_ID = "1";

function getUserForVU() {
  return users[(exec.vu.idInTest - 1) % users.length];
}

function generateUniquePayload() {
  const vuId = exec.vu.idInTest;
  const iteration = exec.scenario.iterationInTest;

  const baseTime = new Date();
  baseTime.setDate(baseTime.getDate() + 1);
  baseTime.setHours(10 + vuId, 0, 0, 0);

  const slotTime = new Date(baseTime.getTime() + iteration * 30 * 60 * 1000);

  const date = slotTime.toISOString().split("T")[0];
  const time = slotTime.toTimeString().slice(0, 5);

  return { date, time, duration: 30 };
}

function login(user) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password || "Password123!",
    }),
    {
      headers: { "Content-Type": "application/json" },
      redirects: 0,
    }
  );

  const success = check(res, {
    "login status 200": (r) => r.status === 200,
    "has set-cookie": (r) => r.headers["Set-Cookie"] !== undefined,
  });

  if (!success) {
    console.error(
      `Login failed for ${user.email}: Status ${res.status} Body: ${res.body}`
    );
  }
}

let isLoggedIn = false;

export default function () {
  const user = getUserForVU();

  if (!isLoggedIn) {
    login(user);
    isLoggedIn = true;
    sleep(0.5);
  }

  const params = {
    redirects: 0,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const getRes = http.get(
    `${BASE_URL}/api/rooms/reservations/${ROOM_ID}`,
    params
  );

  check(getRes, {
    "GET status 200": (r) => r.status === 200,
    "GET is JSON": (r) =>
      r.headers["Content-Type"] &&
      r.headers["Content-Type"].includes("application/json"),
  });

  if (getRes.status === 307 || getRes.status === 401) {
    console.warn(`GET Auth Error: ${getRes.status} on VU ${exec.vu.idInTest}`);
  }

  const payload = generateUniquePayload();

  const postRes = http.post(
    `${BASE_URL}/api/rooms/reservations/${ROOM_ID}`,
    JSON.stringify(payload),
    params
  );

  check(postRes, {
    "POST status 201": (r) => r.status === 201,
  });

  if (postRes.status !== 201) {
    console.log(`POST Fail: ${postRes.status} - ${postRes.body}`);
  }

  sleep(Math.random() * 2 + 1);
}
