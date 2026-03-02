// ================= Navigation Functions =================
window.showScreen = function(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(screenId).style.display = "flex";
};

window.showEmergency = function() {
    showScreen("emergencyScreen");
    requestLocation();
};

window.showNormal = function() {
    showScreen("normalScreen");
    setDateLimits();
};

window.showPharmacy = function() {
    showScreen("pharmacyScreen");
};

// ================= Emergency Feature =================
let currentLocation = { lat: null, lng: null };
let selectedHospitalIndex = null;

const hospitals = [
    { name: "Roma Multi Specialty Hospital", area: "Kompally", distance: "2.5 km", beds: 8 },
    { name: "MedOne Hospitals", area: "Kompally", distance: "3.1 km", beds: 10 },
    { name: "Russh Super Specialty Hospital", area: "Suchitra", distance: "5.2 km", beds: 6 },
    { name: "Surekha Hospital", area: "Kompally", distance: "3.7 km", beds: 4 },
    { name: "Avasa Hospital", area: "Suchitra", distance: "4.9 km", beds: 5 }
];

function requestLocation() {
    const emergencyMsg = document.getElementById("emergencyMsg");
    if (navigator.geolocation) {
        let called = false;
        const timeout = setTimeout(() => {
            if (!called) {
                called = true;
                emergencyMsg.textContent = "Could not get location quickly. Showing default hospitals near Maisammaguda.";
                displayHospitals();
            }
        }, 3000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (called) return;
                called = true;
                clearTimeout(timeout);
                currentLocation.lat = position.coords.latitude;
                currentLocation.lng = position.coords.longitude;
                emergencyMsg.textContent = "Location detected. Showing nearest hospitals...";
                displayHospitals();
            },
            () => {
                if (called) return;
                clearTimeout(timeout);
                emergencyMsg.textContent = "Could not get location. Showing default hospitals near Maisammaguda.";
                displayHospitals();
            }
        );
    } else {
        emergencyMsg.textContent = "Geolocation not supported. Showing default hospitals.";
        displayHospitals();
    }
}

