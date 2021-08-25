"use strict";

/*основная страница*/
const HomePageAviasales = document.querySelector(".HomePageAviasales");

/*div в который вставляем билеты*/
const listTickets = document.querySelector(".listTickets");

/*билет*/
const templateTicket = document.querySelector("#templateTicket");
const ticket = templateTicket.content.querySelector(".ticket");

/*кнопки фильтра*/
const allCheckboxesFilterTransfer = document.querySelectorAll(".filterButton");

/*кнопки верхнего фильтра*/
const tabsTopFilter = document.querySelectorAll(".tabsTopFilter");
/*нижняя кнопка*/
const buttonBottom = document.querySelector(".buttonBottom");

const plane = document.querySelector(".plane");

plane.addEventListener("click", () => {
  window.location.reload();
});
/*Общее действие при нажатии на любой фильтр*/
const eventClickFilter = (anyArray) => {
  listTickets.textContent = "";
  state.increment = 0;
  renderTickets(anyArray);
  buttonBottom.style.top = 1250 + "px";
  buttonBottom.style.left = 355 + "px";
  HomePageAviasales.style.height = 1350 + "px";
};

/*действия по нажатию на нижнюю кнопку*/
const indentAfterButton = 100;
const activeBottomButton = (anyArray) => {
  renderTickets(anyArray);
  buttonBottom.style.top = buttonBottom.offsetTop + 1020 + "px";
  HomePageAviasales.style.height =
    buttonBottom.offsetTop + indentAfterButton + "px";
};

let wrapperActiveBottomButton = () => {
  activeBottomButton(state.ticket);
};

buttonBottom.addEventListener("click", wrapperActiveBottomButton);
/*действия по нажатию на кнопки верхнего фильтра*/

let AddOrDelButtonTopFilterClassList = (buttonTopFilter) => {
  tabsTopFilter.forEach(function (elemTopFilter) {
    elemTopFilter.classList.remove("click_btn");
  });
  if (!buttonTopFilter.classList.contains("click_btn")) {
    buttonTopFilter.classList.add("click_btn");
  }
};
let eventTopFilter = (anyArray, buttonTopFilter) => {
  if (buttonTopFilter.classList.contains("minPrice")) {
    anyArray.sort(function (a, b) {
      if (a.price < b.price) {
        return -1;
      }
    });
    AddOrDelButtonTopFilterClassList(buttonTopFilter);
    eventClickFilter(anyArray);
    console.log("min_price");
  } else if (buttonTopFilter.classList.contains("so_quickly")) {
    anyArray.sort(function (a, b) {
      if (
        a.segments[0].duration + a.segments[1].duration <
        b.segments[0].duration + b.segments[1].duration
      ) {
        return -1;
      }
    });
    AddOrDelButtonTopFilterClassList(buttonTopFilter);
    eventClickFilter(anyArray);
    console.log("so_quickly");
  }
};
let wrapperEventTopFilter;
let topFilter = (anyArray) => {
  tabsTopFilter.forEach(function (buttonTopFilter) {
    buttonTopFilter.addEventListener(
      "click",
      (wrapperEventTopFilter = () => {
        eventTopFilter(anyArray, buttonTopFilter);
      })
    );
  });
};

/*активирует чекбоксы фильтра*/
allCheckboxesFilterTransfer.forEach(function (checkboxFilterTransfer) {
  checkboxFilterTransfer.addEventListener("click", () => {
    allCheckboxesFilterTransfer.forEach(function (checkboxFilterTransfer) {
      let checkbox = checkboxFilterTransfer.querySelector(".checkbox");
      checkbox.classList.remove("img-checkbox");
      checkbox.classList.remove("checkboxBorder");
    });
    let checkbox = checkboxFilterTransfer.querySelector(".checkbox");
    if (checkbox.classList.contains("img-checkbox")) {
      checkbox.classList.remove("img-checkbox");
      checkbox.classList.add("checkboxBorder");
    } else {
      checkbox.classList.add("img-checkbox");
      checkbox.classList.add("checkboxBorder");
    }
  });
});

const state = {
  ticket: [],
  increment: 0,
};

/*запрос к серверу*/
const requestURL = "https://front-test.beta.aviasales.ru/search";

function sendRequest(url) {
  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      const reloadPage = document.createElement("div");
      reloadPage.classList.add("text_decoration");
      reloadPage.textContent = "Загрузить локальные данные";
      reloadPage.addEventListener("click", () => {
        state.ticket = localTicets;
        renderTickets(state.ticket);
        HomePageAviasales.appendChild(buttonBottom);
        reloadPage.remove();
        circle.remove();
      });
      HomePageAviasales.appendChild(circle);
      HomePageAviasales.appendChild(reloadPage);
      buttonBottom.remove();
    });
}

sendRequest(requestURL)
  .then((data) => {
    let searchId = data.searchId;
    console.log(searchId);
    const ticketsURL =
      "https://front-test.beta.aviasales.ru/tickets?searchId=" + searchId;
    sendRequest(ticketsURL).then((data2) => {
      console.log(data2);
      state.ticket = data2.tickets;
      renderTickets(state.ticket);
      topFilter(state.ticket);
    });
  })
  .catch((err) => console.log(err));

/*рендер билета*/
let setTxtRoute = (txtRoute, segment) => {
  txtRoute.textContent = segment.origin + " - " + segment.destination;
};
let setTime = (time, segment) => {
  let timeDeparture = new Date(segment.date);
  let timeArrival = new Date(timeDeparture);
  timeArrival.setMinutes(timeArrival.getMinutes() + segment.duration);

  time.textContent =
    timeDeparture.getHours().toString().padStart(2, "0") +
    ":" +
    timeDeparture.getMinutes().toString().padStart(2, "0") +
    " - " +
    timeArrival.getHours().toString().padStart(2, "0") +
    ":" +
    timeArrival.getMinutes().toString().padStart(2, "0");
};
let setTimeInWay = (timeInWay, duration) => {
  timeInWay.textContent =
    Math.trunc(duration / 60) +
    "ч " +
    (duration - Math.trunc(duration / 60) * 60) +
    "м";
};
let setTxtTransfers = (txtTransfers, length) => {
  switch (length) {
    case 0:
      txtTransfers.textContent = "без пересадок";
      break;
    case 1:
      txtTransfers.textContent = "1 пересадка";
      break;
    case 2:
      txtTransfers.textContent = "2 пересадки";
      break;
    case 3:
      txtTransfers.textContent = "3 пересадки";
      break;
  }
};
let setTransfers = (transfers, stops) => {
  transfers.textContent = "";
  stops.forEach((elementStops) => {
    if (stops.indexOf(elementStops) + 1 == stops.length) {
      transfers.textContent = transfers.textContent + elementStops;
    } else {
      transfers.textContent = transfers.textContent + elementStops + ", ";
    }
  });
};
/*основная функция*/
let renderTickets = (anyBundleOfTickets) => {
  for (let i = 0 + state.increment; i < state.increment + 5; i++) {
    /*******/
    const price = ticket.querySelector(".price");
    price.textContent = anyBundleOfTickets[i].price + " Р";
    /*******/
    const ticketsImg = ticket.querySelector(".tickets-img");
    ticketsImg.src = `//pics.avs.io/99/36/${anyBundleOfTickets[i].carrier}.png`;

    /* СТРОКА ТУДА
     ******************************************************************
     */
    const there = ticket.querySelector(".there");
    /*******/
    const txtRouteThere = there.querySelector(".txt-route");
    setTxtRoute(txtRouteThere, anyBundleOfTickets[i].segments[0]);
    /*******/
    const timeThere = there.querySelector(".time");
    setTime(timeThere, anyBundleOfTickets[i].segments[0]);
    /*******/
    const timeInWayThere = there.querySelector(".time-in-way");
    setTimeInWay(timeInWayThere, anyBundleOfTickets[i].segments[0].duration);
    /*******/
    const txtTransfersThere = there.querySelector(".txt-transfers");

    setTxtTransfers(
      txtTransfersThere,
      anyBundleOfTickets[i].segments[0].stops.length
    );

    /*******/
    const transfersThere = there.querySelector(".transfers");

    setTransfers(transfersThere, anyBundleOfTickets[i].segments[0].stops);
    /* СТРОКА ОБРАТНО
     ******************************************************************
     */
    const back = ticket.querySelector(".back");
    /*******/
    const txtRouteBack = back.querySelector(".txt-route");
    setTxtRoute(txtRouteBack, anyBundleOfTickets[i].segments[1]);
    /*******/
    const timeBack = back.querySelector(".time");
    setTime(timeBack, anyBundleOfTickets[i].segments[1]);
    /*******/
    const timeInWayBack = back.querySelector(".time-in-way");
    setTimeInWay(timeInWayBack, anyBundleOfTickets[i].segments[1].duration);
    /*******/
    const txtTransfersBack = back.querySelector(".txt-transfers");
    setTxtTransfers(
      txtTransfersBack,
      anyBundleOfTickets[i].segments[1].stops.length
    );
    /*******/
    const transfersBack = back.querySelector(".transfers");
    setTransfers(transfersBack, anyBundleOfTickets[i].segments[1].stops);
    let t = ticket.cloneNode(true);
    listTickets.append(t);
  }
  state.increment += 5;
};

