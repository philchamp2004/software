// Simulierte Datenbank
let users = [
    { username: "Admin", password: "admin", role: "admin" }
];
let devices = [];
let currentUser = null;

// Anmeldung
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        document.getElementById("login").classList.add("hidden");
        if (user.role === "admin") {
            document.getElementById("admin-panel").classList.remove("hidden");
            showUsersAndDevices(); // Admin: Zeige Benutzer und Geräte
        } else {
            document.getElementById("inspector-panel").classList.remove("hidden");
            showAllDevices(); // Prüfer: Zeige alle Geräte
        }
    } else {
        alert("Falscher Benutzername oder Passwort!");
    }
}

// Benutzer hinzufügen
function addUser() {
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value.trim();

    if (username && password) {
        users.push({ username, password, role: "inspector" });
        alert(`Benutzer "${username}" wurde hinzugefügt!`);

        // Felder leeren und anzeigen aktualisieren
        document.getElementById("new-username").value = "";
        document.getElementById("new-password").value = "";
        showUsersAndDevices();
    } else {
        alert("Bitte füllen Sie beide Felder aus!");
    }
}

// Gerät hinzufügen
function addDevice() {
    const deviceName = document.getElementById("device-name").value.trim();

    if (deviceName) {
        devices.push({ name: deviceName, assignedTo: null });
        alert(`Gerät "${deviceName}" wurde hinzugefügt!`);

        // Feld leeren und anzeigen aktualisieren
        document.getElementById("device-name").value = "";
        showUsersAndDevices();
    } else {
        alert("Bitte geben Sie einen Gerätenamen ein!");
    }
}

// Geräte anzeigen (für Prüfer)
function showAllDevices() {
    const list = document.getElementById("device-list");
    list.innerHTML = ""; // Liste leeren

    devices.forEach(device => {
        const li = document.createElement("li");
        li.textContent = device.name;
        list.appendChild(li);
    });
}

// Geräte und Benutzer im Admin-Bereich anzeigen
function showUsersAndDevices() {
    // Benutzer anzeigen
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user.username;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = () => deleteUser(user.username);
        li.appendChild(deleteButton);
        userList.appendChild(li);
    });

    // Geräte anzeigen
    const deviceList = document.getElementById("device-list-admin");
    deviceList.innerHTML = "";
    devices.forEach(device => {
        const li = document.createElement("li");
        li.textContent = device.name;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Löschen";
        deleteButton.onclick = () => deleteDevice(device.name);
        li.appendChild(deleteButton);
        deviceList.appendChild(li);
    });
}

// Benutzer löschen
function deleteUser(username) {
    users = users.filter(user => user.username !== username);
    showUsersAndDevices();
    alert(`Benutzer "${username}" wurde gelöscht.`);
}

// Gerät löschen
function deleteDevice(deviceName) {
    devices = devices.filter(device => device.name !== deviceName);
    showUsersAndDevices();
    alert(`Gerät "${deviceName}" wurde gelöscht.`);
}

// Abmelden
function logout() {
    currentUser = null;
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("inspector-panel").classList.add("hidden");
}

// Zusätzliche Funktionen zum Anzeigen der Admin-Optionen
function showAddUser() {
    document.getElementById("add-user").classList.toggle("hidden");
}

function showAddDevice() {
    document.getElementById("add-device").classList.toggle("hidden");
}
// Neue Reihenfolge der Prüfungen mit Grenzwerten
const inspectionSteps = [
    { step: "Sichtprüfung", limit: "Keine sichtbaren Schäden" },
    { step: "Isolationswiderstand messen", limit: "≥ 1 MΩ" },
    { step: "Schutzleiterprüfung", limit: "≤ 0,1 Ω" },
    { step: "Funktionsprüfung", limit: "Gerät funktioniert wie erwartet" },
    { step: "Drehstromprüfung", limit: "Keine Abweichungen im Stromfluss" }
];

// Die ausgewählten Prüfwerte für jedes Gerät speichern
let inspectionResults = {};

// Zeigt die Geräte für den Prüfer an und erlaubt die Auswahl
function showAllDevices() {
    const list = document.getElementById("device-list");
    list.innerHTML = ""; // Liste leeren

    devices.forEach((device, index) => {
        const li = document.createElement("li");
        li.textContent = device.name;
        const selectButton = document.createElement("button");
        selectButton.textContent = "Prüfen";
        selectButton.onclick = () => startInspection(device.name);
        li.appendChild(selectButton);
        list.appendChild(li);
    });
}