function displayHospitals() {
    const hospitalList = document.getElementById("hospitalList");
    hospitalList.innerHTML = "";
    hospitals.forEach((hosp, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
      <strong>${hosp.name}</strong><br>
      Area: ${hosp.area}<br>
      Distance: ${hosp.distance}<br>
      Beds Available: <span id="beds-${index}">${hosp.beds}</span><br>
      <button onclick="bookAmbulance(${index})">Book Ambulance</button>
    `;
        hospitalList.appendChild(li);
    });

    // Populate appointment hospital dropdown
    const hospitalDropdown = document.getElementById("hospitalDropdown");
    if (hospitalDropdown) {
        hospitalDropdown.innerHTML = '<option value="">--Select Hospital--</option>';
        hospitals.forEach(hosp => {
            const option = document.createElement("option");
            option.textContent = hosp.name;
            hospitalDropdown.appendChild(option);
        });
    }
}

window.bookAmbulance = function(index) {
    selectedHospitalIndex = index;
    showScreen("mobileScreen");
};

window.confirmAmbulance = function() {
    const mobile = document.getElementById("mobileNumber").value;
    if (!/^\d{10}$/.test(mobile)) {
        showPopup("⚠ Mobile number must be 10 digits!", "emergency");
        return;
    }
    if (selectedHospitalIndex !== null) {
        hospitals[selectedHospitalIndex].beds -= 1;
        document.getElementById(`beds-${selectedHospitalIndex}`).textContent =
            hospitals[selectedHospitalIndex].beds;
        showPopup(`✅ Ambulance booked! We will contact you at ${mobile}`, "emergency");
        showScreen("firstScreen");
        document.getElementById("mobileNumber").value = "";
    }
};

// ================= Appointment Feature =================
const doctorsData = {
    Cardiologist: ["Dr. Ramesh", "Dr. Priya"],
    Neurologist: ["Dr. Anil", "Dr. Kavitha"],
    Gynecologist: ["Dr. Meena", "Dr. Shilpa"],
    Orthopedic: ["Dr. Suresh", "Dr. Naveen"],
    Pediatrician: ["Dr. Arjun", "Dr. Rekha"],
    Dermatologist: ["Dr. Swathi", "Dr. Rahul"],
    ENT: ["Dr. Keerthi", "Dr. Sanjay"],
    "General Physician": ["Dr. Vikas", "Dr. Neha"]
};

window.updateDoctors = function() {
    const specialist = document.getElementById("specialist").value;
    const doctorSelect = document.getElementById("doctor");
    doctorSelect.innerHTML = "";
    if (doctorsData[specialist]) {
        doctorsData[specialist].forEach(doc => {
            const option = document.createElement("option");
            option.textContent = doc;
            doctorSelect.appendChild(option);
        });
    }
};

function setDateLimits() {
    const dateInput = document.getElementById("appointmentDate");
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    dateInput.min = today.toISOString().split("T")[0];
    dateInput.max = nextMonth.toISOString().split("T")[0];
}

const appointmentForm = document.getElementById("appointmentForm");
if (appointmentForm) {
    appointmentForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const date = document.getElementById("appointmentDate").value;
        const time = document.getElementById("timeSlot").value;
        const doctor = document.getElementById("doctor").value;
        const hospital = document.getElementById("hospitalDropdown").value;
        showPopup(`✅ Appointment booked with ${doctor} at ${hospital} on ${date} ${time} for ${name}`, "normal");
        appointmentForm.reset();
    });
}

// ================= Pharmacy Feature + Payment =================
function toggleUPI() {
    const method = document.getElementById("paymentMethod").value;
    const upiField = document.getElementById("upiId");
    if (method === "UPI") {
        upiField.style.display = "block";
        upiField.required = true;
    } else {
        upiField.style.display = "none";
        upiField.value = "";
        upiField.required = false;
    }
}

const pharmacyForm = document.getElementById("pharmacyForm");
if (pharmacyForm) {
    pharmacyForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("pharmacyName").value;
        const mobile = document.getElementById("pharmacyMobile").value;
        const address = document.getElementById("address").value;
        const symptom = document.getElementById("symptom").value;
        const medicine = document.getElementById("medicine").value;
        const quantity = document.getElementById("quantity").value;
        const payment = document.getElementById("paymentMethod").value;
        const upi = document.getElementById("upiId").value;

        if (!mobile || !address || !payment) {
            showPopup("⚠ Please enter all required details!", "pharmacy");
            return;
        }
        if (!/^\d{10}$/.test(mobile)) {
            showPopup("⚠ Mobile number must be 10 digits!", "pharmacy");
            return;
        }
        if (payment === "UPI" && !upi) {
            showPopup("⚠ Please enter UPI ID!", "pharmacy");
            return;
        }

        let paymentText = payment === "UPI" ? `UPI (${upi})` : payment;
        showPopup(`✅ Order placed! ${quantity} x ${medicine} for ${symptom} to ${address}. Payment: ${paymentText}. We will contact ${name} at ${mobile}.`, "pharmacy");

        pharmacyForm.reset();
        showScreen("firstScreen");
        document.getElementById("upiId").style.display = "none";
    });
}

// ================= Popup Helper =================
function showPopup(message, type) {
    const popup = document.getElementById("popupMessage");
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => { popup.style.display = "none"; }, 4000);
}

// ================= Medicine Dropdown based on Symptoms =================
const symptomMedicines = {
    Fever: ["Paracetamol", "Crocin"],
    Cold: ["Benadryl", "Cetrizine"],
    Cough: ["Delsym", "Bromhexine"],
    Headache: ["Aspirin", "Ibuprofen"],
    Allergy: ["Cetirizine", "Loratadine"]
};

window.updateMedicineDropdown = function() {
    const symptom = document.getElementById("symptom").value;
    const medicineSelect = document.getElementById("medicine");
    medicineSelect.innerHTML = "<option value=''>--Select Medicine--</option>";
    if (symptomMedicines[symptom]) {
        symptomMedicines[symptom].forEach(med => {
            const option = document.createElement("option");
            option.textContent = med;
            medicineSelect.appendChild(option);
        });
    }
};