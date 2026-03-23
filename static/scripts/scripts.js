(function () {
    "use strict";

    var KEYS = {
        weights: "health_weights",
        water: "health_water",
        profile: "health_profile"
    };

    var WATER_GOAL = 8;

    function getTodayISO() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, "0");
        var day = String(now.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    function getProfile() {
        var stored = localStorage.getItem(KEYS.profile);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                localStorage.removeItem(KEYS.profile);
            }
        }

        return {
            name: "Usuario",
            height: 170,
            goalWeight: 70,
            startWeight: 90
        };
    }

    function saveProfile(profile) {
        localStorage.setItem(KEYS.profile, JSON.stringify(profile));
    }

    function getSeedWeights() {
        return [
            { id: "1", date: "2026-02-01", weight: 90 },
            { id: "2", date: "2026-02-08", weight: 88.5 },
            { id: "3", date: "2026-02-15", weight: 87.2 },
            { id: "4", date: "2026-02-22", weight: 86.8 },
            { id: "5", date: "2026-03-01", weight: 85.5 },
            { id: "6", date: "2026-03-08", weight: 84.3 },
            { id: "7", date: "2026-03-15", weight: 83.1 }
        ];
    }

    function getWeightEntries() {
        var stored = localStorage.getItem(KEYS.weights);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                localStorage.removeItem(KEYS.weights);
            }
        }

        var seed = getSeedWeights();
        localStorage.setItem(KEYS.weights, JSON.stringify(seed));
        return seed;
    }

    function saveWeightEntries(entries) {
        localStorage.setItem(KEYS.weights, JSON.stringify(entries));
    }

    function getWaterToday() {
        var today = getTodayISO();
        var stored = localStorage.getItem(KEYS.water);

        if (!stored) {
            return 0;
        }

        try {
            var entries = JSON.parse(stored);
            for (var i = 0; i < entries.length; i += 1) {
                if (entries[i].date === today) {
                    return entries[i].glasses || 0;
                }
            }
        } catch (error) {
            localStorage.removeItem(KEYS.water);
        }

        return 0;
    }

    function saveWaterToday(glasses) {
        var today = getTodayISO();
        var stored = localStorage.getItem(KEYS.water);
        var entries = [];

        if (stored) {
            try {
                entries = JSON.parse(stored);
            } catch (error) {
                entries = [];
            }
        }

        entries = entries.filter(function (entry) {
            return entry.date !== today;
        });

        entries.push({ date: today, glasses: glasses });
        localStorage.setItem(KEYS.water, JSON.stringify(entries));
    }

    function calculateBMI(weight, heightCm) {
        var h = heightCm / 100;
        if (!h) {
            return 0;
        }
        return weight / (h * h);
    }

    function getBMICategory(bmi) {
        if (bmi < 18.5) {
            return { label: "Abaixo do peso", className: "text-info" };
        }
        if (bmi < 25) {
            return { label: "Peso normal", className: "text-success" };
        }
        if (bmi < 30) {
            return { label: "Sobrepeso", className: "text-warning" };
        }
        return { label: "Obesidade", className: "text-danger" };
    }

    function formatDateBR(isoDate) {
        var date = new Date(isoDate + "T12:00:00");
        return date.toLocaleDateString("pt-BR");
    }

    function generateId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return "id-" + Date.now() + "-" + Math.floor(Math.random() * 999999);
    }

    var state = {
        profile: getProfile(),
        entries: getWeightEntries(),
        water: getWaterToday()
    };

    var elements = {
        welcomeMessage: document.getElementById("welcomeMessage"),
        weightForm: document.getElementById("weightForm"),
        profileForm: document.getElementById("profileForm"),
        weightDate: document.getElementById("weightDate"),
        weightValue: document.getElementById("weightValue"),
        profileName: document.getElementById("profileName"),
        profileHeight: document.getElementById("profileHeight"),
        profileStartWeight: document.getElementById("profileStartWeight"),
        profileGoalWeight: document.getElementById("profileGoalWeight"),
        metricCurrentWeight: document.getElementById("metricCurrentWeight"),
        metricGoalWeight: document.getElementById("metricGoalWeight"),
        metricRemaining: document.getElementById("metricRemaining"),
        metricTotalLost: document.getElementById("metricTotalLost"),
        metricBmi: document.getElementById("metricBmi"),
        bmiNumber: document.getElementById("bmiNumber"),
        bmiCategory: document.getElementById("bmiCategory"),
        bmiMarker: document.getElementById("bmiMarker"),
        waterRing: document.getElementById("waterRing"),
        waterCount: document.getElementById("waterCount"),
        waterStatus: document.getElementById("waterStatus"),
        waterMinus: document.getElementById("waterMinus"),
        waterPlus: document.getElementById("waterPlus"),
        historyList: document.getElementById("historyList"),
        chartGrid: document.getElementById("chartGrid"),
        goalLine: document.getElementById("goalLine"),
        weightPolyline: document.getElementById("weightPolyline"),
        weightDots: document.getElementById("weightDots"),
        chartCaption: document.getElementById("chartCaption")
    };

    function getCurrentWeight() {
        if (!state.entries.length) {
            return state.profile.startWeight;
        }

        var sorted = state.entries.slice().sort(function (a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return sorted[0].weight;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function renderMetrics() {
        var currentWeight = getCurrentWeight();
        var totalLost = state.profile.startWeight - currentWeight;
        var remaining = currentWeight - state.profile.goalWeight;
        var bmi = calculateBMI(currentWeight, state.profile.height);

        elements.welcomeMessage.textContent = "Ola, " + state.profile.name;
        elements.metricCurrentWeight.textContent = currentWeight.toFixed(1) + " kg";
        elements.metricGoalWeight.textContent = state.profile.goalWeight.toFixed(1) + " kg";
        elements.metricRemaining.textContent = "Faltam " + remaining.toFixed(1) + " kg";
        elements.metricTotalLost.textContent = totalLost.toFixed(1) + " kg";
        elements.metricBmi.textContent = bmi.toFixed(1);

        elements.bmiNumber.textContent = bmi.toFixed(1);
        var category = getBMICategory(bmi);
        elements.bmiCategory.textContent = category.label;
        elements.bmiCategory.className = "bmi-category " + category.className;

        var pos = clamp(((bmi - 15) / 25) * 100, 0, 100);
        elements.bmiMarker.style.left = pos.toFixed(1) + "%";
    }

    function renderWater() {
        var glasses = state.water;
        var percentage = clamp((glasses / WATER_GOAL) * 100, 0, 100);
        var deg = (percentage / 100) * 360;

        elements.waterRing.style.background = "conic-gradient(var(--info) " + deg + "deg, #dae8f3 " + deg + "deg)";
        elements.waterCount.textContent = glasses + "/" + WATER_GOAL;

        if (glasses >= WATER_GOAL) {
            elements.waterStatus.textContent = "Meta atingida";
        } else {
            elements.waterStatus.textContent = "Faltam " + (WATER_GOAL - glasses) + " copos";
        }

        elements.waterMinus.disabled = glasses === 0;
    }

    function renderHistory() {
        var sorted = state.entries.slice().sort(function (a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        if (!sorted.length) {
            elements.historyList.innerHTML = '<li class="empty-history">Sem registros ainda.</li>';
            return;
        }

        var html = sorted
            .map(function (entry) {
                return (
                    '<li class="history-item">' +
                    '<div class="history-meta">' +
                    '<span>' + formatDateBR(entry.date) + '</span>' +
                    '<span class="history-weight">' + entry.weight.toFixed(1) + ' kg</span>' +
                    '</div>' +
                    '<button class="delete-btn" type="button" data-id="' + entry.id + '">Excluir</button>' +
                    '</li>'
                );
            })
            .join("");

        elements.historyList.innerHTML = html;
    }

    function createSVGEl(name, attrs) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", name);
        var keys = Object.keys(attrs);
        for (var i = 0; i < keys.length; i += 1) {
            el.setAttribute(keys[i], attrs[keys[i]]);
        }
        return el;
    }

    function renderChart() {
        var sorted = state.entries.slice().sort(function (a, b) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        if (!sorted.length) {
            elements.weightPolyline.setAttribute("points", "");
            elements.weightDots.innerHTML = "";
            elements.chartGrid.innerHTML = "";
            elements.chartCaption.textContent = "Sem dados para exibir.";
            return;
        }

        var width = 720;
        var height = 280;
        var pad = { top: 18, right: 14, bottom: 24, left: 16 };

        var allWeights = sorted.map(function (item) {
            return item.weight;
        });

        allWeights.push(state.profile.goalWeight);

        var minW = Math.min.apply(null, allWeights) - 2;
        var maxW = Math.max.apply(null, allWeights) + 2;

        if (minW === maxW) {
            minW -= 1;
            maxW += 1;
        }

        var innerW = width - pad.left - pad.right;
        var innerH = height - pad.top - pad.bottom;
        var maxIndex = sorted.length - 1;

        function xAt(i) {
            if (maxIndex === 0) {
                return pad.left + innerW / 2;
            }
            return pad.left + (i / maxIndex) * innerW;
        }

        function yAt(weight) {
            var ratio = (weight - minW) / (maxW - minW);
            return pad.top + (1 - ratio) * innerH;
        }

        elements.chartGrid.innerHTML = "";
        for (var g = 0; g <= 4; g += 1) {
            var gy = pad.top + (g / 4) * innerH;
            var line = createSVGEl("line", {
                x1: String(pad.left),
                y1: String(gy),
                x2: String(width - pad.right),
                y2: String(gy),
                class: "chart-grid-line"
            });
            elements.chartGrid.appendChild(line);
        }

        var goalY = yAt(state.profile.goalWeight);
        elements.goalLine.setAttribute("x1", String(pad.left));
        elements.goalLine.setAttribute("x2", String(width - pad.right));
        elements.goalLine.setAttribute("y1", String(goalY));
        elements.goalLine.setAttribute("y2", String(goalY));

        var points = sorted
            .map(function (item, index) {
                return xAt(index).toFixed(1) + "," + yAt(item.weight).toFixed(1);
            })
            .join(" ");

        elements.weightPolyline.setAttribute("points", points);

        elements.weightDots.innerHTML = "";
        for (var i = 0; i < sorted.length; i += 1) {
            var circle = createSVGEl("circle", {
                cx: String(xAt(i)),
                cy: String(yAt(sorted[i].weight)),
                r: "4.5",
                class: "weight-dot"
            });
            elements.weightDots.appendChild(circle);
        }

        var first = sorted[0];
        var last = sorted[sorted.length - 1];
        elements.chartCaption.textContent =
            "De " + formatDateBR(first.date) + " ate " + formatDateBR(last.date) +
            " | Meta: " + state.profile.goalWeight.toFixed(1) + " kg";
    }

    function renderAll() {
        renderMetrics();
        renderWater();
        renderHistory();
        renderChart();
    }

    function hydrateForms() {
        elements.weightDate.value = getTodayISO();
        elements.profileName.value = state.profile.name;
        elements.profileHeight.value = String(state.profile.height);
        elements.profileStartWeight.value = String(state.profile.startWeight);
        elements.profileGoalWeight.value = String(state.profile.goalWeight);
    }

    function handleWeightSubmit(event) {
        event.preventDefault();

        var date = elements.weightDate.value;
        var weight = Number(elements.weightValue.value);

        if (!date || !Number.isFinite(weight) || weight <= 0) {
            return;
        }

        state.entries.push({ id: generateId(), date: date, weight: weight });
        saveWeightEntries(state.entries);

        elements.weightValue.value = "";
        renderAll();
    }

    function handleProfileSubmit(event) {
        event.preventDefault();

        var nextProfile = {
            name: elements.profileName.value.trim() || "Usuario",
            height: Number(elements.profileHeight.value),
            startWeight: Number(elements.profileStartWeight.value),
            goalWeight: Number(elements.profileGoalWeight.value)
        };

        if (
            !Number.isFinite(nextProfile.height) ||
            !Number.isFinite(nextProfile.startWeight) ||
            !Number.isFinite(nextProfile.goalWeight) ||
            nextProfile.height <= 0 ||
            nextProfile.startWeight <= 0 ||
            nextProfile.goalWeight <= 0
        ) {
            return;
        }

        state.profile = nextProfile;
        saveProfile(state.profile);
        renderAll();
    }

    function handleHistoryClick(event) {
        var target = event.target;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }

        if (!target.classList.contains("delete-btn")) {
            return;
        }

        var id = target.getAttribute("data-id");
        if (!id) {
            return;
        }

        state.entries = state.entries.filter(function (entry) {
            return entry.id !== id;
        });

        saveWeightEntries(state.entries);
        renderAll();
    }

    function bindEvents() {
        elements.weightForm.addEventListener("submit", handleWeightSubmit);
        elements.profileForm.addEventListener("submit", handleProfileSubmit);

        elements.waterMinus.addEventListener("click", function () {
            state.water = Math.max(0, state.water - 1);
            saveWaterToday(state.water);
            renderWater();
        });

        elements.waterPlus.addEventListener("click", function () {
            state.water += 1;
            saveWaterToday(state.water);
            renderWater();
        });

        elements.historyList.addEventListener("click", handleHistoryClick);
    }

    function init() {
        hydrateForms();
        bindEvents();
        renderAll();
    }

    init();
})();