// Beginnt die DGUV3-Prüfung für das gewählte Gerät
function startInspection(deviceName) {
    const device = devices.find(d => d.name === deviceName);
    if (!device) return;

    // Gerät als geprüft markieren, falls bereits geprüft
    if (inspectionResults[deviceName]) {
        alert(`Das Gerät "${deviceName}" wurde bereits geprüft.`);
        return;
    }

    // Formular für die Prüfung anzeigen
    const inspectionForm = document.getElementById("inspection-form");
    inspectionForm.innerHTML = ""; // Altes Formular leeren
    inspectionForm.classList.remove("hidden");

    const title = document.createElement("h3");
    title.textContent = `DGUV3 Prüfung für ${deviceName}`;
    inspectionForm.appendChild(title);

    // Prüfungsschritte anzeigen
    let stepIndex = 0;
    const nextButton = document.createElement("button");
    nextButton.textContent = "Weiter";
    nextButton.onclick = () => nextStep(deviceName, stepIndex, nextButton);

    const stepContainer = document.createElement("div");
    inspectionForm.appendChild(stepContainer);
    inspectionForm.appendChild(nextButton);

    // Beginnt mit dem ersten Schritt
    nextStep(deviceName, stepIndex, nextButton);
}

// Führe einen Schritt der DGUV3-Prüfung aus
function nextStep(deviceName, stepIndex, nextButton) {
    const device = devices.find(d => d.name === deviceName);
    if (!device) return;

    // Sicherstellen, dass die Prüfung noch nicht abgeschlossen ist
    if (!inspectionResults[deviceName]) {
        inspectionResults[deviceName] = {};
    }

    const stepContainer = document.querySelector("#inspection-form > div");
    stepContainer.innerHTML = "";

    if (stepIndex < inspectionSteps.length) {
        const stepTitle = document.createElement("h4");
        stepTitle.textContent = inspectionSteps[stepIndex].step;
        stepContainer.appendChild(stepTitle);

        // Grenzwert anzeigen
        const limitText = document.createElement("p");
        limitText.textContent = `Grenzwert: ${inspectionSteps[stepIndex].limit}`;
        stepContainer.appendChild(limitText);

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Ergebnis eingeben";
        input.id = `step-${stepIndex}`;
        stepContainer.appendChild(input);

        // Speichern des Wertes des aktuellen Schritts
        nextButton.onclick = () => {
            const value = document.getElementById(`step-${stepIndex}`).value.trim();
            if (!value) {
                alert("Bitte geben Sie einen Wert ein!");
                return;
            }

            inspectionResults[deviceName][inspectionSteps[stepIndex].step] = value;

            // Weiter zum nächsten Schritt oder Abschluss der Prüfung
            if (stepIndex < inspectionSteps.length - 1) {
                nextStep(deviceName, stepIndex + 1, nextButton);
            } else {
                finishInspection(deviceName);
            }
        };
    }
}

// Abschluss der DGUV3-Prüfung
function finishInspection(deviceName) {
    const device = devices.find(d => d.name === deviceName);
    if (!device) return;

    // Prüfung als abgeschlossen markieren
    device.checked = true;
    alert(`Die DGUV3 Prüfung für das Gerät "${deviceName}" wurde erfolgreich abgeschlossen.`);

    // PDF erstellen
    generatePDF(deviceName);

    // Formular zurücksetzen und Gerät in der Liste aktualisieren
    document.getElementById("inspection-form").classList.add("hidden");
    showAllDevices();
}

let logo = null; // Variable für das hochgeladene Logo

// Funktion zum Hochladen des Logos
function uploadLogo() {
    const logoInput = document.getElementById("logo-upload");
    const logoFile = logoInput.files[0];

    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            logo = event.target.result; // Logo wird als Base64-String gespeichert
            document.getElementById("logo-status").textContent = `Logo "${logoFile.name}" wurde erfolgreich hochgeladen.`;
        };
        reader.readAsDataURL(logoFile); // Liest das Bild als Base64
    }
}

// PDF mit Logo und Prüfwerten erstellen und herunterladen
function generatePDF(deviceName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Wenn ein Logo hochgeladen wurde, füge es in die PDF ein
    if (logo) {
        doc.addImage(logo, 'JPEG', 10, 10, 40, 40); // Position und Größe des Logos anpassen
    }

    // Titel und Gerätemame
    doc.setFontSize(16);
    doc.text(`DGUV3 Prüfung für Gerät: ${deviceName}`, 10, 50);

    // Prüfungsergebnisse
    doc.setFontSize(12);
    let y = 60;
    Object.entries(inspectionResults[deviceName]).forEach(([step, value], index) => {
        doc.text(`${step}: ${value}`, 10, y);
        y += 10;
    });
    
    // Unterschrift und Datum
    const date = new Date().toLocaleDateString();
    doc.text(`Unterschrift: _____________________`, 10, y + 10);
    doc.text(`Datum: ${date}`, 10, y + 20);

    // PDF herunterladen
    doc.save(`${deviceName}_DGUV3_Pruefung.pdf`);
}
// Berechnung des nächsten Prüfdatums (1 Jahr nach dem aktuellen Datum)
function calculateNextInspectionDate() {
    const currentDate = new Date();
    const nextInspectionDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()); // Nächstes Jahr
    return nextInspectionDate;
}
