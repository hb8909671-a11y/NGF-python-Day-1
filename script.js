/* StayEasy demo app - bookings are stored only in this browser. */
const STORAGE_KEY = "stayeasy_demo_bookings_v1";

const HOTEL_DATA = [
  {id:"H01",name:"The Grand Orchid",city:"Gurugram",state:"Haryana",price:3200,description:"Contemporary city stay close to business and shopping districts.",amenities:["Wi-Fi","Restaurant","Parking"],icon:"🏙️"},
  {id:"H02",name:"Aravali Comfort Inn",city:"Faridabad",state:"Haryana",price:2100,description:"Comfortable sample stay with easy access to the city.",amenities:["Wi-Fi","Breakfast","Parking"],icon:"🌳"},
  {id:"H03",name:"Capital View Residency",city:"Delhi",state:"Delhi",price:3800,description:"A convenient demo listing for exploring the capital.",amenities:["Wi-Fi","Restaurant","Room service"],icon:"🏛️"},
  {id:"H04",name:"Lotus Park Suites",city:"Noida",state:"Uttar Pradesh",price:2900,description:"Modern sample accommodation near commercial areas.",amenities:["Wi-Fi","Gym","Parking"],icon:"🌆"},
  {id:"H05",name:"Heritage Haveli Stay",city:"Jaipur",state:"Rajasthan",price:2700,description:"A colourful heritage-inspired stay in the Pink City.",amenities:["Courtyard","Dining","Wi-Fi"],icon:"🕌"},
  {id:"H06",name:"Lake Breeze Retreat",city:"Udaipur",state:"Rajasthan",price:4200,description:"Relaxed demo retreat inspired by lakeside hospitality.",amenities:["Lake view","Pool","Restaurant"],icon:"🛶"},
  {id:"H07",name:"Golden Sands Hotel",city:"Agra",state:"Uttar Pradesh",price:2500,description:"A simple city hotel listing for your travel demo.",amenities:["Wi-Fi","Breakfast","Parking"],icon:"🏰"},
  {id:"H08",name:"Riverfront Residency",city:"Chandigarh",state:"Chandigarh",price:3100,description:"Neat and modern sample stay in the planned city.",amenities:["Wi-Fi","Garden","Restaurant"],icon:"🌿"},
  {id:"H09",name:"The Mall Road Inn",city:"Shimla",state:"Himachal Pradesh",price:3600,description:"Cosy hill-station style stay for a mountain break.",amenities:["Mountain view","Heating","Dining"],icon:"🏔️"},
  {id:"H10",name:"Ganga View Hotel",city:"Haridwar",state:"Uttarakhand",price:2300,description:"A peaceful demo option for a short spiritual visit.",amenities:["Wi-Fi","Dining","Parking"],icon:"🛕"},
  {id:"H11",name:"Tech Park Suites",city:"Bengaluru",state:"Karnataka",price:3400,description:"Business-friendly sample stay for work and city trips.",amenities:["Wi-Fi","Workspace","Gym"],icon:"💻"},
  {id:"H12",name:"Marine Bay Residency",city:"Mumbai",state:"Maharashtra",price:4500,description:"Urban sample stay inspired by the city by the sea.",amenities:["Wi-Fi","Restaurant","City view"],icon:"🌊"}
];

let selectedHotel = null;
let selectedRoomType = "Single";
let selectedPrice = 0;

const $ = id => document.getElementById(id);
const roomsEl = $("rooms");
const cityFilter = $("cityFilter");
const searchInput = $("searchHotel");
const roomTypeFilter = $("roomType");
const modal = $("bookingModal");
const form = $("bookingForm");
const checkinInput = $("checkin");
const nightsInput = $("nights");

function readBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Could not read saved bookings:", error);
    return [];
  }
}
function writeBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}
function money(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}
function roomPrices(hotel) {
  return {Single:hotel.price, Double:Math.round(hotel.price*1.28), Deluxe:Math.round(hotel.price*1.65)};
}

[...new Set(HOTEL_DATA.map(h => h.city))].sort().forEach(city => {
  const option = document.createElement("option");
  option.value = city;
  option.textContent = city;
  cityFilter.append(option);
});

function renderHotels() {
  const query = searchInput.value.trim().toLowerCase();
  const city = cityFilter.value;
  const type = roomTypeFilter.value;
  const filtered = HOTEL_DATA.filter(h =>
    (city === "all" || h.city === city) &&
    (`${h.name} ${h.city} ${h.state} ${h.description}`.toLowerCase().includes(query))
  );
  roomsEl.replaceChildren();
  let optionCount = 0;

  filtered.forEach(hotel => {
    const prices = roomPrices(hotel);
    Object.entries(prices).filter(([typeName]) => type === "all" || typeName === type).forEach(([typeName, price]) => {
      optionCount++;
      const card = document.createElement("article");
      card.className = "hotel-card";
      const art = document.createElement("div");
      art.className = "hotel-art";
      art.textContent = hotel.icon;
      const content = document.createElement("div");
      content.className = "hotel-content";
      const name = document.createElement("h3");
      name.textContent = hotel.name;
      const location = document.createElement("p");
      location.className = "hotel-location";
      location.textContent = `📍 ${hotel.city}, ${hotel.state}`;
      const desc = document.createElement("p");
      desc.className = "hotel-desc";
      desc.textContent = hotel.description;
      const amenities = document.createElement("p");
      amenities.className = "amenities";
      amenities.textContent = hotel.amenities.join(" · ");
      const chips = document.createElement("div");
      chips.className = "room-options";
      const chip = document.createElement("span");
      chip.className = "room-chip";
      chip.textContent = `${typeName} room`;
      chips.append(chip);
      const bottom = document.createElement("div");
      bottom.className = "hotel-bottom";
      const priceEl = document.createElement("div");
      priceEl.className = "price";
      priceEl.innerHTML = `${money(price)} <small>/ night</small>`;
      const button = document.createElement("button");
      button.className = "book-btn";
      button.textContent = "Book this room";
      button.addEventListener("click", () => openBooking(hotel, typeName, price));
      bottom.append(priceEl, button);
      content.append(name, location, desc, amenities, chips, bottom);
      card.append(art, content);
      roomsEl.append(card);
    });
  });
  $("hotelCount").textContent = `${optionCount} room options · ${new Set(filtered.map(h => h.city)).size} cities`;
  if (!optionCount) {
    const empty = document.createElement("div");
    empty.className = "empty-results";
    empty.textContent = "No matching stays found. Try another search or city.";
    roomsEl.append(empty);
  }
}