/*добавляем обработчики для фильтрации билетов по количеству пересадок*/
let eventCheckboxFilterTransfers = (renderArrayTickets) => {
  eventClickFilter(renderArrayTickets);
  buttonBottom.removeEventListener("click", wrapperActiveBottomButton);
  buttonBottom.addEventListener(
    "click",
    (wrapperActiveBottomButton = () => {
      activeBottomButton(renderArrayTickets);
    })
  );
  topFilter(renderArrayTickets);
};
let eventClickFilterTransfer = (checkboxInFilterTransfer) => {
  if (checkboxInFilterTransfer.classList.contains("all")) {
    //ВСЕ
    eventClickFilter(state.ticket);
    topFilter(state.ticket);
  } else if (checkboxInFilterTransfer.classList.contains("no_transfer")) {
    //БЕЗ ПЕРЕСАДОК
    let renderArrayTickets = [];
    state.ticket.forEach((elem) => {
      if (elem.segments[0].stops.length + elem.segments[1].stops.length == 0) {
        renderArrayTickets.push(elem);
      }
    });
    eventCheckboxFilterTransfers(renderArrayTickets);
  } else if (checkboxInFilterTransfer.classList.contains("one_transfer")) {
    //ОДНА ПЕРЕСАДКА
    let renderArrayTickets = [];
    state.ticket.forEach((elem) => {
      if (elem.segments[0].stops.length + elem.segments[1].stops.length == 1) {
        renderArrayTickets.push(elem);
      }
    });
    eventCheckboxFilterTransfers(renderArrayTickets);
  } else if (checkboxInFilterTransfer.classList.contains("two_transfer")) {
    //ДВЕ ПЕРЕСАДКИ
    let renderArrayTickets = [];
    state.ticket.forEach((elem) => {
      if (elem.segments[0].stops.length + elem.segments[1].stops.length == 2) {
        renderArrayTickets.push(elem);
      }
    });
    eventCheckboxFilterTransfers(renderArrayTickets);
  } else if (checkboxInFilterTransfer.classList.contains("free_transfer")) {
    //ТРИ ПЕРЕСАДКИ
    let renderArrayTickets = [];
    state.ticket.forEach((elem) => {
      if (elem.segments[0].stops.length + elem.segments[1].stops.length == 3) {
        renderArrayTickets.push(elem);
      }
    });
    eventCheckboxFilterTransfers(renderArrayTickets);
  }
};
let wrappereventClickFilterTransfer;
allCheckboxesFilterTransfer.forEach(function (checkboxInFilterTransfer) {
  checkboxInFilterTransfer.addEventListener(
    "click",
    (wrappereventClickFilterTransfer = () => {
      eventClickFilterTransfer(checkboxInFilterTransfer);
    })
  );
});
let localTicets = [
  {
    price: 48699,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:44:00.000Z",
        stops: ["HKG", "SIN", "AUH"],
        duration: 787,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:08:00.000Z",
        stops: ["AUH", "SHA", "HKG"],
        duration: 887,
      },
    ],
  },
  {
    price: 30914,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:57:00.000Z",
        stops: ["SIN"],
        duration: 889,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:33:00.000Z",
        stops: [],
        duration: 1437,
      },
    ],
  },
  {
    price: 52666,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:31:00.000Z",
        stops: ["BKK"],
        duration: 1801,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:43:00.000Z",
        stops: ["BKK"],
        duration: 1575,
      },
    ],
  },
  {
    price: 99251,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:15:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 1297,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:38:00.000Z",
        stops: ["KUL", "HKG"],
        duration: 1172,
      },
    ],
  },
  {
    price: 44743,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:14:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1932,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:46:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 940,
      },
    ],
  },
  {
    price: 81033,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:47:00.000Z",
        stops: ["KUL", "HKG"],
        duration: 1081,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:30:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 1053,
      },
    ],
  },
  {
    price: 96014,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:25:00.000Z",
        stops: ["BKK", "IST", "DXB"],
        duration: 1639,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:09:00.000Z",
        stops: ["IST", "HKG"],
        duration: 625,
      },
    ],
  },
  {
    price: 92773,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:00:00.000Z",
        stops: [],
        duration: 1517,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:11:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 707,
      },
    ],
  },
  {
    price: 15476,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:39:00.000Z",
        stops: [],
        duration: 839,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:36:00.000Z",
        stops: ["SIN", "IST", "HKG"],
        duration: 1182,
      },
    ],
  },
  {
    price: 52268,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:49:00.000Z",
        stops: [],
        duration: 1662,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:44:00.000Z",
        stops: ["BKK", "AUH", "DXB"],
        duration: 1391,
      },
    ],
  },
  {
    price: 47635,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:55:00.000Z",
        stops: ["SHA", "SIN", "KUL"],
        duration: 1127,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:52:00.000Z",
        stops: [],
        duration: 1466,
      },
    ],
  },
  {
    price: 18756,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:01:00.000Z",
        stops: ["HKG", "SHA", "DXB"],
        duration: 1762,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:48:00.000Z",
        stops: ["HKG", "DXB"],
        duration: 1753,
      },
    ],
  },
  {
    price: 86653,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:31:00.000Z",
        stops: ["IST"],
        duration: 1136,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:44:00.000Z",
        stops: [],
        duration: 1859,
      },
    ],
  },
  {
    price: 57265,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:49:00.000Z",
        stops: ["IST", "SIN", "KUL"],
        duration: 1736,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:55:00.000Z",
        stops: ["DXB"],
        duration: 1273,
      },
    ],
  },
  {
    price: 86875,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:32:00.000Z",
        stops: [],
        duration: 1879,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:19:00.000Z",
        stops: ["HKG"],
        duration: 934,
      },
    ],
  },
  {
    price: 23851,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:46:00.000Z",
        stops: ["IST", "HKG", "KUL"],
        duration: 795,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:07:00.000Z",
        stops: ["IST", "DXB"],
        duration: 778,
      },
    ],
  },
  {
    price: 85950,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:19:00.000Z",
        stops: [],
        duration: 748,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:08:00.000Z",
        stops: ["KUL", "AUH", "SHA"],
        duration: 720,
      },
    ],
  },
  {
    price: 29494,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:36:00.000Z",
        stops: ["IST", "KUL"],
        duration: 1960,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:49:00.000Z",
        stops: ["BKK"],
        duration: 1571,
      },
    ],
  },
  {
    price: 85077,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:05:00.000Z",
        stops: ["HKG"],
        duration: 1557,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:20:00.000Z",
        stops: ["SIN", "SHA"],
        duration: 1123,
      },
    ],
  },
  {
    price: 63708,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:54:00.000Z",
        stops: ["DXB", "IST"],
        duration: 1555,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:36:00.000Z",
        stops: [],
        duration: 680,
      },
    ],
  },
  {
    price: 40660,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:51:00.000Z",
        stops: [],
        duration: 961,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:01:00.000Z",
        stops: ["AUH"],
        duration: 1084,
      },
    ],
  },
  {
    price: 43552,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:35:00.000Z",
        stops: ["SHA", "HKG", "KUL"],
        duration: 1801,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:39:00.000Z",
        stops: [],
        duration: 1201,
      },
    ],
  },
  {
    price: 26751,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:09:00.000Z",
        stops: [],
        duration: 1746,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:27:00.000Z",
        stops: ["BKK"],
        duration: 1988,
      },
    ],
  },
  {
    price: 75696,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:12:00.000Z",
        stops: ["AUH", "IST"],
        duration: 1293,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:29:00.000Z",
        stops: ["KUL", "SIN", "HKG"],
        duration: 1664,
      },
    ],
  },
  {
    price: 85873,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:24:00.000Z",
        stops: ["BKK", "KUL"],
        duration: 1737,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:20:00.000Z",
        stops: [],
        duration: 1726,
      },
    ],
  },
  {
    price: 33083,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:47:00.000Z",
        stops: ["SIN", "IST"],
        duration: 716,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:01:00.000Z",
        stops: ["IST"],
        duration: 1155,
      },
    ],
  },
  {
    price: 98820,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:48:00.000Z",
        stops: ["SIN"],
        duration: 924,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:19:00.000Z",
        stops: ["HKG"],
        duration: 940,
      },
    ],
  },
  {
    price: 74709,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:26:00.000Z",
        stops: ["DXB", "SHA", "AUH"],
        duration: 793,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:00:00.000Z",
        stops: ["IST", "SIN", "DXB"],
        duration: 761,
      },
    ],
  },
  {
    price: 21592,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:04:00.000Z",
        stops: [],
        duration: 1465,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:26:00.000Z",
        stops: ["HKG"],
        duration: 950,
      },
    ],
  },
  {
    price: 55775,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:25:00.000Z",
        stops: ["HKG", "AUH", "SHA"],
        duration: 1295,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:20:00.000Z",
        stops: ["IST", "SIN"],
        duration: 1734,
      },
    ],
  },
  {
    price: 21138,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:00:00.000Z",
        stops: ["BKK", "SIN", "SHA"],
        duration: 1637,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:56:00.000Z",
        stops: ["HKG", "DXB", "KUL"],
        duration: 665,
      },
    ],
  },
  {
    price: 52615,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:37:00.000Z",
        stops: ["SHA"],
        duration: 1115,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:43:00.000Z",
        stops: ["DXB"],
        duration: 1030,
      },
    ],
  },
  {
    price: 35671,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:38:00.000Z",
        stops: [],
        duration: 1901,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:36:00.000Z",
        stops: [],
        duration: 714,
      },
    ],
  },
  {
    price: 54709,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:39:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 1450,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:28:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1309,
      },
    ],
  },
  {
    price: 77937,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:32:00.000Z",
        stops: ["KUL"],
        duration: 1980,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:21:00.000Z",
        stops: [],
        duration: 896,
      },
    ],
  },
  {
    price: 75925,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:50:00.000Z",
        stops: [],
        duration: 1990,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:03:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 628,
      },
    ],
  },
  {
    price: 40450,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:45:00.000Z",
        stops: ["SHA"],
        duration: 1625,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:35:00.000Z",
        stops: [],
        duration: 1931,
      },
    ],
  },
  {
    price: 53556,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:51:00.000Z",
        stops: [],
        duration: 1501,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:43:00.000Z",
        stops: ["IST"],
        duration: 1336,
      },
    ],
  },
  {
    price: 38007,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:20:00.000Z",
        stops: ["AUH", "HKG"],
        duration: 1838,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:45:00.000Z",
        stops: ["DXB", "BKK", "SHA"],
        duration: 874,
      },
    ],
  },
  {
    price: 35748,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:58:00.000Z",
        stops: ["IST", "SIN", "SHA"],
        duration: 664,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:17:00.000Z",
        stops: ["AUH"],
        duration: 1999,
      },
    ],
  },
  {
    price: 59904,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:39:00.000Z",
        stops: ["BKK"],
        duration: 728,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:10:00.000Z",
        stops: ["IST"],
        duration: 1728,
      },
    ],
  },
  {
    price: 27320,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:09:00.000Z",
        stops: ["KUL", "SIN"],
        duration: 1557,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:13:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 1167,
      },
    ],
  },
  {
    price: 79560,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:52:00.000Z",
        stops: [],
        duration: 645,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:38:00.000Z",
        stops: ["KUL", "BKK", "IST"],
        duration: 1157,
      },
    ],
  },
  {
    price: 55117,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:22:00.000Z",
        stops: [],
        duration: 975,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:29:00.000Z",
        stops: ["SHA"],
        duration: 1824,
      },
    ],
  },
  {
    price: 56120,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:51:00.000Z",
        stops: ["AUH", "SHA"],
        duration: 802,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:07:00.000Z",
        stops: ["BKK", "SHA"],
        duration: 877,
      },
    ],
  },
  {
    price: 53878,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:32:00.000Z",
        stops: ["AUH", "DXB", "SHA"],
        duration: 1928,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:00:00.000Z",
        stops: ["IST", "BKK"],
        duration: 941,
      },
    ],
  },
  {
    price: 49270,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:26:00.000Z",
        stops: ["SHA", "IST", "SIN"],
        duration: 1504,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:21:00.000Z",
        stops: [],
        duration: 982,
      },
    ],
  },
  {
    price: 71955,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:55:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 646,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:27:00.000Z",
        stops: [],
        duration: 1607,
      },
    ],
  },
  {
    price: 32938,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:44:00.000Z",
        stops: ["AUH"],
        duration: 830,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:38:00.000Z",
        stops: ["BKK", "SIN"],
        duration: 987,
      },
    ],
  },
  {
    price: 78694,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:22:00.000Z",
        stops: ["AUH", "DXB"],
        duration: 1198,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:49:00.000Z",
        stops: ["SIN", "HKG", "DXB"],
        duration: 1354,
      },
    ],
  },
  {
    price: 21260,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:21:00.000Z",
        stops: ["SHA", "SIN"],
        duration: 1042,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:08:00.000Z",
        stops: [],
        duration: 1640,
      },
    ],
  },
  {
    price: 89192,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:01:00.000Z",
        stops: [],
        duration: 1961,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:28:00.000Z",
        stops: [],
        duration: 1571,
      },
    ],
  },
  {
    price: 43351,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:21:00.000Z",
        stops: ["BKK", "IST", "AUH"],
        duration: 1941,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:13:00.000Z",
        stops: [],
        duration: 648,
      },
    ],
  },
  {
    price: 98628,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:46:00.000Z",
        stops: ["SHA"],
        duration: 763,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:23:00.000Z",
        stops: ["HKG", "DXB"],
        duration: 1879,
      },
    ],
  },
  {
    price: 66686,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:32:00.000Z",
        stops: ["IST", "SHA", "AUH"],
        duration: 819,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:02:00.000Z",
        stops: [],
        duration: 1644,
      },
    ],
  },
  {
    price: 96494,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:15:00.000Z",
        stops: ["HKG"],
        duration: 1570,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:58:00.000Z",
        stops: ["IST", "SIN", "SHA"],
        duration: 698,
      },
    ],
  },
  {
    price: 34126,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:01:00.000Z",
        stops: ["BKK", "DXB", "HKG"],
        duration: 913,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:51:00.000Z",
        stops: [],
        duration: 733,
      },
    ],
  },
  {
    price: 60620,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:01:00.000Z",
        stops: [],
        duration: 1749,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:02:00.000Z",
        stops: ["IST", "SHA"],
        duration: 1899,
      },
    ],
  },
  {
    price: 57917,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:18:00.000Z",
        stops: [],
        duration: 1853,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:18:00.000Z",
        stops: [],
        duration: 1507,
      },
    ],
  },
  {
    price: 48186,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:39:00.000Z",
        stops: [],
        duration: 1237,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:01:00.000Z",
        stops: ["KUL", "IST", "BKK"],
        duration: 1775,
      },
    ],
  },
  {
    price: 98268,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:52:00.000Z",
        stops: [],
        duration: 1802,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:24:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 1880,
      },
    ],
  },
  {
    price: 25204,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:49:00.000Z",
        stops: ["KUL", "SHA", "BKK"],
        duration: 1962,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:59:00.000Z",
        stops: ["KUL", "AUH", "HKG"],
        duration: 1702,
      },
    ],
  },
  {
    price: 84519,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:02:00.000Z",
        stops: ["AUH"],
        duration: 1172,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:07:00.000Z",
        stops: ["DXB"],
        duration: 1544,
      },
    ],
  },
  {
    price: 52707,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:09:00.000Z",
        stops: [],
        duration: 903,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:48:00.000Z",
        stops: ["SHA", "SIN"],
        duration: 829,
      },
    ],
  },
  {
    price: 43727,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:29:00.000Z",
        stops: ["KUL"],
        duration: 1035,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:58:00.000Z",
        stops: ["HKG", "SIN", "BKK"],
        duration: 1862,
      },
    ],
  },
  {
    price: 94340,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:21:00.000Z",
        stops: [],
        duration: 1316,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:51:00.000Z",
        stops: ["AUH", "SIN"],
        duration: 1530,
      },
    ],
  },
  {
    price: 56213,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:07:00.000Z",
        stops: ["DXB", "IST", "AUH"],
        duration: 1277,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:40:00.000Z",
        stops: ["DXB", "HKG"],
        duration: 1033,
      },
    ],
  },
  {
    price: 98635,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:01:00.000Z",
        stops: [],
        duration: 912,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:59:00.000Z",
        stops: ["KUL", "BKK", "SHA"],
        duration: 634,
      },
    ],
  },
  {
    price: 56163,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:22:00.000Z",
        stops: ["KUL", "SHA", "AUH"],
        duration: 1073,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:02:00.000Z",
        stops: ["IST", "SHA", "AUH"],
        duration: 737,
      },
    ],
  },
  {
    price: 82747,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:41:00.000Z",
        stops: ["SHA", "BKK", "KUL"],
        duration: 1443,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:04:00.000Z",
        stops: ["DXB", "SIN", "IST"],
        duration: 1430,
      },
    ],
  },
  {
    price: 57840,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:15:00.000Z",
        stops: ["DXB", "HKG"],
        duration: 1996,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:17:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 1539,
      },
    ],
  },
  {
    price: 79028,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:36:00.000Z",
        stops: ["IST"],
        duration: 1365,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:40:00.000Z",
        stops: ["HKG", "AUH", "IST"],
        duration: 810,
      },
    ],
  },
  {
    price: 18903,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:09:00.000Z",
        stops: [],
        duration: 1219,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:03:00.000Z",
        stops: ["SHA", "DXB", "HKG"],
        duration: 1273,
      },
    ],
  },
  {
    price: 49642,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:40:00.000Z",
        stops: [],
        duration: 1130,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:38:00.000Z",
        stops: [],
        duration: 1737,
      },
    ],
  },
  {
    price: 66447,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:33:00.000Z",
        stops: ["BKK", "IST"],
        duration: 936,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:07:00.000Z",
        stops: ["AUH"],
        duration: 1274,
      },
    ],
  },
  {
    price: 20141,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:04:00.000Z",
        stops: ["BKK"],
        duration: 806,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:00:00.000Z",
        stops: ["DXB", "KUL"],
        duration: 797,
      },
    ],
  },
  {
    price: 43124,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:48:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1122,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:02:00.000Z",
        stops: ["BKK", "SHA", "IST"],
        duration: 747,
      },
    ],
  },
  {
    price: 98847,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:36:00.000Z",
        stops: ["IST"],
        duration: 992,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:30:00.000Z",
        stops: ["BKK", "SHA"],
        duration: 1109,
      },
    ],
  },
  {
    price: 46540,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:28:00.000Z",
        stops: [],
        duration: 1538,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:52:00.000Z",
        stops: ["KUL", "HKG", "SHA"],
        duration: 1718,
      },
    ],
  },
  {
    price: 32102,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:26:00.000Z",
        stops: [],
        duration: 1807,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:52:00.000Z",
        stops: ["IST", "DXB"],
        duration: 1790,
      },
    ],
  },
  {
    price: 49738,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:20:00.000Z",
        stops: ["BKK"],
        duration: 1500,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:35:00.000Z",
        stops: ["BKK", "DXB"],
        duration: 641,
      },
    ],
  },
  {
    price: 47307,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:45:00.000Z",
        stops: [],
        duration: 1256,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:48:00.000Z",
        stops: ["SIN", "BKK", "SHA"],
        duration: 1352,
      },
    ],
  },
  {
    price: 64486,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:43:00.000Z",
        stops: [],
        duration: 1329,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:02:00.000Z",
        stops: [],
        duration: 1002,
      },
    ],
  },
  {
    price: 51391,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:04:00.000Z",
        stops: ["BKK"],
        duration: 841,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:22:00.000Z",
        stops: ["HKG", "AUH"],
        duration: 788,
      },
    ],
  },
  {
    price: 97688,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:45:00.000Z",
        stops: [],
        duration: 1260,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:40:00.000Z",
        stops: ["BKK", "HKG"],
        duration: 1335,
      },
    ],
  },
  {
    price: 43511,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:03:00.000Z",
        stops: ["IST", "DXB", "SIN"],
        duration: 1127,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:07:00.000Z",
        stops: ["KUL", "BKK", "IST"],
        duration: 1039,
      },
    ],
  },
  {
    price: 69998,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:01:00.000Z",
        stops: ["AUH"],
        duration: 1411,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:39:00.000Z",
        stops: ["IST", "AUH"],
        duration: 1795,
      },
    ],
  },
  {
    price: 65446,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:35:00.000Z",
        stops: [],
        duration: 1208,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:56:00.000Z",
        stops: ["AUH"],
        duration: 1551,
      },
    ],
  },
  {
    price: 73675,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:06:00.000Z",
        stops: [],
        duration: 1366,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:16:00.000Z",
        stops: ["IST"],
        duration: 1017,
      },
    ],
  },
  {
    price: 39437,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:24:00.000Z",
        stops: ["BKK", "AUH"],
        duration: 949,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:52:00.000Z",
        stops: ["DXB", "IST"],
        duration: 1415,
      },
    ],
  },
  {
    price: 15792,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:23:00.000Z",
        stops: ["SHA", "BKK", "AUH"],
        duration: 1516,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:44:00.000Z",
        stops: ["BKK", "SHA"],
        duration: 1584,
      },
    ],
  },
  {
    price: 73629,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:28:00.000Z",
        stops: ["KUL", "DXB", "SIN"],
        duration: 1828,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:48:00.000Z",
        stops: [],
        duration: 696,
      },
    ],
  },
  {
    price: 49423,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:56:00.000Z",
        stops: ["AUH", "KUL"],
        duration: 1408,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:06:00.000Z",
        stops: ["AUH", "SIN", "HKG"],
        duration: 1310,
      },
    ],
  },
  {
    price: 84598,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:25:00.000Z",
        stops: [],
        duration: 974,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:48:00.000Z",
        stops: [],
        duration: 668,
      },
    ],
  },
  {
    price: 46702,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:27:00.000Z",
        stops: [],
        duration: 810,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:05:00.000Z",
        stops: ["HKG", "KUL"],
        duration: 1367,
      },
    ],
  },
  {
    price: 26306,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:58:00.000Z",
        stops: ["SIN"],
        duration: 1011,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:53:00.000Z",
        stops: ["SHA", "IST"],
        duration: 1446,
      },
    ],
  },
  {
    price: 37770,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:49:00.000Z",
        stops: ["BKK", "IST", "SHA"],
        duration: 1381,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:31:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1350,
      },
    ],
  },
  {
    price: 73204,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:02:00.000Z",
        stops: ["AUH", "KUL", "BKK"],
        duration: 1386,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:14:00.000Z",
        stops: [],
        duration: 1515,
      },
    ],
  },
  {
    price: 47142,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:29:00.000Z",
        stops: ["AUH", "SHA", "SIN"],
        duration: 1395,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:49:00.000Z",
        stops: ["SIN", "DXB", "HKG"],
        duration: 1680,
      },
    ],
  },
  {
    price: 84979,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:27:00.000Z",
        stops: ["DXB"],
        duration: 1434,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:32:00.000Z",
        stops: ["DXB"],
        duration: 1382,
      },
    ],
  },
  {
    price: 32309,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:08:00.000Z",
        stops: ["SHA", "KUL", "AUH"],
        duration: 1868,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:23:00.000Z",
        stops: ["HKG"],
        duration: 670,
      },
    ],
  },
  {
    price: 42418,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:44:00.000Z",
        stops: [],
        duration: 855,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:27:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1987,
      },
    ],
  },
  {
    price: 55201,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:24:00.000Z",
        stops: [],
        duration: 1900,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:46:00.000Z",
        stops: ["SHA", "HKG"],
        duration: 1696,
      },
    ],
  },
  {
    price: 37413,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:09:00.000Z",
        stops: ["DXB", "HKG"],
        duration: 1691,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:49:00.000Z",
        stops: [],
        duration: 1659,
      },
    ],
  },
  {
    price: 37248,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:39:00.000Z",
        stops: [],
        duration: 1346,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:40:00.000Z",
        stops: ["AUH", "BKK"],
        duration: 639,
      },
    ],
  },
  {
    price: 82487,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:44:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 846,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:59:00.000Z",
        stops: ["DXB", "AUH", "SIN"],
        duration: 1839,
      },
    ],
  },
  {
    price: 82167,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:37:00.000Z",
        stops: ["AUH"],
        duration: 625,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:52:00.000Z",
        stops: ["AUH"],
        duration: 859,
      },
    ],
  },
  {
    price: 18515,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:13:00.000Z",
        stops: ["KUL"],
        duration: 1854,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:52:00.000Z",
        stops: ["KUL", "AUH", "SIN"],
        duration: 1902,
      },
    ],
  },
  {
    price: 47686,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:33:00.000Z",
        stops: ["BKK", "AUH"],
        duration: 1404,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:59:00.000Z",
        stops: ["HKG"],
        duration: 1339,
      },
    ],
  },
  {
    price: 98759,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:54:00.000Z",
        stops: ["SHA", "HKG", "AUH"],
        duration: 995,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:40:00.000Z",
        stops: [],
        duration: 1519,
      },
    ],
  },
  {
    price: 83667,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:56:00.000Z",
        stops: ["KUL"],
        duration: 902,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:39:00.000Z",
        stops: ["IST"],
        duration: 722,
      },
    ],
  },
  {
    price: 87425,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:15:00.000Z",
        stops: ["AUH", "DXB", "IST"],
        duration: 1729,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:58:00.000Z",
        stops: ["SIN", "SHA"],
        duration: 1898,
      },
    ],
  },
  {
    price: 71635,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:17:00.000Z",
        stops: ["HKG", "DXB"],
        duration: 1583,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:54:00.000Z",
        stops: ["BKK", "AUH"],
        duration: 1146,
      },
    ],
  },
  {
    price: 72272,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:26:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 1918,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:34:00.000Z",
        stops: ["SIN", "KUL"],
        duration: 1405,
      },
    ],
  },
  {
    price: 55702,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:28:00.000Z",
        stops: ["BKK", "SHA"],
        duration: 1987,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:46:00.000Z",
        stops: ["AUH"],
        duration: 1210,
      },
    ],
  },
  {
    price: 33654,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:53:00.000Z",
        stops: [],
        duration: 710,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:28:00.000Z",
        stops: ["KUL", "BKK", "HKG"],
        duration: 1848,
      },
    ],
  },
  {
    price: 56510,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:57:00.000Z",
        stops: ["SIN", "BKK", "HKG"],
        duration: 663,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:19:00.000Z",
        stops: ["IST"],
        duration: 1964,
      },
    ],
  },
  {
    price: 53017,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:31:00.000Z",
        stops: [],
        duration: 1912,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:28:00.000Z",
        stops: ["DXB"],
        duration: 1246,
      },
    ],
  },
  {
    price: 48882,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:33:00.000Z",
        stops: [],
        duration: 1258,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:37:00.000Z",
        stops: [],
        duration: 787,
      },
    ],
  },
  {
    price: 37125,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:31:00.000Z",
        stops: ["KUL"],
        duration: 1307,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:39:00.000Z",
        stops: ["HKG", "AUH", "DXB"],
        duration: 1182,
      },
    ],
  },
  {
    price: 21996,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:12:00.000Z",
        stops: [],
        duration: 647,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:02:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 1457,
      },
    ],
  },
  {
    price: 88915,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:33:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1179,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:17:00.000Z",
        stops: ["KUL", "HKG", "SIN"],
        duration: 1797,
      },
    ],
  },
  {
    price: 18511,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:43:00.000Z",
        stops: ["AUH", "HKG", "KUL"],
        duration: 719,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:43:00.000Z",
        stops: ["KUL"],
        duration: 1614,
      },
    ],
  },
  {
    price: 85961,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:11:00.000Z",
        stops: [],
        duration: 1513,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:40:00.000Z",
        stops: ["HKG", "DXB"],
        duration: 1114,
      },
    ],
  },
  {
    price: 80187,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:05:00.000Z",
        stops: ["KUL", "DXB", "SHA"],
        duration: 1553,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:20:00.000Z",
        stops: [],
        duration: 1384,
      },
    ],
  },
  {
    price: 46120,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:16:00.000Z",
        stops: ["AUH", "SIN"],
        duration: 1735,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:56:00.000Z",
        stops: ["BKK"],
        duration: 1332,
      },
    ],
  },
  {
    price: 30231,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:55:00.000Z",
        stops: ["DXB"],
        duration: 1660,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:49:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 1691,
      },
    ],
  },
  {
    price: 37020,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:31:00.000Z",
        stops: ["SHA", "BKK", "AUH"],
        duration: 1175,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:54:00.000Z",
        stops: ["AUH", "HKG", "KUL"],
        duration: 1091,
      },
    ],
  },
  {
    price: 60157,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:57:00.000Z",
        stops: ["SHA", "IST", "KUL"],
        duration: 1587,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:38:00.000Z",
        stops: ["SHA"],
        duration: 803,
      },
    ],
  },
  {
    price: 70759,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:11:00.000Z",
        stops: ["HKG", "IST", "BKK"],
        duration: 1211,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:12:00.000Z",
        stops: ["KUL", "DXB", "SIN"],
        duration: 1094,
      },
    ],
  },
  {
    price: 32518,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:56:00.000Z",
        stops: ["BKK"],
        duration: 1870,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:24:00.000Z",
        stops: ["BKK"],
        duration: 1317,
      },
    ],
  },
  {
    price: 27590,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:13:00.000Z",
        stops: ["DXB", "KUL", "HKG"],
        duration: 1351,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:29:00.000Z",
        stops: ["AUH", "SHA", "SIN"],
        duration: 1821,
      },
    ],
  },
  {
    price: 28179,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:49:00.000Z",
        stops: ["DXB", "KUL", "HKG"],
        duration: 1218,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:53:00.000Z",
        stops: ["DXB", "SHA"],
        duration: 1108,
      },
    ],
  },
  {
    price: 43628,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:51:00.000Z",
        stops: ["IST", "SHA"],
        duration: 1206,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:43:00.000Z",
        stops: ["AUH", "SHA", "SIN"],
        duration: 976,
      },
    ],
  },
  {
    price: 38467,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:39:00.000Z",
        stops: [],
        duration: 1701,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:35:00.000Z",
        stops: ["BKK"],
        duration: 1870,
      },
    ],
  },
  {
    price: 80990,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:57:00.000Z",
        stops: ["IST"],
        duration: 1377,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:18:00.000Z",
        stops: ["KUL", "SIN"],
        duration: 1835,
      },
    ],
  },
  {
    price: 88781,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:12:00.000Z",
        stops: ["SIN"],
        duration: 857,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:41:00.000Z",
        stops: ["BKK"],
        duration: 1567,
      },
    ],
  },
  {
    price: 87563,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:36:00.000Z",
        stops: [],
        duration: 1228,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:48:00.000Z",
        stops: [],
        duration: 932,
      },
    ],
  },
  {
    price: 19087,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:59:00.000Z",
        stops: ["HKG", "SIN"],
        duration: 1493,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:25:00.000Z",
        stops: [],
        duration: 1001,
      },
    ],
  },
  {
    price: 59923,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:42:00.000Z",
        stops: ["AUH"],
        duration: 1953,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:57:00.000Z",
        stops: ["DXB"],
        duration: 1283,
      },
    ],
  },
  {
    price: 88662,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:09:00.000Z",
        stops: ["SIN", "HKG"],
        duration: 818,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:57:00.000Z",
        stops: ["AUH", "BKK"],
        duration: 1423,
      },
    ],
  },
  {
    price: 64712,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:07:00.000Z",
        stops: ["HKG", "BKK", "IST"],
        duration: 1265,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:09:00.000Z",
        stops: ["HKG"],
        duration: 1079,
      },
    ],
  },
  {
    price: 59563,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:44:00.000Z",
        stops: ["SIN", "DXB", "AUH"],
        duration: 1159,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:40:00.000Z",
        stops: ["BKK", "SIN"],
        duration: 1936,
      },
    ],
  },
  {
    price: 69872,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:54:00.000Z",
        stops: ["SHA"],
        duration: 1588,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:48:00.000Z",
        stops: ["SIN"],
        duration: 1136,
      },
    ],
  },
  {
    price: 83585,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:53:00.000Z",
        stops: [],
        duration: 1014,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:22:00.000Z",
        stops: ["AUH", "IST"],
        duration: 806,
      },
    ],
  },
  {
    price: 72239,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:04:00.000Z",
        stops: ["SHA", "IST", "KUL"],
        duration: 1816,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:37:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 1781,
      },
    ],
  },
  {
    price: 32011,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:26:00.000Z",
        stops: ["IST", "BKK", "DXB"],
        duration: 1617,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:21:00.000Z",
        stops: ["IST", "HKG"],
        duration: 756,
      },
    ],
  },
  {
    price: 69723,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:02:00.000Z",
        stops: ["SIN", "KUL"],
        duration: 1362,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:23:00.000Z",
        stops: [],
        duration: 1153,
      },
    ],
  },
  {
    price: 23721,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:31:00.000Z",
        stops: ["KUL", "SIN"],
        duration: 1346,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:35:00.000Z",
        stops: ["KUL", "SHA", "IST"],
        duration: 1113,
      },
    ],
  },
  {
    price: 68295,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:33:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 1869,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:05:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1811,
      },
    ],
  },
  {
    price: 57247,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:17:00.000Z",
        stops: [],
        duration: 1999,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:45:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 833,
      },
    ],
  },
  {
    price: 70119,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:00:00.000Z",
        stops: [],
        duration: 1051,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:28:00.000Z",
        stops: ["KUL", "DXB", "BKK"],
        duration: 1360,
      },
    ],
  },
  {
    price: 88948,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:29:00.000Z",
        stops: ["DXB", "IST", "HKG"],
        duration: 1046,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:49:00.000Z",
        stops: ["DXB", "AUH"],
        duration: 944,
      },
    ],
  },
  {
    price: 16825,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:23:00.000Z",
        stops: [],
        duration: 886,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:50:00.000Z",
        stops: ["AUH"],
        duration: 1846,
      },
    ],
  },
  {
    price: 48799,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:10:00.000Z",
        stops: [],
        duration: 1860,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:22:00.000Z",
        stops: ["BKK", "IST"],
        duration: 1363,
      },
    ],
  },
  {
    price: 40865,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:46:00.000Z",
        stops: [],
        duration: 1509,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:40:00.000Z",
        stops: [],
        duration: 1632,
      },
    ],
  },
  {
    price: 68902,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:52:00.000Z",
        stops: ["BKK"],
        duration: 1360,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:50:00.000Z",
        stops: ["BKK"],
        duration: 1627,
      },
    ],
  },
  {
    price: 37887,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:40:00.000Z",
        stops: ["BKK", "SHA", "HKG"],
        duration: 1245,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:10:00.000Z",
        stops: [],
        duration: 1134,
      },
    ],
  },
  {
    price: 21756,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:37:00.000Z",
        stops: ["KUL"],
        duration: 923,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:40:00.000Z",
        stops: ["IST", "AUH", "KUL"],
        duration: 1134,
      },
    ],
  },
  {
    price: 20937,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:52:00.000Z",
        stops: ["BKK"],
        duration: 975,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:44:00.000Z",
        stops: [],
        duration: 1630,
      },
    ],
  },
  {
    price: 61938,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:08:00.000Z",
        stops: ["IST"],
        duration: 1885,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:51:00.000Z",
        stops: ["AUH", "KUL", "SIN"],
        duration: 1695,
      },
    ],
  },
  {
    price: 71216,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:47:00.000Z",
        stops: [],
        duration: 1148,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:37:00.000Z",
        stops: ["AUH", "IST", "DXB"],
        duration: 781,
      },
    ],
  },
  {
    price: 32919,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:57:00.000Z",
        stops: ["SHA", "SIN", "KUL"],
        duration: 910,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:09:00.000Z",
        stops: ["SHA", "DXB", "KUL"],
        duration: 897,
      },
    ],
  },
  {
    price: 29541,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:47:00.000Z",
        stops: ["AUH", "DXB", "SIN"],
        duration: 1761,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:58:00.000Z",
        stops: ["SIN", "IST"],
        duration: 611,
      },
    ],
  },
  {
    price: 81310,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:35:00.000Z",
        stops: ["SHA", "IST"],
        duration: 678,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:58:00.000Z",
        stops: ["SIN", "SHA", "HKG"],
        duration: 1103,
      },
    ],
  },
  {
    price: 24380,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:25:00.000Z",
        stops: ["KUL"],
        duration: 1483,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:09:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1556,
      },
    ],
  },
  {
    price: 89269,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:02:00.000Z",
        stops: ["AUH", "SHA"],
        duration: 1899,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:50:00.000Z",
        stops: ["DXB", "SIN", "AUH"],
        duration: 1696,
      },
    ],
  },
  {
    price: 91342,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:55:00.000Z",
        stops: ["DXB"],
        duration: 1684,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:56:00.000Z",
        stops: ["SIN", "AUH", "IST"],
        duration: 718,
      },
    ],
  },
  {
    price: 28854,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:36:00.000Z",
        stops: ["AUH"],
        duration: 853,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:15:00.000Z",
        stops: ["KUL", "SHA", "IST"],
        duration: 1335,
      },
    ],
  },
  {
    price: 83066,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:18:00.000Z",
        stops: ["DXB", "KUL"],
        duration: 911,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:36:00.000Z",
        stops: ["IST", "KUL", "SIN"],
        duration: 1578,
      },
    ],
  },
  {
    price: 98711,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:47:00.000Z",
        stops: ["BKK", "SHA", "SIN"],
        duration: 1355,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:10:00.000Z",
        stops: ["DXB", "AUH", "IST"],
        duration: 1270,
      },
    ],
  },
  {
    price: 80588,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:19:00.000Z",
        stops: ["SHA", "KUL"],
        duration: 1782,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:41:00.000Z",
        stops: ["IST", "SHA", "HKG"],
        duration: 1968,
      },
    ],
  },
  {
    price: 48204,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:08:00.000Z",
        stops: ["BKK", "KUL", "DXB"],
        duration: 1015,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:58:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1161,
      },
    ],
  },
  {
    price: 82464,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:10:00.000Z",
        stops: ["SIN"],
        duration: 1864,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:16:00.000Z",
        stops: ["IST", "KUL"],
        duration: 1391,
      },
    ],
  },
  {
    price: 99070,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:32:00.000Z",
        stops: ["DXB", "AUH", "SHA"],
        duration: 1385,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:58:00.000Z",
        stops: ["AUH"],
        duration: 1053,
      },
    ],
  },
  {
    price: 76551,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:46:00.000Z",
        stops: [],
        duration: 1777,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:37:00.000Z",
        stops: [],
        duration: 1855,
      },
    ],
  },
  {
    price: 91367,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:10:00.000Z",
        stops: ["BKK", "HKG"],
        duration: 1896,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:46:00.000Z",
        stops: ["DXB", "SHA", "AUH"],
        duration: 1989,
      },
    ],
  },
  {
    price: 34553,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:10:00.000Z",
        stops: ["SIN", "IST"],
        duration: 654,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:17:00.000Z",
        stops: ["KUL"],
        duration: 1464,
      },
    ],
  },
  {
    price: 87430,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:29:00.000Z",
        stops: [],
        duration: 863,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:15:00.000Z",
        stops: ["AUH"],
        duration: 1902,
      },
    ],
  },
  {
    price: 93106,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:24:00.000Z",
        stops: ["IST", "SIN"],
        duration: 765,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:59:00.000Z",
        stops: ["SHA", "HKG", "AUH"],
        duration: 1340,
      },
    ],
  },
  {
    price: 71054,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:32:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 1727,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:27:00.000Z",
        stops: ["SIN", "DXB", "IST"],
        duration: 1912,
      },
    ],
  },
  {
    price: 51039,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:39:00.000Z",
        stops: ["AUH", "HKG"],
        duration: 1041,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:42:00.000Z",
        stops: [],
        duration: 1160,
      },
    ],
  },
  {
    price: 96970,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:45:00.000Z",
        stops: ["AUH", "HKG", "SIN"],
        duration: 1560,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:20:00.000Z",
        stops: [],
        duration: 1623,
      },
    ],
  },
  {
    price: 55159,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:39:00.000Z",
        stops: [],
        duration: 823,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:29:00.000Z",
        stops: ["HKG", "SIN"],
        duration: 1393,
      },
    ],
  },
  {
    price: 38751,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:42:00.000Z",
        stops: ["SHA"],
        duration: 1770,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:53:00.000Z",
        stops: ["IST", "HKG", "KUL"],
        duration: 725,
      },
    ],
  },
  {
    price: 74681,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:16:00.000Z",
        stops: ["BKK", "KUL", "SIN"],
        duration: 953,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:44:00.000Z",
        stops: ["SIN"],
        duration: 1379,
      },
    ],
  },
  {
    price: 55260,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:41:00.000Z",
        stops: ["KUL", "DXB", "BKK"],
        duration: 1663,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:43:00.000Z",
        stops: [],
        duration: 979,
      },
    ],
  },
  {
    price: 77810,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:43:00.000Z",
        stops: ["DXB", "IST", "SIN"],
        duration: 1544,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:16:00.000Z",
        stops: ["AUH", "SHA"],
        duration: 1951,
      },
    ],
  },
  {
    price: 38288,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:07:00.000Z",
        stops: [],
        duration: 881,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:51:00.000Z",
        stops: ["SIN"],
        duration: 1326,
      },
    ],
  },
  {
    price: 76944,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:36:00.000Z",
        stops: ["DXB", "SHA"],
        duration: 1770,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:09:00.000Z",
        stops: ["IST"],
        duration: 1975,
      },
    ],
  },
  {
    price: 29971,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:01:00.000Z",
        stops: ["HKG", "DXB", "BKK"],
        duration: 1597,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:13:00.000Z",
        stops: ["BKK", "SIN"],
        duration: 1909,
      },
    ],
  },
  {
    price: 17718,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:07:00.000Z",
        stops: ["BKK", "KUL"],
        duration: 1951,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:18:00.000Z",
        stops: [],
        duration: 1511,
      },
    ],
  },
  {
    price: 34971,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:04:00.000Z",
        stops: ["SHA", "IST"],
        duration: 1249,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:13:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 1807,
      },
    ],
  },
  {
    price: 80551,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:31:00.000Z",
        stops: ["HKG"],
        duration: 1875,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:19:00.000Z",
        stops: ["IST"],
        duration: 1004,
      },
    ],
  },
  {
    price: 56534,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:16:00.000Z",
        stops: ["SIN"],
        duration: 877,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:08:00.000Z",
        stops: ["AUH", "BKK"],
        duration: 738,
      },
    ],
  },
  {
    price: 74658,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:51:00.000Z",
        stops: [],
        duration: 1081,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:26:00.000Z",
        stops: ["AUH", "SHA", "SIN"],
        duration: 669,
      },
    ],
  },
  {
    price: 79919,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:36:00.000Z",
        stops: [],
        duration: 1765,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:12:00.000Z",
        stops: ["IST"],
        duration: 1379,
      },
    ],
  },
  {
    price: 92455,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:21:00.000Z",
        stops: ["AUH", "SHA"],
        duration: 1092,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:24:00.000Z",
        stops: ["SHA"],
        duration: 1890,
      },
    ],
  },
  {
    price: 44713,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:02:00.000Z",
        stops: ["KUL"],
        duration: 723,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:31:00.000Z",
        stops: [],
        duration: 1893,
      },
    ],
  },
  {
    price: 70725,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:30:00.000Z",
        stops: ["HKG", "DXB", "AUH"],
        duration: 1800,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:58:00.000Z",
        stops: [],
        duration: 1789,
      },
    ],
  },
  {
    price: 80774,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:19:00.000Z",
        stops: [],
        duration: 1622,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:46:00.000Z",
        stops: ["BKK", "AUH"],
        duration: 1066,
      },
    ],
  },
  {
    price: 44031,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:22:00.000Z",
        stops: [],
        duration: 1509,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:29:00.000Z",
        stops: ["SHA", "HKG", "KUL"],
        duration: 1562,
      },
    ],
  },
  {
    price: 40751,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:39:00.000Z",
        stops: ["BKK", "DXB", "HKG"],
        duration: 705,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:04:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 1608,
      },
    ],
  },
  {
    price: 44491,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:05:00.000Z",
        stops: ["IST", "DXB"],
        duration: 691,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:55:00.000Z",
        stops: ["KUL", "SHA", "HKG"],
        duration: 1900,
      },
    ],
  },
  {
    price: 86177,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:23:00.000Z",
        stops: ["HKG", "SIN"],
        duration: 1322,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:38:00.000Z",
        stops: [],
        duration: 714,
      },
    ],
  },
  {
    price: 88228,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:47:00.000Z",
        stops: ["BKK"],
        duration: 982,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:39:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 932,
      },
    ],
  },
  {
    price: 23906,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:45:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 1229,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:40:00.000Z",
        stops: ["DXB"],
        duration: 856,
      },
    ],
  },
  {
    price: 68764,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:17:00.000Z",
        stops: ["AUH"],
        duration: 1669,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:57:00.000Z",
        stops: ["SIN"],
        duration: 1280,
      },
    ],
  },
  {
    price: 84260,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:43:00.000Z",
        stops: [],
        duration: 1950,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:53:00.000Z",
        stops: ["DXB", "SIN", "BKK"],
        duration: 1314,
      },
    ],
  },
  {
    price: 43197,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:13:00.000Z",
        stops: [],
        duration: 723,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:43:00.000Z",
        stops: ["SHA", "KUL", "HKG"],
        duration: 1084,
      },
    ],
  },
  {
    price: 71451,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:37:00.000Z",
        stops: ["SHA", "IST"],
        duration: 962,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:52:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 1245,
      },
    ],
  },
  {
    price: 54657,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:25:00.000Z",
        stops: [],
        duration: 624,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:25:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 1151,
      },
    ],
  },
  {
    price: 18489,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:05:00.000Z",
        stops: ["AUH", "KUL", "BKK"],
        duration: 630,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:43:00.000Z",
        stops: ["DXB", "AUH", "IST"],
        duration: 801,
      },
    ],
  },
  {
    price: 99713,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:14:00.000Z",
        stops: [],
        duration: 1925,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:46:00.000Z",
        stops: [],
        duration: 963,
      },
    ],
  },
  {
    price: 38601,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:23:00.000Z",
        stops: [],
        duration: 1074,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:30:00.000Z",
        stops: ["SIN"],
        duration: 1242,
      },
    ],
  },
  {
    price: 86487,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:34:00.000Z",
        stops: [],
        duration: 619,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:02:00.000Z",
        stops: ["HKG", "SIN"],
        duration: 1841,
      },
    ],
  },
  {
    price: 72526,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:11:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1319,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:25:00.000Z",
        stops: ["IST", "AUH"],
        duration: 881,
      },
    ],
  },
  {
    price: 33919,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:18:00.000Z",
        stops: ["HKG"],
        duration: 1955,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:40:00.000Z",
        stops: [],
        duration: 1001,
      },
    ],
  },
  {
    price: 38412,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:57:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 1423,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:24:00.000Z",
        stops: ["KUL"],
        duration: 993,
      },
    ],
  },
  {
    price: 39469,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:47:00.000Z",
        stops: ["DXB"],
        duration: 841,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:56:00.000Z",
        stops: ["IST", "SHA", "AUH"],
        duration: 1776,
      },
    ],
  },
  {
    price: 84233,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:22:00.000Z",
        stops: ["DXB", "KUL", "AUH"],
        duration: 1367,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:52:00.000Z",
        stops: ["HKG", "IST"],
        duration: 1722,
      },
    ],
  },
  {
    price: 41086,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:07:00.000Z",
        stops: ["SHA", "BKK", "SIN"],
        duration: 1165,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:47:00.000Z",
        stops: ["AUH", "SHA"],
        duration: 1337,
      },
    ],
  },
  {
    price: 85541,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:08:00.000Z",
        stops: [],
        duration: 1645,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:45:00.000Z",
        stops: ["DXB", "IST"],
        duration: 1549,
      },
    ],
  },
  {
    price: 86844,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:51:00.000Z",
        stops: ["BKK"],
        duration: 1225,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:38:00.000Z",
        stops: [],
        duration: 1811,
      },
    ],
  },
  {
    price: 85792,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:08:00.000Z",
        stops: [],
        duration: 1915,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:47:00.000Z",
        stops: ["SHA"],
        duration: 1211,
      },
    ],
  },
  {
    price: 37427,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:32:00.000Z",
        stops: ["BKK", "DXB", "SHA"],
        duration: 628,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:52:00.000Z",
        stops: ["DXB", "AUH", "KUL"],
        duration: 1888,
      },
    ],
  },
  {
    price: 26086,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:04:00.000Z",
        stops: ["KUL", "DXB", "AUH"],
        duration: 868,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:01:00.000Z",
        stops: ["SIN"],
        duration: 1111,
      },
    ],
  },
  {
    price: 35942,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:03:00.000Z",
        stops: [],
        duration: 1046,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:16:00.000Z",
        stops: ["IST", "DXB", "HKG"],
        duration: 1182,
      },
    ],
  },
  {
    price: 87214,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:36:00.000Z",
        stops: ["DXB", "SHA"],
        duration: 1896,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:05:00.000Z",
        stops: ["BKK", "SIN", "SHA"],
        duration: 1582,
      },
    ],
  },
  {
    price: 89970,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:03:00.000Z",
        stops: ["BKK", "DXB", "SHA"],
        duration: 1033,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:34:00.000Z",
        stops: [],
        duration: 1426,
      },
    ],
  },
  {
    price: 63487,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:51:00.000Z",
        stops: ["SIN", "AUH", "BKK"],
        duration: 1920,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:37:00.000Z",
        stops: [],
        duration: 999,
      },
    ],
  },
  {
    price: 34872,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:04:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 1196,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:42:00.000Z",
        stops: ["SIN", "KUL", "HKG"],
        duration: 1869,
      },
    ],
  },
  {
    price: 29943,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:04:00.000Z",
        stops: ["HKG", "KUL"],
        duration: 1762,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:27:00.000Z",
        stops: [],
        duration: 1572,
      },
    ],
  },
  {
    price: 18309,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:45:00.000Z",
        stops: ["HKG"],
        duration: 942,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:06:00.000Z",
        stops: ["KUL"],
        duration: 1718,
      },
    ],
  },
  {
    price: 16751,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:59:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 604,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:14:00.000Z",
        stops: ["KUL", "HKG"],
        duration: 1812,
      },
    ],
  },
  {
    price: 85248,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:12:00.000Z",
        stops: [],
        duration: 611,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:48:00.000Z",
        stops: ["HKG"],
        duration: 1507,
      },
    ],
  },
  {
    price: 42340,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:01:00.000Z",
        stops: ["HKG"],
        duration: 657,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:11:00.000Z",
        stops: [],
        duration: 1411,
      },
    ],
  },
  {
    price: 77867,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:53:00.000Z",
        stops: ["KUL", "DXB"],
        duration: 1644,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:04:00.000Z",
        stops: ["AUH"],
        duration: 784,
      },
    ],
  },
  {
    price: 53066,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:35:00.000Z",
        stops: ["AUH"],
        duration: 1943,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:57:00.000Z",
        stops: [],
        duration: 1225,
      },
    ],
  },
  {
    price: 72908,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:02:00.000Z",
        stops: ["IST"],
        duration: 1734,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:00:00.000Z",
        stops: ["IST", "DXB", "AUH"],
        duration: 991,
      },
    ],
  },
  {
    price: 44582,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:35:00.000Z",
        stops: [],
        duration: 676,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:54:00.000Z",
        stops: [],
        duration: 682,
      },
    ],
  },
  {
    price: 30498,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:40:00.000Z",
        stops: ["BKK"],
        duration: 1769,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:22:00.000Z",
        stops: [],
        duration: 1503,
      },
    ],
  },
  {
    price: 89460,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:50:00.000Z",
        stops: [],
        duration: 801,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:43:00.000Z",
        stops: ["HKG"],
        duration: 687,
      },
    ],
  },
  {
    price: 70346,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:01:00.000Z",
        stops: [],
        duration: 823,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:05:00.000Z",
        stops: [],
        duration: 952,
      },
    ],
  },
  {
    price: 83880,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:46:00.000Z",
        stops: ["BKK", "SHA", "SIN"],
        duration: 968,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:46:00.000Z",
        stops: ["KUL", "HKG", "IST"],
        duration: 1254,
      },
    ],
  },
  {
    price: 55708,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:36:00.000Z",
        stops: ["BKK", "SIN", "IST"],
        duration: 1158,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:32:00.000Z",
        stops: ["SHA"],
        duration: 1898,
      },
    ],
  },
  {
    price: 46992,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:17:00.000Z",
        stops: ["DXB"],
        duration: 1570,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:17:00.000Z",
        stops: ["IST"],
        duration: 866,
      },
    ],
  },
  {
    price: 66569,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:08:00.000Z",
        stops: ["DXB", "IST"],
        duration: 1276,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:21:00.000Z",
        stops: [],
        duration: 965,
      },
    ],
  },
  {
    price: 67771,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:13:00.000Z",
        stops: ["BKK", "HKG", "SIN"],
        duration: 1857,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:01:00.000Z",
        stops: ["BKK"],
        duration: 1595,
      },
    ],
  },
  {
    price: 74046,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:18:00.000Z",
        stops: ["IST"],
        duration: 1115,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:31:00.000Z",
        stops: ["HKG", "BKK", "AUH"],
        duration: 1371,
      },
    ],
  },
  {
    price: 74982,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:28:00.000Z",
        stops: [],
        duration: 1918,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:32:00.000Z",
        stops: ["SIN"],
        duration: 1884,
      },
    ],
  },
  {
    price: 50343,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:33:00.000Z",
        stops: ["SHA"],
        duration: 1315,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:48:00.000Z",
        stops: ["SIN", "BKK", "DXB"],
        duration: 1440,
      },
    ],
  },
  {
    price: 86977,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:24:00.000Z",
        stops: ["BKK", "KUL"],
        duration: 1737,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:03:00.000Z",
        stops: ["DXB"],
        duration: 1954,
      },
    ],
  },
  {
    price: 98355,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:16:00.000Z",
        stops: ["HKG"],
        duration: 1693,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:22:00.000Z",
        stops: ["KUL"],
        duration: 1929,
      },
    ],
  },
  {
    price: 71322,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:04:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1803,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:31:00.000Z",
        stops: ["IST"],
        duration: 853,
      },
    ],
  },
  {
    price: 97355,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:58:00.000Z",
        stops: ["SHA"],
        duration: 1775,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:26:00.000Z",
        stops: ["SHA", "AUH", "DXB"],
        duration: 762,
      },
    ],
  },
  {
    price: 63747,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:26:00.000Z",
        stops: ["SHA", "KUL"],
        duration: 1668,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:43:00.000Z",
        stops: ["IST", "AUH"],
        duration: 1785,
      },
    ],
  },
  {
    price: 15385,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:14:00.000Z",
        stops: ["IST", "AUH"],
        duration: 1619,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:44:00.000Z",
        stops: ["SHA"],
        duration: 1724,
      },
    ],
  },
  {
    price: 28313,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:49:00.000Z",
        stops: ["AUH"],
        duration: 1966,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:01:00.000Z",
        stops: ["HKG", "IST"],
        duration: 1904,
      },
    ],
  },
  {
    price: 55319,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:59:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1176,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:30:00.000Z",
        stops: ["BKK"],
        duration: 1550,
      },
    ],
  },
  {
    price: 48088,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:36:00.000Z",
        stops: [],
        duration: 741,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:37:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1245,
      },
    ],
  },
  {
    price: 95561,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:55:00.000Z",
        stops: ["AUH", "BKK", "SIN"],
        duration: 1461,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:25:00.000Z",
        stops: ["BKK", "DXB", "SHA"],
        duration: 1113,
      },
    ],
  },
  {
    price: 67830,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:23:00.000Z",
        stops: ["KUL", "AUH", "IST"],
        duration: 1198,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:44:00.000Z",
        stops: ["SHA"],
        duration: 1165,
      },
    ],
  },
  {
    price: 89875,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:16:00.000Z",
        stops: [],
        duration: 1023,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:16:00.000Z",
        stops: [],
        duration: 1253,
      },
    ],
  },
  {
    price: 62411,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:28:00.000Z",
        stops: ["BKK", "HKG", "DXB"],
        duration: 1969,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:52:00.000Z",
        stops: ["AUH", "IST"],
        duration: 1165,
      },
    ],
  },
  {
    price: 75796,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:27:00.000Z",
        stops: ["IST"],
        duration: 1941,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:41:00.000Z",
        stops: [],
        duration: 1278,
      },
    ],
  },
  {
    price: 92832,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:50:00.000Z",
        stops: ["SHA", "KUL", "IST"],
        duration: 1177,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:14:00.000Z",
        stops: ["HKG", "AUH", "IST"],
        duration: 1555,
      },
    ],
  },
  {
    price: 98819,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:53:00.000Z",
        stops: [],
        duration: 1715,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:35:00.000Z",
        stops: [],
        duration: 1584,
      },
    ],
  },
  {
    price: 32748,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:27:00.000Z",
        stops: [],
        duration: 961,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:26:00.000Z",
        stops: [],
        duration: 1693,
      },
    ],
  },
  {
    price: 62460,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:54:00.000Z",
        stops: [],
        duration: 1292,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:05:00.000Z",
        stops: ["SIN"],
        duration: 1605,
      },
    ],
  },
  {
    price: 84172,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:43:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 1515,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:35:00.000Z",
        stops: [],
        duration: 1112,
      },
    ],
  },
  {
    price: 31501,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:58:00.000Z",
        stops: ["KUL", "SIN"],
        duration: 809,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:15:00.000Z",
        stops: ["AUH"],
        duration: 1246,
      },
    ],
  },
  {
    price: 21283,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:59:00.000Z",
        stops: ["DXB", "SHA"],
        duration: 945,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:31:00.000Z",
        stops: ["KUL", "BKK", "IST"],
        duration: 814,
      },
    ],
  },
  {
    price: 56488,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:21:00.000Z",
        stops: ["DXB", "AUH", "HKG"],
        duration: 626,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:01:00.000Z",
        stops: ["DXB", "SIN", "IST"],
        duration: 1491,
      },
    ],
  },
  {
    price: 51446,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:05:00.000Z",
        stops: ["HKG", "DXB"],
        duration: 1662,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:36:00.000Z",
        stops: [],
        duration: 681,
      },
    ],
  },
  {
    price: 76474,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:24:00.000Z",
        stops: [],
        duration: 1434,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:08:00.000Z",
        stops: ["BKK"],
        duration: 1525,
      },
    ],
  },
  {
    price: 39439,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:49:00.000Z",
        stops: ["SIN", "HKG", "DXB"],
        duration: 1351,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:32:00.000Z",
        stops: ["DXB"],
        duration: 948,
      },
    ],
  },
  {
    price: 15314,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:28:00.000Z",
        stops: ["HKG", "AUH"],
        duration: 1756,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:01:00.000Z",
        stops: ["AUH"],
        duration: 639,
      },
    ],
  },
  {
    price: 29506,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:44:00.000Z",
        stops: ["SHA"],
        duration: 1629,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:00:00.000Z",
        stops: ["IST", "HKG", "AUH"],
        duration: 1085,
      },
    ],
  },
  {
    price: 47212,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:53:00.000Z",
        stops: [],
        duration: 897,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:37:00.000Z",
        stops: ["DXB", "IST", "SIN"],
        duration: 1501,
      },
    ],
  },
  {
    price: 54846,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:33:00.000Z",
        stops: ["AUH"],
        duration: 1241,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:21:00.000Z",
        stops: ["BKK", "SHA", "KUL"],
        duration: 1273,
      },
    ],
  },
  {
    price: 30388,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:21:00.000Z",
        stops: ["SHA"],
        duration: 1313,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:53:00.000Z",
        stops: ["IST", "KUL", "DXB"],
        duration: 624,
      },
    ],
  },
  {
    price: 35306,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:27:00.000Z",
        stops: ["SIN"],
        duration: 1859,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:26:00.000Z",
        stops: ["SIN", "KUL", "SHA"],
        duration: 853,
      },
    ],
  },
  {
    price: 68701,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:25:00.000Z",
        stops: ["SIN"],
        duration: 971,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:56:00.000Z",
        stops: ["HKG", "KUL"],
        duration: 1767,
      },
    ],
  },
  {
    price: 31133,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:31:00.000Z",
        stops: ["BKK", "IST"],
        duration: 1490,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:59:00.000Z",
        stops: ["IST", "DXB"],
        duration: 1832,
      },
    ],
  },
  {
    price: 55815,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:30:00.000Z",
        stops: [],
        duration: 792,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:13:00.000Z",
        stops: ["SIN", "SHA"],
        duration: 1359,
      },
    ],
  },
  {
    price: 40394,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:00:00.000Z",
        stops: ["DXB", "BKK", "HKG"],
        duration: 751,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:17:00.000Z",
        stops: ["AUH", "KUL"],
        duration: 1933,
      },
    ],
  },
  {
    price: 78643,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:47:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 730,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:34:00.000Z",
        stops: ["AUH", "DXB", "HKG"],
        duration: 829,
      },
    ],
  },
  {
    price: 23712,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:56:00.000Z",
        stops: [],
        duration: 1888,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:56:00.000Z",
        stops: [],
        duration: 880,
      },
    ],
  },
  {
    price: 94680,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:12:00.000Z",
        stops: ["AUH"],
        duration: 999,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:09:00.000Z",
        stops: ["IST"],
        duration: 1039,
      },
    ],
  },
  {
    price: 53396,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:00:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 1206,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:34:00.000Z",
        stops: ["SIN", "SHA", "BKK"],
        duration: 1577,
      },
    ],
  },
  {
    price: 73529,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:10:00.000Z",
        stops: ["KUL"],
        duration: 1683,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:31:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1077,
      },
    ],
  },
  {
    price: 32653,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:00:00.000Z",
        stops: [],
        duration: 1639,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:18:00.000Z",
        stops: ["DXB", "IST", "BKK"],
        duration: 1408,
      },
    ],
  },
  {
    price: 20457,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:33:00.000Z",
        stops: ["SHA"],
        duration: 1550,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:58:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1679,
      },
    ],
  },
  {
    price: 53518,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:16:00.000Z",
        stops: ["DXB", "BKK", "AUH"],
        duration: 1562,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:59:00.000Z",
        stops: [],
        duration: 1246,
      },
    ],
  },
  {
    price: 69368,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:11:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 1892,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:57:00.000Z",
        stops: ["BKK"],
        duration: 681,
      },
    ],
  },
  {
    price: 52967,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:23:00.000Z",
        stops: ["SHA", "BKK", "IST"],
        duration: 744,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:38:00.000Z",
        stops: [],
        duration: 1590,
      },
    ],
  },
  {
    price: 90873,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:23:00.000Z",
        stops: ["KUL", "SHA", "IST"],
        duration: 1264,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:29:00.000Z",
        stops: ["SHA", "IST", "SIN"],
        duration: 1493,
      },
    ],
  },
  {
    price: 60957,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:34:00.000Z",
        stops: ["SIN", "KUL"],
        duration: 1427,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:34:00.000Z",
        stops: ["AUH"],
        duration: 653,
      },
    ],
  },
  {
    price: 42357,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:53:00.000Z",
        stops: [],
        duration: 1076,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:29:00.000Z",
        stops: ["KUL", "IST"],
        duration: 1579,
      },
    ],
  },
  {
    price: 58463,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:23:00.000Z",
        stops: ["IST", "BKK"],
        duration: 815,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:36:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1942,
      },
    ],
  },
  {
    price: 44309,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:58:00.000Z",
        stops: ["AUH"],
        duration: 722,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:46:00.000Z",
        stops: ["IST"],
        duration: 911,
      },
    ],
  },
  {
    price: 54410,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:52:00.000Z",
        stops: [],
        duration: 661,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:44:00.000Z",
        stops: ["KUL", "AUH", "SHA"],
        duration: 672,
      },
    ],
  },
  {
    price: 79882,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:25:00.000Z",
        stops: [],
        duration: 1267,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:54:00.000Z",
        stops: ["IST"],
        duration: 1369,
      },
    ],
  },
  {
    price: 87031,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:06:00.000Z",
        stops: ["SIN"],
        duration: 1475,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:19:00.000Z",
        stops: [],
        duration: 718,
      },
    ],
  },
  {
    price: 41773,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:06:00.000Z",
        stops: ["BKK"],
        duration: 1075,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:17:00.000Z",
        stops: ["HKG"],
        duration: 1109,
      },
    ],
  },
  {
    price: 60641,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:41:00.000Z",
        stops: ["DXB", "SHA", "SIN"],
        duration: 1563,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:46:00.000Z",
        stops: [],
        duration: 721,
      },
    ],
  },
  {
    price: 78212,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:40:00.000Z",
        stops: ["BKK", "DXB", "SIN"],
        duration: 1810,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:38:00.000Z",
        stops: ["SHA", "HKG", "KUL"],
        duration: 1873,
      },
    ],
  },
  {
    price: 99761,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:17:00.000Z",
        stops: ["IST", "BKK"],
        duration: 1144,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:42:00.000Z",
        stops: ["IST"],
        duration: 1861,
      },
    ],
  },
  {
    price: 60449,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:09:00.000Z",
        stops: ["AUH", "SIN", "IST"],
        duration: 1723,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:57:00.000Z",
        stops: ["BKK", "HKG", "SHA"],
        duration: 610,
      },
    ],
  },
  {
    price: 87942,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:04:00.000Z",
        stops: ["KUL", "SIN"],
        duration: 1525,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:24:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 1785,
      },
    ],
  },
  {
    price: 18827,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:47:00.000Z",
        stops: ["DXB", "IST", "HKG"],
        duration: 1654,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:43:00.000Z",
        stops: ["SHA"],
        duration: 1947,
      },
    ],
  },
  {
    price: 57123,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:24:00.000Z",
        stops: ["KUL"],
        duration: 1894,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:18:00.000Z",
        stops: [],
        duration: 1968,
      },
    ],
  },
  {
    price: 60006,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:00:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 1339,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:14:00.000Z",
        stops: ["BKK", "IST"],
        duration: 1152,
      },
    ],
  },
  {
    price: 44911,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:07:00.000Z",
        stops: ["KUL", "SHA"],
        duration: 1251,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:30:00.000Z",
        stops: [],
        duration: 1107,
      },
    ],
  },
  {
    price: 24164,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:28:00.000Z",
        stops: ["DXB"],
        duration: 1517,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:36:00.000Z",
        stops: ["BKK", "AUH"],
        duration: 1452,
      },
    ],
  },
  {
    price: 58006,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:42:00.000Z",
        stops: ["SIN"],
        duration: 1250,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:05:00.000Z",
        stops: [],
        duration: 890,
      },
    ],
  },
  {
    price: 56812,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:58:00.000Z",
        stops: ["BKK", "SIN", "AUH"],
        duration: 1889,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:05:00.000Z",
        stops: ["SIN"],
        duration: 752,
      },
    ],
  },
  {
    price: 67390,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:11:00.000Z",
        stops: ["SIN"],
        duration: 1792,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:40:00.000Z",
        stops: ["IST", "KUL", "SHA"],
        duration: 1311,
      },
    ],
  },
  {
    price: 81181,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:18:00.000Z",
        stops: [],
        duration: 1411,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:25:00.000Z",
        stops: ["HKG", "SIN", "SHA"],
        duration: 1413,
      },
    ],
  },
  {
    price: 22039,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:38:00.000Z",
        stops: ["SHA", "AUH", "IST"],
        duration: 1981,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:31:00.000Z",
        stops: ["KUL"],
        duration: 794,
      },
    ],
  },
  {
    price: 45549,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:43:00.000Z",
        stops: ["BKK"],
        duration: 1065,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:38:00.000Z",
        stops: ["AUH"],
        duration: 1868,
      },
    ],
  },
  {
    price: 70250,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:12:00.000Z",
        stops: ["BKK", "IST", "SIN"],
        duration: 1747,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:39:00.000Z",
        stops: ["HKG", "AUH", "BKK"],
        duration: 711,
      },
    ],
  },
  {
    price: 19329,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:35:00.000Z",
        stops: ["KUL"],
        duration: 977,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:27:00.000Z",
        stops: ["KUL", "HKG"],
        duration: 1447,
      },
    ],
  },
  {
    price: 73124,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:50:00.000Z",
        stops: ["SHA"],
        duration: 1408,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:04:00.000Z",
        stops: ["DXB"],
        duration: 1588,
      },
    ],
  },
  {
    price: 62486,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:49:00.000Z",
        stops: ["HKG", "AUH"],
        duration: 1908,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:15:00.000Z",
        stops: ["HKG", "SIN"],
        duration: 1193,
      },
    ],
  },
  {
    price: 77007,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:11:00.000Z",
        stops: ["AUH", "BKK", "SIN"],
        duration: 1486,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:05:00.000Z",
        stops: ["KUL", "SHA", "AUH"],
        duration: 1710,
      },
    ],
  },
  {
    price: 90405,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:45:00.000Z",
        stops: [],
        duration: 1186,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:17:00.000Z",
        stops: ["KUL"],
        duration: 1953,
      },
    ],
  },
  {
    price: 55617,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:25:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 1958,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:33:00.000Z",
        stops: [],
        duration: 1471,
      },
    ],
  },
  {
    price: 65770,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:26:00.000Z",
        stops: ["KUL"],
        duration: 1881,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:27:00.000Z",
        stops: ["SHA", "SIN"],
        duration: 1590,
      },
    ],
  },
  {
    price: 54811,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:12:00.000Z",
        stops: ["BKK", "HKG", "IST"],
        duration: 807,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:44:00.000Z",
        stops: ["SHA"],
        duration: 1571,
      },
    ],
  },
  {
    price: 24212,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:02:00.000Z",
        stops: ["DXB", "KUL"],
        duration: 1683,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:39:00.000Z",
        stops: ["DXB", "HKG"],
        duration: 742,
      },
    ],
  },
  {
    price: 61817,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:55:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1727,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:37:00.000Z",
        stops: [],
        duration: 1246,
      },
    ],
  },
  {
    price: 78948,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:01:00.000Z",
        stops: ["KUL"],
        duration: 1592,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:10:00.000Z",
        stops: ["HKG"],
        duration: 1070,
      },
    ],
  },
  {
    price: 88372,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:42:00.000Z",
        stops: ["AUH", "SIN"],
        duration: 1240,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:25:00.000Z",
        stops: ["HKG", "BKK", "AUH"],
        duration: 911,
      },
    ],
  },
  {
    price: 89784,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:53:00.000Z",
        stops: [],
        duration: 1288,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:26:00.000Z",
        stops: ["DXB", "HKG", "IST"],
        duration: 868,
      },
    ],
  },
  {
    price: 38717,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:22:00.000Z",
        stops: [],
        duration: 1061,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:43:00.000Z",
        stops: ["SHA", "DXB"],
        duration: 634,
      },
    ],
  },
  {
    price: 77664,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:14:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 1010,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:00:00.000Z",
        stops: ["IST"],
        duration: 621,
      },
    ],
  },
  {
    price: 76493,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:28:00.000Z",
        stops: ["AUH", "SIN", "KUL"],
        duration: 1184,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:11:00.000Z",
        stops: [],
        duration: 1548,
      },
    ],
  },
  {
    price: 29865,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:18:00.000Z",
        stops: ["BKK", "IST"],
        duration: 1623,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:25:00.000Z",
        stops: [],
        duration: 1810,
      },
    ],
  },
  {
    price: 73269,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:49:00.000Z",
        stops: [],
        duration: 1404,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:37:00.000Z",
        stops: [],
        duration: 1461,
      },
    ],
  },
  {
    price: 84740,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:17:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 659,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:11:00.000Z",
        stops: ["SIN"],
        duration: 1467,
      },
    ],
  },
  {
    price: 38451,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:04:00.000Z",
        stops: ["IST"],
        duration: 703,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:10:00.000Z",
        stops: ["HKG", "DXB", "AUH"],
        duration: 1513,
      },
    ],
  },
  {
    price: 56178,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:44:00.000Z",
        stops: ["SIN"],
        duration: 1249,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:14:00.000Z",
        stops: ["IST", "DXB"],
        duration: 1215,
      },
    ],
  },
  {
    price: 80625,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:51:00.000Z",
        stops: [],
        duration: 1664,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:12:00.000Z",
        stops: ["DXB", "AUH", "HKG"],
        duration: 1094,
      },
    ],
  },
  {
    price: 93195,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:10:00.000Z",
        stops: ["AUH"],
        duration: 609,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:10:00.000Z",
        stops: ["DXB", "SIN", "IST"],
        duration: 1688,
      },
    ],
  },
  {
    price: 64549,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:39:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 1899,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:32:00.000Z",
        stops: [],
        duration: 707,
      },
    ],
  },
  {
    price: 31156,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:07:00.000Z",
        stops: ["DXB", "HKG", "IST"],
        duration: 1794,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:20:00.000Z",
        stops: ["DXB", "BKK", "KUL"],
        duration: 950,
      },
    ],
  },
  {
    price: 45920,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:48:00.000Z",
        stops: [],
        duration: 1886,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:33:00.000Z",
        stops: ["HKG"],
        duration: 1916,
      },
    ],
  },
  {
    price: 52172,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:27:00.000Z",
        stops: [],
        duration: 1901,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:59:00.000Z",
        stops: ["AUH", "KUL"],
        duration: 936,
      },
    ],
  },
  {
    price: 23628,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:43:00.000Z",
        stops: ["DXB"],
        duration: 1317,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:50:00.000Z",
        stops: [],
        duration: 1919,
      },
    ],
  },
  {
    price: 82310,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:30:00.000Z",
        stops: [],
        duration: 1224,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:54:00.000Z",
        stops: [],
        duration: 1337,
      },
    ],
  },
  {
    price: 57339,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:23:00.000Z",
        stops: ["SIN", "BKK", "KUL"],
        duration: 1736,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:01:00.000Z",
        stops: ["SHA"],
        duration: 1312,
      },
    ],
  },
  {
    price: 31534,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:49:00.000Z",
        stops: ["HKG", "SIN", "DXB"],
        duration: 1225,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:40:00.000Z",
        stops: ["SIN", "DXB", "AUH"],
        duration: 1773,
      },
    ],
  },
  {
    price: 24158,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:21:00.000Z",
        stops: [],
        duration: 1858,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:51:00.000Z",
        stops: ["DXB", "IST"],
        duration: 878,
      },
    ],
  },
  {
    price: 20491,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:56:00.000Z",
        stops: [],
        duration: 1221,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:22:00.000Z",
        stops: ["BKK"],
        duration: 712,
      },
    ],
  },
  {
    price: 76226,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:49:00.000Z",
        stops: [],
        duration: 1082,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:29:00.000Z",
        stops: [],
        duration: 1251,
      },
    ],
  },
  {
    price: 58417,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:07:00.000Z",
        stops: ["BKK", "HKG", "IST"],
        duration: 1944,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:59:00.000Z",
        stops: [],
        duration: 1019,
      },
    ],
  },
  {
    price: 94830,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:20:00.000Z",
        stops: ["HKG", "BKK"],
        duration: 845,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:07:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1103,
      },
    ],
  },
  {
    price: 73003,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:17:00.000Z",
        stops: ["KUL", "HKG", "DXB"],
        duration: 1343,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:45:00.000Z",
        stops: ["AUH"],
        duration: 1327,
      },
    ],
  },
  {
    price: 17222,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:55:00.000Z",
        stops: ["AUH", "KUL", "SIN"],
        duration: 1476,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:02:00.000Z",
        stops: ["BKK"],
        duration: 843,
      },
    ],
  },
  {
    price: 87424,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:28:00.000Z",
        stops: ["SHA"],
        duration: 1304,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:33:00.000Z",
        stops: ["SIN", "SHA", "IST"],
        duration: 1457,
      },
    ],
  },
  {
    price: 83680,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:19:00.000Z",
        stops: ["SHA"],
        duration: 1983,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:01:00.000Z",
        stops: ["BKK", "SIN"],
        duration: 1472,
      },
    ],
  },
  {
    price: 19051,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:46:00.000Z",
        stops: [],
        duration: 1337,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:16:00.000Z",
        stops: ["BKK"],
        duration: 983,
      },
    ],
  },
  {
    price: 69794,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:53:00.000Z",
        stops: ["SIN", "BKK", "SHA"],
        duration: 1010,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:56:00.000Z",
        stops: [],
        duration: 1114,
      },
    ],
  },
  {
    price: 52436,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:33:00.000Z",
        stops: ["SIN", "IST", "DXB"],
        duration: 1583,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:33:00.000Z",
        stops: ["BKK"],
        duration: 857,
      },
    ],
  },
  {
    price: 66086,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:06:00.000Z",
        stops: ["SIN", "HKG", "BKK"],
        duration: 1212,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:19:00.000Z",
        stops: ["AUH", "KUL"],
        duration: 1160,
      },
    ],
  },
  {
    price: 67897,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:00:00.000Z",
        stops: ["DXB", "KUL", "SHA"],
        duration: 779,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:16:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 659,
      },
    ],
  },
  {
    price: 96558,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:14:00.000Z",
        stops: [],
        duration: 1786,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:42:00.000Z",
        stops: ["SHA"],
        duration: 1212,
      },
    ],
  },
  {
    price: 78411,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:05:00.000Z",
        stops: ["HKG", "BKK", "SHA"],
        duration: 666,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:09:00.000Z",
        stops: ["KUL", "SIN", "DXB"],
        duration: 1309,
      },
    ],
  },
  {
    price: 43100,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:23:00.000Z",
        stops: ["DXB", "AUH"],
        duration: 1806,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:18:00.000Z",
        stops: ["SHA"],
        duration: 1877,
      },
    ],
  },
  {
    price: 25399,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:17:00.000Z",
        stops: [],
        duration: 1234,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:48:00.000Z",
        stops: ["KUL"],
        duration: 610,
      },
    ],
  },
  {
    price: 46068,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:20:00.000Z",
        stops: [],
        duration: 709,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:33:00.000Z",
        stops: ["IST", "SIN"],
        duration: 921,
      },
    ],
  },
  {
    price: 73590,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:56:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 1538,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:34:00.000Z",
        stops: ["DXB", "AUH"],
        duration: 1939,
      },
    ],
  },
  {
    price: 22792,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:23:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 1642,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:15:00.000Z",
        stops: ["IST"],
        duration: 1235,
      },
    ],
  },
  {
    price: 94753,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:34:00.000Z",
        stops: ["IST", "SIN"],
        duration: 1574,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:03:00.000Z",
        stops: [],
        duration: 842,
      },
    ],
  },
  {
    price: 67471,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:59:00.000Z",
        stops: ["BKK", "SHA", "IST"],
        duration: 1585,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:10:00.000Z",
        stops: ["HKG"],
        duration: 825,
      },
    ],
  },
  {
    price: 97790,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:38:00.000Z",
        stops: ["HKG"],
        duration: 1182,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:06:00.000Z",
        stops: ["IST"],
        duration: 1699,
      },
    ],
  },
  {
    price: 53141,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:49:00.000Z",
        stops: ["KUL"],
        duration: 1942,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:37:00.000Z",
        stops: ["IST"],
        duration: 1652,
      },
    ],
  },
  {
    price: 98739,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:45:00.000Z",
        stops: [],
        duration: 1563,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:53:00.000Z",
        stops: ["AUH", "DXB"],
        duration: 754,
      },
    ],
  },
  {
    price: 60635,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:03:00.000Z",
        stops: ["IST", "HKG"],
        duration: 1511,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:22:00.000Z",
        stops: [],
        duration: 1987,
      },
    ],
  },
  {
    price: 40148,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:16:00.000Z",
        stops: ["SIN"],
        duration: 1760,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:40:00.000Z",
        stops: ["SHA", "BKK"],
        duration: 827,
      },
    ],
  },
  {
    price: 92593,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:17:00.000Z",
        stops: ["IST"],
        duration: 964,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:22:00.000Z",
        stops: ["IST"],
        duration: 1141,
      },
    ],
  },
  {
    price: 67870,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:41:00.000Z",
        stops: [],
        duration: 1610,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:50:00.000Z",
        stops: ["KUL"],
        duration: 611,
      },
    ],
  },
  {
    price: 94653,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:57:00.000Z",
        stops: ["SIN", "HKG"],
        duration: 1374,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:45:00.000Z",
        stops: ["BKK"],
        duration: 1973,
      },
    ],
  },
  {
    price: 26676,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T09:29:00.000Z",
        stops: ["KUL", "DXB", "SHA"],
        duration: 965,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:43:00.000Z",
        stops: ["DXB", "KUL", "AUH"],
        duration: 1135,
      },
    ],
  },
  {
    price: 56837,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:16:00.000Z",
        stops: ["HKG", "AUH", "IST"],
        duration: 1128,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:37:00.000Z",
        stops: ["KUL"],
        duration: 1459,
      },
    ],
  },
  {
    price: 97286,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:36:00.000Z",
        stops: ["SHA"],
        duration: 682,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:48:00.000Z",
        stops: ["BKK"],
        duration: 1072,
      },
    ],
  },
  {
    price: 55626,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:56:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1179,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:33:00.000Z",
        stops: ["IST", "SIN", "KUL"],
        duration: 1710,
      },
    ],
  },
  {
    price: 57384,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:58:00.000Z",
        stops: [],
        duration: 1626,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:22:00.000Z",
        stops: [],
        duration: 1387,
      },
    ],
  },
  {
    price: 75822,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:12:00.000Z",
        stops: ["SHA"],
        duration: 1552,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:02:00.000Z",
        stops: ["BKK", "KUL"],
        duration: 1499,
      },
    ],
  },
  {
    price: 72886,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:15:00.000Z",
        stops: ["SIN", "KUL"],
        duration: 1832,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:03:00.000Z",
        stops: ["SIN"],
        duration: 1565,
      },
    ],
  },
  {
    price: 92655,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:04:00.000Z",
        stops: ["DXB"],
        duration: 876,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:24:00.000Z",
        stops: ["IST"],
        duration: 668,
      },
    ],
  },
  {
    price: 18834,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:36:00.000Z",
        stops: ["AUH"],
        duration: 1200,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:45:00.000Z",
        stops: ["SIN", "DXB"],
        duration: 637,
      },
    ],
  },
  {
    price: 49316,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:15:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 1337,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:15:00.000Z",
        stops: ["KUL", "IST", "AUH"],
        duration: 851,
      },
    ],
  },
  {
    price: 85378,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:54:00.000Z",
        stops: ["SIN", "SHA"],
        duration: 873,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:38:00.000Z",
        stops: [],
        duration: 768,
      },
    ],
  },
  {
    price: 66642,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:20:00.000Z",
        stops: ["IST"],
        duration: 1927,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:43:00.000Z",
        stops: ["HKG"],
        duration: 1311,
      },
    ],
  },
  {
    price: 60576,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:26:00.000Z",
        stops: ["DXB"],
        duration: 1685,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:00:00.000Z",
        stops: ["KUL", "HKG"],
        duration: 1025,
      },
    ],
  },
  {
    price: 73991,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:32:00.000Z",
        stops: ["IST", "DXB", "BKK"],
        duration: 752,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:45:00.000Z",
        stops: [],
        duration: 602,
      },
    ],
  },
  {
    price: 89855,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:57:00.000Z",
        stops: ["AUH", "BKK", "IST"],
        duration: 1877,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:47:00.000Z",
        stops: ["AUH", "HKG"],
        duration: 708,
      },
    ],
  },
  {
    price: 33381,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:07:00.000Z",
        stops: [],
        duration: 1470,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:38:00.000Z",
        stops: [],
        duration: 1885,
      },
    ],
  },
  {
    price: 35449,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:26:00.000Z",
        stops: ["HKG", "AUH", "KUL"],
        duration: 1076,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:12:00.000Z",
        stops: ["KUL", "DXB", "SHA"],
        duration: 781,
      },
    ],
  },
  {
    price: 84014,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:52:00.000Z",
        stops: ["HKG"],
        duration: 1617,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:20:00.000Z",
        stops: ["SIN"],
        duration: 1930,
      },
    ],
  },
  {
    price: 90497,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:59:00.000Z",
        stops: ["IST", "SHA", "BKK"],
        duration: 1490,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:37:00.000Z",
        stops: ["IST"],
        duration: 716,
      },
    ],
  },
  {
    price: 45232,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:09:00.000Z",
        stops: ["HKG", "DXB", "SIN"],
        duration: 1606,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:26:00.000Z",
        stops: ["AUH", "SIN", "DXB"],
        duration: 609,
      },
    ],
  },
  {
    price: 32994,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:48:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 1550,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:31:00.000Z",
        stops: [],
        duration: 912,
      },
    ],
  },
  {
    price: 59030,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:11:00.000Z",
        stops: ["DXB", "KUL", "BKK"],
        duration: 1698,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:54:00.000Z",
        stops: ["KUL"],
        duration: 1722,
      },
    ],
  },
  {
    price: 19957,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:05:00.000Z",
        stops: [],
        duration: 1923,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:08:00.000Z",
        stops: ["KUL"],
        duration: 1180,
      },
    ],
  },
  {
    price: 42432,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:59:00.000Z",
        stops: [],
        duration: 1120,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:24:00.000Z",
        stops: ["AUH", "SHA", "BKK"],
        duration: 1210,
      },
    ],
  },
  {
    price: 79907,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:25:00.000Z",
        stops: ["SIN", "AUH", "IST"],
        duration: 906,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:47:00.000Z",
        stops: ["KUL", "SHA", "DXB"],
        duration: 1954,
      },
    ],
  },
  {
    price: 90114,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:11:00.000Z",
        stops: ["KUL", "SHA", "DXB"],
        duration: 1954,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:19:00.000Z",
        stops: ["IST", "BKK", "SHA"],
        duration: 1856,
      },
    ],
  },
  {
    price: 76111,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:40:00.000Z",
        stops: [],
        duration: 1277,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:34:00.000Z",
        stops: [],
        duration: 1256,
      },
    ],
  },
  {
    price: 98210,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:59:00.000Z",
        stops: [],
        duration: 1765,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:01:00.000Z",
        stops: ["BKK"],
        duration: 1293,
      },
    ],
  },
  {
    price: 36428,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:42:00.000Z",
        stops: [],
        duration: 1844,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:21:00.000Z",
        stops: ["DXB"],
        duration: 699,
      },
    ],
  },
  {
    price: 98358,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:50:00.000Z",
        stops: ["BKK", "IST"],
        duration: 1115,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:36:00.000Z",
        stops: ["SIN"],
        duration: 815,
      },
    ],
  },
  {
    price: 51478,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:06:00.000Z",
        stops: ["KUL", "SIN", "IST"],
        duration: 1670,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:40:00.000Z",
        stops: [],
        duration: 909,
      },
    ],
  },
  {
    price: 91904,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:31:00.000Z",
        stops: ["SHA", "AUH", "KUL"],
        duration: 893,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:49:00.000Z",
        stops: ["SIN", "BKK", "SHA"],
        duration: 1255,
      },
    ],
  },
  {
    price: 85839,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:25:00.000Z",
        stops: ["HKG", "AUH"],
        duration: 861,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:11:00.000Z",
        stops: ["AUH"],
        duration: 705,
      },
    ],
  },
  {
    price: 50601,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:55:00.000Z",
        stops: ["AUH", "DXB"],
        duration: 1751,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:27:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1455,
      },
    ],
  },
  {
    price: 64903,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:43:00.000Z",
        stops: ["SIN", "IST", "SHA"],
        duration: 808,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:56:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 616,
      },
    ],
  },
  {
    price: 45579,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:20:00.000Z",
        stops: ["AUH", "IST", "SIN"],
        duration: 1425,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:34:00.000Z",
        stops: ["AUH", "HKG", "BKK"],
        duration: 1302,
      },
    ],
  },
  {
    price: 63512,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:20:00.000Z",
        stops: ["SHA", "HKG", "IST"],
        duration: 972,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:33:00.000Z",
        stops: ["IST"],
        duration: 1321,
      },
    ],
  },
  {
    price: 19081,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:06:00.000Z",
        stops: [],
        duration: 1475,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:50:00.000Z",
        stops: [],
        duration: 634,
      },
    ],
  },
  {
    price: 78585,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:26:00.000Z",
        stops: ["AUH", "HKG", "SIN"],
        duration: 874,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:53:00.000Z",
        stops: [],
        duration: 1750,
      },
    ],
  },
  {
    price: 71348,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:02:00.000Z",
        stops: ["HKG", "SHA", "IST"],
        duration: 1276,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:56:00.000Z",
        stops: [],
        duration: 1117,
      },
    ],
  },
  {
    price: 87313,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:32:00.000Z",
        stops: ["DXB"],
        duration: 842,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:09:00.000Z",
        stops: ["DXB"],
        duration: 856,
      },
    ],
  },
  {
    price: 40464,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:04:00.000Z",
        stops: ["HKG"],
        duration: 1843,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:28:00.000Z",
        stops: ["AUH", "SIN", "HKG"],
        duration: 915,
      },
    ],
  },
  {
    price: 68975,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T11:25:00.000Z",
        stops: ["DXB"],
        duration: 703,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:02:00.000Z",
        stops: ["IST"],
        duration: 1977,
      },
    ],
  },
  {
    price: 57386,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:42:00.000Z",
        stops: [],
        duration: 1904,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T06:43:00.000Z",
        stops: ["IST", "KUL", "AUH"],
        duration: 1588,
      },
    ],
  },
  {
    price: 46168,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:51:00.000Z",
        stops: ["HKG"],
        duration: 1315,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:39:00.000Z",
        stops: ["DXB"],
        duration: 752,
      },
    ],
  },
  {
    price: 28259,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:24:00.000Z",
        stops: [],
        duration: 836,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:55:00.000Z",
        stops: ["SHA"],
        duration: 1780,
      },
    ],
  },
  {
    price: 77489,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:18:00.000Z",
        stops: ["BKK"],
        duration: 1168,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:32:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1833,
      },
    ],
  },
  {
    price: 57116,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:27:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1722,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T09:30:00.000Z",
        stops: ["AUH", "IST", "DXB"],
        duration: 736,
      },
    ],
  },
  {
    price: 57871,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:01:00.000Z",
        stops: [],
        duration: 853,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:16:00.000Z",
        stops: ["SIN"],
        duration: 1883,
      },
    ],
  },
  {
    price: 92716,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:41:00.000Z",
        stops: ["HKG"],
        duration: 1059,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:31:00.000Z",
        stops: ["KUL"],
        duration: 1657,
      },
    ],
  },
  {
    price: 94973,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:01:00.000Z",
        stops: ["SIN", "HKG", "DXB"],
        duration: 615,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T14:14:00.000Z",
        stops: ["KUL", "IST"],
        duration: 1111,
      },
    ],
  },
  {
    price: 88310,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:38:00.000Z",
        stops: ["BKK", "HKG", "DXB"],
        duration: 1308,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T13:04:00.000Z",
        stops: ["SHA", "IST"],
        duration: 1415,
      },
    ],
  },
  {
    price: 50433,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:09:00.000Z",
        stops: [],
        duration: 1324,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:33:00.000Z",
        stops: [],
        duration: 1832,
      },
    ],
  },
  {
    price: 96793,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T03:08:00.000Z",
        stops: ["DXB"],
        duration: 1324,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:52:00.000Z",
        stops: [],
        duration: 828,
      },
    ],
  },
  {
    price: 36743,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:28:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1732,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:14:00.000Z",
        stops: ["SIN", "BKK"],
        duration: 1960,
      },
    ],
  },
  {
    price: 71323,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:07:00.000Z",
        stops: ["SHA", "KUL", "HKG"],
        duration: 710,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T21:32:00.000Z",
        stops: ["HKG", "SHA"],
        duration: 1630,
      },
    ],
  },
  {
    price: 76002,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:37:00.000Z",
        stops: ["DXB", "AUH"],
        duration: 1759,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:11:00.000Z",
        stops: ["DXB", "IST", "SIN"],
        duration: 1134,
      },
    ],
  },
  {
    price: 58601,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T12:44:00.000Z",
        stops: ["SHA", "BKK", "DXB"],
        duration: 1467,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:07:00.000Z",
        stops: ["AUH", "DXB", "SHA"],
        duration: 1931,
      },
    ],
  },
  {
    price: 63712,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:55:00.000Z",
        stops: ["KUL", "AUH"],
        duration: 1807,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T07:57:00.000Z",
        stops: [],
        duration: 905,
      },
    ],
  },
  {
    price: 91777,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:57:00.000Z",
        stops: [],
        duration: 722,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T16:56:00.000Z",
        stops: [],
        duration: 975,
      },
    ],
  },
  {
    price: 71747,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:44:00.000Z",
        stops: ["KUL", "DXB", "SIN"],
        duration: 1574,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:13:00.000Z",
        stops: ["AUH", "SIN"],
        duration: 837,
      },
    ],
  },
  {
    price: 43475,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:34:00.000Z",
        stops: ["DXB"],
        duration: 1454,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:11:00.000Z",
        stops: ["AUH", "HKG"],
        duration: 1293,
      },
    ],
  },
  {
    price: 51940,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T05:29:00.000Z",
        stops: ["SIN"],
        duration: 1381,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:22:00.000Z",
        stops: ["SHA", "AUH"],
        duration: 1051,
      },
    ],
  },
  {
    price: 41379,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T22:20:00.000Z",
        stops: [],
        duration: 1908,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:48:00.000Z",
        stops: ["DXB", "BKK"],
        duration: 1039,
      },
    ],
  },
  {
    price: 73689,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:08:00.000Z",
        stops: ["DXB", "HKG", "KUL"],
        duration: 1086,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T11:00:00.000Z",
        stops: [],
        duration: 1472,
      },
    ],
  },
  {
    price: 16365,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T15:36:00.000Z",
        stops: ["HKG"],
        duration: 1777,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T05:22:00.000Z",
        stops: ["SHA"],
        duration: 1205,
      },
    ],
  },
  {
    price: 55813,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T23:32:00.000Z",
        stops: [],
        duration: 1692,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:18:00.000Z",
        stops: ["HKG", "AUH", "DXB"],
        duration: 1946,
      },
    ],
  },
  {
    price: 56819,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T16:52:00.000Z",
        stops: ["DXB", "BKK", "IST"],
        duration: 653,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:42:00.000Z",
        stops: [],
        duration: 1392,
      },
    ],
  },
  {
    price: 27256,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T14:21:00.000Z",
        stops: [],
        duration: 810,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:54:00.000Z",
        stops: [],
        duration: 766,
      },
    ],
  },
  {
    price: 74821,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:17:00.000Z",
        stops: [],
        duration: 660,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T15:01:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 1468,
      },
    ],
  },
  {
    price: 91183,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T17:47:00.000Z",
        stops: [],
        duration: 1685,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:42:00.000Z",
        stops: ["SHA", "KUL", "SIN"],
        duration: 1982,
      },
    ],
  },
  {
    price: 22727,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:47:00.000Z",
        stops: [],
        duration: 644,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T04:50:00.000Z",
        stops: ["BKK", "DXB"],
        duration: 1471,
      },
    ],
  },
  {
    price: 90316,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:19:00.000Z",
        stops: ["SIN", "SHA", "AUH"],
        duration: 947,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:00:00.000Z",
        stops: [],
        duration: 760,
      },
    ],
  },
  {
    price: 58436,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T00:01:00.000Z",
        stops: ["KUL", "BKK", "IST"],
        duration: 607,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T23:49:00.000Z",
        stops: [],
        duration: 1950,
      },
    ],
  },
  {
    price: 70173,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T06:23:00.000Z",
        stops: ["SIN"],
        duration: 1944,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T17:43:00.000Z",
        stops: ["BKK"],
        duration: 1088,
      },
    ],
  },
  {
    price: 26175,
    carrier: "EK",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T13:54:00.000Z",
        stops: ["SIN", "AUH"],
        duration: 642,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T01:57:00.000Z",
        stops: ["AUH"],
        duration: 656,
      },
    ],
  },
  {
    price: 31854,
    carrier: "S7",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T10:41:00.000Z",
        stops: ["BKK", "SHA", "AUH"],
        duration: 1769,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T10:25:00.000Z",
        stops: [],
        duration: 677,
      },
    ],
  },
  {
    price: 79671,
    carrier: "SU",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T04:04:00.000Z",
        stops: ["DXB", "SIN"],
        duration: 638,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T12:39:00.000Z",
        stops: ["SHA"],
        duration: 1307,
      },
    ],
  },
  {
    price: 43459,
    carrier: "EY",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T07:49:00.000Z",
        stops: ["IST", "SIN"],
        duration: 1403,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T03:15:00.000Z",
        stops: ["BKK", "DXB"],
        duration: 987,
      },
    ],
  },
  {
    price: 42719,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-23T21:53:00.000Z",
        stops: ["AUH", "IST"],
        duration: 643,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T08:40:00.000Z",
        stops: ["KUL", "AUH", "BKK"],
        duration: 619,
      },
    ],
  },
  {
    price: 54467,
    carrier: "FV",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T08:58:00.000Z",
        stops: ["KUL", "IST", "AUH"],
        duration: 1439,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T02:32:00.000Z",
        stops: ["BKK", "KUL", "SHA"],
        duration: 1732,
      },
    ],
  },
  {
    price: 54319,
    carrier: "TG",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T01:43:00.000Z",
        stops: ["DXB"],
        duration: 776,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-12T22:28:00.000Z",
        stops: ["SIN", "HKG", "AUH"],
        duration: 1807,
      },
    ],
  },
  {
    price: 40173,
    carrier: "MH",
    segments: [
      {
        origin: "MOW",
        destination: "HKT",
        date: "2021-07-24T02:13:00.000Z",
        stops: ["SIN"],
        duration: 851,
      },
      {
        origin: "HKT",
        destination: "MOW",
        date: "2021-08-13T00:16:00.000Z",
        stops: ["AUH"],
        duration: 1564,
      },
    ],
  },
];
