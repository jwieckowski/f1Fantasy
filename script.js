import drivers from "./data/drivers.json" assert { type: "json" };
import constructors from "./data/constructors.json" assert { type: "json" };

const ctx = document.getElementById("priceChart");
let chart;

const raceDriverKeys = [
  "driver",
  "total",
  "race position",
  "qualifying position",
  "race overtake bonus",
  "race position gained",
];

const raceConstructorKeys = [
  "team",
  "total",
  "race position",
  "race overtake bonus",
  "race position gained",
];

const raceDriverDataLabels = [
  "Driver",
  "Total points",
  "Race points",
  "Qualifying points",
  "Race overtake bonus",
  "Race positions gained/lost",
];

const driverTableLabels = [
  "Driver",
  "Price change",
  "Points",
  "Overtakes",
  "Podiums",
  "Finish in points",
  "Race DNF",
];

const constructorTableLabels = [
  "Team",
  "Price change",
  "Points",
  "Both drivers q3",
  "Podium in fastest pit-stop",
];

const raceConstructorTableLabels = [
  "Team",
  "Total points",
  "Race points",
  "Team overtakes",
  "Positions gained/lost",
];

function getDriversDNF() {
  return drivers.map((driver) =>
    driver.races
      .map((race) => {
        let dnf = 0;
        Object.keys(race.points).forEach((key) => {
          if (key === "race not classified") {
            dnf += 1;
          }
        });
        return dnf;
      })
      .reduce((acc, val) => acc + val)
  );
}

function getDriversFinishesInPoints() {
  return drivers.map((driver) =>
    driver.races
      .map((race) => {
        let inPoints = 0;
        Object.keys(race.points).forEach((key) => {
          if (key === "race position") {
            inPoints += 1;
          }
        });
        return inPoints;
      })
      .reduce((acc, val) => acc + val)
  );
}

function getDriverPodiums() {
  return drivers.map((driver) =>
    driver.races
      .map((race) => {
        let podiums = 0;
        Object.keys(race.points).forEach((key) => {
          if (key === "race position" && race.points[key] >= 15) {
            podiums += 1;
          }
        });
        return podiums;
      })
      .reduce((acc, val) => acc + val)
  );
}

function getDriversOvertakes() {
  return drivers.map((driver) =>
    driver.races
      .map((race) => {
        let overtakes = 0;
        Object.keys(race.points).forEach((key) => {
          if (key.includes("overtake")) {
            overtakes += race.points[key];
          }
        });
        return overtakes;
      })
      .reduce((acc, val) => acc + val)
  );
}

function getTotalPoints(data) {
  return data.map((item) =>
    item.races.map((race) => race.points.total).reduce((acc, val) => acc + val)
  );
}

function getPrices(data) {
  const startPrices = data.map((item) => item.startPrice);
  const maxPrices = data.map((item) =>
    Math.max(...item.races.map((race) => race.price))
  );
  return maxPrices.map((price, idx) => (price - startPrices[idx]).toFixed(2));
}

function getConstructorsQ3() {
  return constructors.map((item) =>
    item.races
      .map((race) =>
        Object.keys(race.points).includes("both drivers q3") ? 1 : 0
      )
      .reduce((acc, val) => acc + val)
  );
}

function getNumberOfFastestPitStops() {
  return constructors.map((item) =>
    item.races
      .map((race) =>
        Object.keys(race.points).includes("race fastest pitstop") ||
        Object.keys(race.points).includes("2nd fastest pitstop") ||
        Object.keys(race.points).includes("3rd fastest pitstop")
          ? 1
          : 0
      )
      .reduce((acc, val) => acc + val)
  );
}