function openBooking(hotel, type, price) {
  selectedHotel = hotel;
  selectedRoomType = type;
  selectedPrice = price;
  $("selectedRoom").textContent = `${hotel.name} · ${hotel.city} · ${type} room · ${money(price)} per night`;
  $("bookingMessage").textContent = "";
  form.reset();
  nightsInput.value = 1;
  checkinInput.min = new Date().toISOString().slice(0,10);
  updateTotal();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  $("name").focus();
}
function closeBooking() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
function updateTotal() {
  const nights = Math.max(1, Number(nightsInput.value) || 1);
  $("totalPrice").textContent = money(selectedPrice * nights);
}
function renderMyBookings() {
  const bookings = readBookings();
  const result = $("bookingResult");
  result.replaceChildren();
  $("bookingCount").textContent = `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`;
  if (!bookings.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<span>🧳</span><h3>No bookings yet</h3><p>Your demo booking requests will appear here.</p>";
    result.append(empty);
    return;
  }
  bookings.slice().reverse().forEach(booking => {
    const card = document.createElement("article");
    card.className = "booking-card";
    const info = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = `${booking.hotelName} — ${booking.city}`;
    const meta = document.createElement("div");
    meta.className = "booking-meta";
    meta.textContent = `ID: ${booking.id} · ${booking.roomType} room · Check-in: ${booking.checkIn} · ${booking.nights} night(s) · ${money(booking.total)}`;
    const customer = document.createElement("div");
    customer.className = "booking-meta";
    customer.textContent = `${booking.customerName} · ${booking.phone}`;
    info.append(title, meta, customer);
    const actions = document.createElement("div");
    actions.className = "booking-actions";
    const status = document.createElement("span");
    status.className = "status" + (booking.status === "Cancelled" ? " cancelled" : "");
    status.textContent = booking.status;
    actions.append(status);
    if (booking.status !== "Cancelled") {
      const cancel = document.createElement("button");
      cancel.className = "cancel-btn";
      cancel.textContent = "Cancel request";
      cancel.addEventListener("click", () => cancelBooking(booking.id));
      actions.append(cancel);
    }
    card.append(info, actions);
    result.append(card);
  });
}
function cancelBooking(id) {
  if (!confirm("Cancel this demo booking request?")) return;
  const bookings = readBookings().map(b => b.id === id ? {...b, status:"Cancelled"} : b);
  writeBookings(bookings);
  renderMyBookings();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const phone = $("phone").value.trim();
  const checkin = checkinInput.value;
  const nights = Number(nightsInput.value);
  const message = $("bookingMessage");
  if (!selectedHotel || !name || !email || !/^[0-9]{10}$/.test(phone) ||
      !checkin || checkin < checkinInput.min || !Number.isInteger(nights) || nights < 1 || nights > 30) {
    message.textContent = "Please enter valid details. Mobile number must contain 10 digits.";
    return;
  }
  const booking = {
    id: "SE" + Date.now().toString().slice(-9),
    hotelId: selectedHotel.id,
    hotelName: selectedHotel.name,
    city: selectedHotel.city,
    state: selectedHotel.state,
    customerName: name,
    email,
    phone,
    roomType: selectedRoomType,
    pricePerNight: selectedPrice,
    checkIn: checkin,
    nights,
    total: selectedPrice * nights,
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  try {
    const bookings = readBookings();
    bookings.push(booking);
    writeBookings(bookings);
    closeBooking();
    renderMyBookings();
    $("my-bookings").scrollIntoView({behavior:"smooth"});
    alert(`Demo booking saved! Your booking ID is ${booking.id}`);
  } catch (error) {
    console.error(error);
    message.textContent = "Could not save. Your browser storage may be unavailable or full.";
  }
});

$("searchBtn").addEventListener("click", renderHotels);
searchInput.addEventListener("input", renderHotels);
cityFilter.addEventListener("change", renderHotels);
roomTypeFilter.addEventListener("change", renderHotels);
nightsInput.addEventListener("input", updateTotal);
$("closeBooking").addEventListener("click", closeBooking);
modal.addEventListener("click", event => {
  if (event.target.dataset.close === "true") closeBooking();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeBooking();
});

renderHotels();
renderMyBookings();
