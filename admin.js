/* Admin dashboard shares Local Storage with index.html in the same browser. */
const STORAGE_KEY = "stayeasy_demo_bookings_v1";
const $ = id => document.getElementById(id);
function readBookings() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}
function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}
function makeCell(text, className) {
  const td = document.createElement("td");
  if (className) td.className = className;
  td.textContent = text;
  return td;
}
function renderDashboard() {
  const bookings = readBookings();
  const pending = bookings.filter(b => b.status === "Pending").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;
  $("totalBookings").textContent = bookings.length;
  $("pendingBookings").textContent = pending;
  $("confirmedBookings").textContent = confirmed;
  $("cancelledBookings").textContent = cancelled;

  const body = $("adminBookings");
  body.replaceChildren();
  $("adminEmpty").style.display = bookings.length ? "none" : "block";

  bookings.slice().reverse().forEach(booking => {
    const tr = document.createElement("tr");
    tr.append(makeCell(booking.id));
    const customer = document.createElement("td");
    customer.className = "customer-cell";
    const customerName = document.createElement("strong");
    customerName.textContent = booking.customerName;
    const email = document.createElement("span");
    email.className = "subtext";
    email.textContent = booking.email;
    customer.append(customerName, email);
    tr.append(customer);

    const hotel = document.createElement("td");
    hotel.className = "hotel-cell";
    const hotelName = document.createElement("strong");
    hotelName.textContent = booking.hotelName;
    const city = document.createElement("span");
    city.className = "subtext";
    city.textContent = booking.city;
    hotel.append(hotelName, city);
    tr.append(hotel);

    tr.append(makeCell(`${booking.roomType} · ${booking.nights} night(s)\n${booking.checkIn}`));
    tr.append(makeCell(money(booking.total)));
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "admin-status " + booking.status.toLowerCase();
    badge.textContent = booking.status;
    statusCell.append(badge);
    tr.append(statusCell);

    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group";
    if (booking.status === "Pending") {
      const confirm = document.createElement("button");
      confirm.className = "action-btn confirm";
      confirm.textContent = "Confirm";
      confirm.addEventListener("click", () => updateStatus(booking.id, "Confirmed"));
      group.append(confirm);
    }
    if (booking.status !== "Cancelled") {
      const cancel = document.createElement("button");
      cancel.className = "action-btn cancel";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => updateStatus(booking.id, "Cancelled"));
      group.append(cancel);
    }
    if (booking.status === "Cancelled") {
      const remove = document.createElement("button");
      remove.className = "action-btn";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => deleteBooking(booking.id));
      group.append(remove);
    }
    actions.append(group);
    tr.append(actions);
    body.append(tr);
  });
}
function updateStatus(id, status) {
  const bookings = readBookings().map(b => b.id === id ? {...b, status} : b);
  saveBookings(bookings);
  renderDashboard();
}
function deleteBooking(id) {
  if (!confirm("Permanently delete this demo booking from this browser?")) return;
  saveBookings(readBookings().filter(b => b.id !== id));
  renderDashboard();
}
function exportCSV() {
  const bookings = readBookings();
  if (!bookings.length) {
    alert("There are no bookings to export yet.");
    return;
  }
  const columns = ["id","customerName","email","phone","hotelName","city","roomType","checkIn","nights","pricePerNight","total","status","createdAt"];
  const quote = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
  const csv = [columns.join(","), ...bookings.map(b => columns.map(key => quote(b[key])).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stayeasy-demo-bookings.csv";
  link.click();
  URL.revokeObjectURL(url);
}
$("refreshBtn").addEventListener("click", renderDashboard);
$("exportBtn").addEventListener("click", exportCSV);
window.addEventListener("storage", renderDashboard);
renderDashboard();