function createDriverTiles(
  names,
  prices,
  points,
  overtakes,
  podiums,
  inPoints,
  dnf
) {
  // Create a container for the tiles
  const tableContainer = document.getElementById("table-tiles");
  tableContainer.innerHTML = "";

  // Iterate through the drivers and create tiles
  names.forEach((name, index) => {
    const tile = document.createElement("div");
    tile.classList.add("driver-tile");

    // Add driver information
    const driverInfo = document.createElement("div");
    const driverData = [
      { label: "Driver", value: name },
      { label: "Price change", value: prices[index] },
      { label: "Points", value: points[index] },
      { label: "Overtakes", value: overtakes[index] },
      { label: "Podiums", value: podiums[index] },
      { label: "Finish in points", value: inPoints[index] },
      { label: "Race DNF", value: dnf[index] },
    ];

    driverData.forEach((data) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>${data.label}:</strong> ${data.value}`;
      driverInfo.appendChild(row);
    });

    const toggleButton = document.createElement("div");
    toggleButton.classList.add("expand-toggle");
    toggleButton.innerHTML = "<span class='expand-icon'>&#x25BC;</span>";
    toggleButton.addEventListener("click", function () {
      tile.classList.toggle("expanded");
      toggleButton.innerHTML = tile.classList.contains("expanded")
        ? '<span class="expand-icon">&#x25B2;</span>'
        : "<span class='expand-icon'>&#x25BC;</span>";
    });

    tile.appendChild(toggleButton);
    tile.appendChild(driverInfo);
    // Append the tile to the container
    tableContainer.appendChild(tile);
  });
}

function createDriversTable(
  names,
  prices,
  points,
  overtakes,
  podiums,
  inPoints,
  dnf
) {
  // Compose the data into rows
  const tableData = names.map((name, index) => [
    name,
    prices[index],
    points[index],
    overtakes[index],
    podiums[index],
    inPoints[index],
    dnf[index],
  ]);
  // Create a table element
  const table = document.createElement("table");
  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  driverTableLabels.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  // Create table body
  const tbody = document.createElement("tbody");
  tableData.forEach((rowData) => {
    const tr = document.createElement("tr");
    rowData.forEach((cellData) => {
      const td = document.createElement("td");
      td.textContent = cellData;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  // Append the table to the desired container in the HTML document
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

function prepareDriversTableData() {
  const names = drivers.map((driver) => driver.driver);
  const prices = getPrices(drivers);
  const points = getTotalPoints(drivers);
  const overtakes = getDriversOvertakes();
  const podiums = getDriverPodiums();
  const inPoints = getDriversFinishesInPoints();
  const dnf = getDriversDNF();

  createDriverTiles(names, prices, points, overtakes, podiums, inPoints, dnf);
  createDriversTable(names, prices, points, overtakes, podiums, inPoints, dnf);
}

function getRaceResults(raceName) {
  const raceData = drivers
    .filter(
      (driver) =>
        driver.races.find((race) => race.circuit === raceName).price !== 0
    )
    .flatMap((driver) => {
      return {
        driver: driver.driver,
        ...driver.races.find((race) => race.circuit === raceName).points,
      };
    })
    .sort((a, b) => b?.total - a?.total);
  return raceData;
}

function createDriversPriceChart(driver) {
  const labels = driver.races.map((race) => `${race.id + 1}`);
  const prices = driver.races.map((race) => race.price);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Price changes over season",
        data: prices,
        fill: true,
        borderColor: "#dc0000",
        tension: 0.3,
      },
    ],
  };
  const config = {
    type: "line",
    data: data,
  };

  chart = new Chart(ctx, config);
}

function updateDriversPriceChart(driver) {
  const prices = driver.races.map((race) => race.price);
  chart.data.datasets.forEach((dataset) => {
    dataset.data = prices;
  });
  chart.update();
}

function addDriversSelectItems(init = false) {
  function addItems() {
    const names = drivers.map((driver) => driver.driver);

    // Get the select element
    const priceSelect = document.getElementById("priceSelect");
    priceSelect.innerHTML = "";

    // Populate the select with options
    names.forEach((driver) => {
      const option = document.createElement("option");
      option.value = driver;
      option.textContent = driver;
      priceSelect.appendChild(option);
    });

    // Add an event listener for the select if needed
    priceSelect.addEventListener("change", function () {
      const selectedItem = priceSelect.value;
      const priceSwitch = document.getElementById("price-switch");
      if (priceSwitch.checked) {
        updateConstructorsPriceChart(
          constructors.find((constructor) => constructor.team === selectedItem)
        );
      } else {
        updateDriversPriceChart(
          drivers.find((driver) => driver.driver === selectedItem)
        );
      }
    });
  }

  addItems();
  // if (init) {
  //   document.addEventListener("load", function () {
  //     addItems();
  //   });
  // } else {
  //   addItems();
  // }
}

function addRacesSelectItems() {
  const names = drivers[0].races.map((race) => race.circuit);

  // Get the select element
  const raceSelect = document.getElementById("raceSelect");

  // Populate the select with options
  names.forEach((driver) => {
    const option = document.createElement("option");
    option.value = driver;
    option.textContent = driver;
    raceSelect.appendChild(option);
  });

  // Add an event listener for the select if needed
  raceSelect.addEventListener("change", function () {
    const selectedRace = raceSelect.value;

    const raceSwitch = document.getElementById("race-switch");

    if (raceSwitch.checked) {
      addConstructorRaceDataTable(selectedRace, true);
      addConstructorRaceDataTiles(selectedRace, true);
    } else {
      addDriversRaceDataTable(selectedRace, true);
      addDriversRaceDataTiles(selectedRace, true);
    }
  });
}

function createRaceTableData(circuit) {
  // Create a table element
  const table = document.createElement("table");
  table.id = "race-data-table";

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  raceDriverDataLabels.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Append the table to the desired container in the HTML document
  const tableContainer = document.getElementById("race-table-container");
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);

  addDriversRaceDataTable(circuit);
}

function addDriversRaceDataTable(circuit, update = false) {
  const raceData = getRaceResults(circuit);

  const tableBody = document.querySelector("#race-data-table");
  if (update) {
    const rows = tableBody.getElementsByTagName("tr");
    var rowCount = rows.length;
    for (var x = rowCount - 1; x > 0; x--) {
      tableBody.deleteRow(x);
    }
  }

  // Populate the table with data
  raceData.forEach((data) => {
    const row = document.createElement("tr");
    raceDriverKeys.forEach((property) => {
      const cell = document.createElement("td");
      if (property === "race position gained") {
        const positionLost = "race position lost";
        cell.innerHTML =
          data[property] !== undefined
            ? data[property]
            : data[positionLost] !== undefined
            ? data[positionLost]
            : "0";
      } else
        cell.innerHTML = data[property] !== undefined ? data[property] : "0";

      if (data["driver of the day"] && property === "driver") {
        cell.innerHTML = `${cell.innerHTML} <span class='golden-star'>★</span>`;
      }

      if (data["race fastest lap"] && property === "driver") {
        cell.innerHTML = `${cell.innerHTML} <i class='fas fa-clock timer-icon'></i>`;
      }

      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}
function addDriversRaceDataTiles(circuit, update = false) {
  const tableContainer = document.getElementById("race-table-tiles");
  if (update) {
    tableContainer.innerHTML = "";
  }
  createRaceDriverTiles(circuit);
}

function createRaceDriverTiles(circuit) {
  const raceData = getRaceResults(circuit);

  // Create a container for the tiles
  const tableContainer = document.getElementById("race-table-tiles");
  tableContainer.innerHTML = "";

  raceData.forEach((data) => {
    const tile = document.createElement("div");
    tile.classList.add("driver-tile");

    // Add driver information
    const driverInfo = document.createElement("div");
    raceDriverKeys.forEach((property, idx) => {
      const row = document.createElement("p");

      let value = "";
      if (property === "race position gained") {
        const positionLost = "race position lost";
        value =
          data[property] !== undefined
            ? data[property]
            : data[positionLost] !== undefined
            ? data[positionLost]
            : "0";
      } else value = data[property] !== undefined ? data[property] : "0";

      if (data["driver of the day"] && property === "driver") {
        value = `${value} <span class='golden-star'>★</span>`;
      }

      if (data["race fastest lap"] && property === "driver") {
        value = `${value} <i class='fas fa-clock timer-icon'></i>`;
      }

      row.innerHTML = `<strong>${raceDriverDataLabels[idx]}:</strong> ${value}`;
      driverInfo.appendChild(row);
    });
    const toggleButton = document.createElement("div");
    toggleButton.classList.add("expand-toggle");
    toggleButton.innerHTML = "<span class='expand-icon'>&#x25BC;</span>";
    toggleButton.addEventListener("click", function () {
      tile.classList.toggle("expanded");
      toggleButton.innerHTML = tile.classList.contains("expanded")
        ? '<span class="expand-icon">&#x25B2;</span>'
        : "<span class='expand-icon'>&#x25BC;</span>";
    });

    tile.appendChild(toggleButton);
    tile.appendChild(driverInfo);
    // Append the tile to the container
    tableContainer.appendChild(tile);
  });
}

function prepareRaceDriversTableData() {
  const circuit =
    document.getElementById("raceSelect").value || drivers[0].races[0].circuit;

  createRaceDriverTiles(circuit);
  createRaceTableData(circuit);
}

// CONSTRUCTORS DATA FUNCTIONS
function createConstructorTiles(names, prices, points, q3, pitstop) {
  // Create a container for the tiles
  const tableContainer = document.getElementById("table-tiles");
  tableContainer.innerHTML = "";

  // Iterate through the drivers and create tiles
  names.forEach((name, index) => {
    const tile = document.createElement("div");
    tile.classList.add("driver-tile");

    // Add driver information
    const constructorInfo = document.createElement("div");
    const constructorData = [
      { label: constructorTableLabels[0], value: name },
      { label: constructorTableLabels[1], value: prices[index] },
      { label: constructorTableLabels[2], value: points[index] },
      { label: constructorTableLabels[3], value: q3[index] },
      { label: constructorTableLabels[4], value: pitstop[index] },
    ];

    constructorData.forEach((data) => {
      const row = document.createElement("p");
      row.innerHTML = `<strong>${data.label}:</strong> ${data.value}`;
      constructorInfo.appendChild(row);
    });

    const toggleButton = document.createElement("div");
    toggleButton.classList.add("expand-toggle");
    toggleButton.innerHTML = "<span class='expand-icon'>&#x25BC;</span>";
    toggleButton.addEventListener("click", function () {
      tile.classList.toggle("expanded");
      toggleButton.innerHTML = tile.classList.contains("expanded")
        ? '<span class="expand-icon">&#x25B2;</span>'
        : "<span class='expand-icon'>&#x25BC;</span>";
    });

    tile.appendChild(toggleButton);
    tile.appendChild(constructorInfo);
    // Append the tile to the container
    tableContainer.appendChild(tile);
  });
}

function createConstructorTable(names, prices, points, q3, pitstop) {
  // Compose the data into rows
  const tableData = names.map((name, index) => [
    name,
    prices[index],
    points[index],
    q3[index],
    pitstop[index],
  ]);
  // Create a table element
  const table = document.createElement("table");
  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  constructorTableLabels.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  // Create table body
  const tbody = document.createElement("tbody");
  tableData.forEach((rowData) => {
    const tr = document.createElement("tr");
    rowData.forEach((cellData) => {
      const td = document.createElement("td");
      td.textContent = cellData;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  // Append the table to the desired container in the HTML document
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

function prepareConstructorsTableData() {
  const names = constructors.map((item) => item.team);
  const prices = getPrices(constructors);
  const points = getTotalPoints(constructors);
  const q3 = getConstructorsQ3();
  const pitstop = getNumberOfFastestPitStops();

  createConstructorTiles(names, prices, points, q3, pitstop);
  createConstructorTable(names, prices, points, q3, pitstop);
}

function updateConstructorsPriceChart(constructor) {
  const prices = constructor.races.map((race) => race.price);
  chart.data.datasets.forEach((dataset) => {
    dataset.data = prices;
  });
  chart.update();
}

function addConstructorsSelectItems() {
  const names = constructors.map((constructor) => constructor.team);

  // Get the select element
  const priceSelect = document.getElementById("priceSelect");
  priceSelect.innerHTML = "";

  // Populate the select with options
  names.forEach((constructor) => {
    const option = document.createElement("option");
    option.value = constructor;
    option.textContent = constructor;
    priceSelect.appendChild(option);
  });

  // Add an event listener for the select if needed
  priceSelect.addEventListener("change", function () {
    const selectedItem = priceSelect.value;
    updateConstructorsPriceChart(
      constructors.find((constructor) => constructor.team === selectedItem)
    );
  });
}

function getRaceConstructorResults(raceName) {
  const raceData = constructors
    .filter(
      (constructor) =>
        constructor.races.find((race) => race.circuit === raceName).price !== 0
    )
    .flatMap((constructor) => {
      return {
        team: constructor.team,
        ...constructor.races.find((race) => race.circuit === raceName).points,
      };
    })
    .sort((a, b) => b?.total - a?.total);
  return raceData;
}

function createRaceConstructorTableData(circuit) {
  // Create a table element
  const table = document.createElement("table");
  table.id = "race-data-table";

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  raceConstructorTableLabels.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Append the table to the desired container in the HTML document
  const tableContainer = document.getElementById("race-table-container");
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);

  addConstructorRaceDataTable(circuit);
}

function addConstructorRaceDataTable(circuit, update = false) {
  const raceData = getRaceConstructorResults(circuit);

  const tableBody = document.querySelector("#race-data-table");
  if (update) {
    const rows = tableBody.getElementsByTagName("tr");
    var rowCount = rows.length;
    for (var x = rowCount - 1; x > 0; x--) {
      tableBody.deleteRow(x);
    }
  }

  // Populate the table with data
  raceData.forEach((data) => {
    const row = document.createElement("tr");
    raceConstructorKeys.forEach((property) => {
      const cell = document.createElement("td");
      if (property === "race position gained") {
        const positionLost = "race position lost";
        cell.innerHTML =
          data[property] !== undefined
            ? data[property]
            : data[positionLost] !== undefined
            ? data[positionLost]
            : "0";
      } else
        cell.innerHTML = data[property] !== undefined ? data[property] : "0";

      if (data["driver of the day"] && property === "team") {
        cell.innerHTML = `${cell.innerHTML} <span class='golden-star'>★</span>`;
      }

      if (data["race fastest lap"] && property === "team") {
        cell.innerHTML = `${cell.innerHTML} <i class='fas fa-clock timer-icon'></i>`;
      }

      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}
function addConstructorRaceDataTiles(circuit, update = false) {
  const tableContainer = document.getElementById("race-table-tiles");
  if (update) {
    tableContainer.innerHTML = "";
  }
  createRaceConstructorTiles(circuit);
}

function createRaceConstructorTiles(circuit) {
  const raceData = getRaceConstructorResults(circuit);

  // Create a container for the tiles
  const tableContainer = document.getElementById("race-table-tiles");
  tableContainer.innerHTML = "";

  raceData.forEach((data) => {
    const tile = document.createElement("div");
    tile.classList.add("driver-tile");

    // Add driver information
    const driverInfo = document.createElement("div");
    raceConstructorKeys.forEach((property, idx) => {
      const row = document.createElement("p");

      let value = "";
      if (property === "race position gained") {
        const positionLost = "race position lost";
        value =
          data[property] !== undefined
            ? data[property]
            : data[positionLost] !== undefined
            ? data[positionLost]
            : "0";
      } else value = data[property] !== undefined ? data[property] : "0";

      if (data["race fastest pitstop"] && property === "team") {
        value = `${value} <span class='golden-star'>★</span>`;
      }

      if (data["race fastest lap"] && property === "team") {
        value = `${value} <i class='fas fa-clock timer-icon'></i>`;
      }

      row.innerHTML = `<strong>${raceConstructorTableLabels[idx]}:</strong> ${value}`;
      driverInfo.appendChild(row);
    });
    const toggleButton = document.createElement("div");
    toggleButton.classList.add("expand-toggle");
    toggleButton.innerHTML = "<span class='expand-icon'>&#x25BC;</span>";
    toggleButton.addEventListener("click", function () {
      tile.classList.toggle("expanded");
      toggleButton.innerHTML = tile.classList.contains("expanded")
        ? '<span class="expand-icon">&#x25B2;</span>'
        : "<span class='expand-icon'>&#x25BC;</span>";
    });

    tile.appendChild(toggleButton);
    tile.appendChild(driverInfo);
    // Append the tile to the container
    tableContainer.appendChild(tile);
  });
}

function prepareRaceConstructorsTableData() {
  const circuit = document.getElementById("raceSelect").value;
  createRaceConstructorTiles(circuit);
  createRaceConstructorTableData(circuit);
}

function setSwitchListeners() {
  const overallSwitch = document.getElementById("overall-switch");
  const raceSwitch = document.getElementById("race-switch");
  const priceSwitch = document.getElementById("price-switch");

  overallSwitch.addEventListener("click", (e) => {
    if (e.target.checked) {
      prepareConstructorsTableData();
    } else {
      prepareDriversTableData();
    }
  });

  raceSwitch.addEventListener("click", (e) => {
    if (e.target.checked) {
      prepareRaceConstructorsTableData();
    } else {
      prepareRaceDriversTableData();
    }
  });

  priceSwitch.addEventListener("click", (e) => {
    if (e.target.checked) {
      addConstructorsSelectItems();
      updateConstructorsPriceChart(constructors[0]);
    } else {
      updateConstructorsPriceChart(drivers[0]);
      addDriversSelectItems();
    }
  });
}

// tables
document.addEventListener("load", function () {
  prepareDriversTableData();
  prepareRaceDriversTableData();

  // selects
  addDriversSelectItems();
  addRacesSelectItems();

  // charts
  createDriversPriceChart(drivers[0]);

  // switches
  setSwitchListeners();
});
