import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import exec from "k6/execution";

// Load users from the shared file
const users = new SharedArray("users", function () {
  return JSON.parse(open("../../../scripts/k6-users.json")).slice(0, 5);
});

export const options = {
  stages: [
    { duration: "10s", target: 5 }, // Ramp up
    { duration: "20s", target: 5 }, // Stable
    { duration: "10s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"], // 95% of requests must complete below 1s
    "http_req_failed{status:200}": ["rate==0"],
    "http_req_failed{status:201}": ["rate==0"],
    "group_duration{group:::Login}": ["p(95)<2000"],
  },
};

const BASE_URL = "http://localhost:3000";
const ROOM_ID = "1";

export default function () {
  const user = users[exec.vu.idInTest % users.length];
  let params = {
    headers: {
      "Content-Type": "application/json",
    },
    redirects: 0,
  };

  // 1. Static Asset Check
  group("1. Static Asset", () => {
    // Simulating fetching a public resource (e.g. login page html, or valid public asset)
    const res = http.get(`${BASE_URL}/login`);
    check(res, { "Login Page Loaded": (r) => r.status === 200 });
  });

  // 2. Failed Login (Bad Creds)
  group("2. Failed Login", () => {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: "WrongPassword" }),
      params
    );
    // Expect 400 or 401 depending on app logic, assuming 400/401 failure
    check(res, { "Bad Creds Rejected": (r) => r.status >= 400 });
  });

  // 3. Successful Login
  group("3. Successful Login", () => {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password || "Password123!" }),
      params
    );
    check(res, { "Login Success": (r) => r.status === 200 });
  });

  // 4. Dashboard Load (Protected)
  group("4. Dashboard Load", () => {
    const res = http.get(`${BASE_URL}/dashboard`, params); // Cookies are auto-managed by k6
    check(res, { "Dashboard Loaded": (r) => r.status === 200 });
  });

  // 5. Get Rooms List
  group("5. Get Rooms", () => {
    const res = http.get(`${BASE_URL}/api/rooms`, params);
    check(res, { "Rooms List JSON": (r) => r.status === 200 && r.json().length > 0 });
  });

  // 6. Get Room Details (HTML)
  group("6. Room Detail HTML", () => {
    const res = http.get(`${BASE_URL}/rooms/${ROOM_ID}`, params);
    check(res, { "Room Rendered": (r) => r.status === 200 });
  });

  // 7. Get Reservations API
  group("7. Get Reservations", () => {
    const res = http.get(`${BASE_URL}/api/rooms/reservations/${ROOM_ID}`, params);
    check(res, { "Reservations Fetched": (r) => r.status === 200 });
  });

  // 8. Create Reservation
  group("8. Create Reservation", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    // Simple offset to avoid collision: + VU * hour
    futureDate.setHours(10 + (exec.vu.idInTest % 10), 0, 0, 0);

    const payload = {
      date: futureDate.toISOString().split("T")[0],
      time: futureDate.toTimeString().slice(0, 5),
      duration: 30
    };

    const res = http.post(`${BASE_URL}/api/rooms/reservations/${ROOM_ID}`, JSON.stringify(payload), params);

    // We accept 201 (Success) or 409 (Conflict - acceptable in load test)
    check(res, {
      "Create Status OK": (r) => r.status === 201 || r.status === 409
    });

    // Validating behavior? In a real scenario we'd capture ID if returned.
    // Our API might not return ID in body { success: true }. 
    // So clean up might be hard. We'll skip specific cleanup validation for this basic script
    // or assume scheduled cleanup.
  });

  // 9. Unauthorized Access (Simulate Logout/No Token interaction)
  // K6 jar preserves cookies. We can't easily "logout" without clearing cookie jar or calling logout endpoint.
  group("9. Logout", () => {
    // Assuming headers param still has cookies? 
    // Actually /auth/logout usually clears cookies.
    // We can create a POST request to logout
    // Or simply assume the user finishes session here
    const res = http.post(`${BASE_URL}/api/auth/logout`, null, params);
    check(res, { "Logout Success": (r) => r.status === 200 || r.status === 307 }); // 307 redirect
  });

  // 10. Check Unauthorized after Logout
  group("10. Security Check (Post-Logout)", () => {
    const res = http.get(`${BASE_URL}/dashboard`, params);
    // Should be redirected or 401
    check(res, { "Redirected/Blocked": (r) => r.status === 401 || r.status === 307 || r.url.includes("login") });
  });

  sleep(1);
}
