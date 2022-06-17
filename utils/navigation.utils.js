let currentSummary = 0;
let summary = 0;
let prevSearch = "";
let timerId;

const resetSearch = () => {
  const scoreWrapper = document.getElementById("score-wrapper");
  const summarySpan = document.getElementById("summary");

  const marks = document.getElementsByTagName("mark");

  summary = 0;
  prevSearch = "";

  scoreWrapper.classList.remove("show");
  summarySpan.innerText = "";

  [...marks].forEach((el) => {
    if (el.parentElement) {
      el.parentElement.innerHTML = `${el.parentElement.innerText}`;
    }
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const clearButton = document.getElementById("clear-button");

  const searchInput = document.getElementById("search");

  const scoreWrapper = document.getElementById("score-wrapper");
  const summarySpan = document.getElementById("summary");
  const arrowButtonDown = document.getElementById("arrow-button-down");
  const arrowButtonUp = document.getElementById("arrow-button-up");

  const requestList = document.getElementById("request-list");

  const marks = document.getElementsByTagName("mark");

  const scrollToCurrentMark = () => {
    const currentMark = [...marks].find((_, i) => i + 1 === currentSummary);

    for (let mark of [...marks]) {
      if (mark === currentMark) {
        currentMark.classList.add("current-mark");
        currentMark.scrollIntoView({
          block: "center",
          inline: "center",
          behavior: "smooth",
        });
      } else {
        mark.classList.remove("current-mark");
      }
    }
  };

  clearButton.addEventListener("click", () => {
    requestList.textContent = "";
    resetSearch();
  });

  const expandWrapper = document.getElementById("expand-wrapper");
  const expand = document.getElementById("expand");

  const objectFields = document.getElementsByClassName("object-field");

  expandWrapper.addEventListener("click", () => {
    if (expand.checked) {
      [...objectFields].forEach((el) =>
        el.classList.remove("object-field-hide")
      );

      scrollToCurrentMark();
    } else {
      [...objectFields].forEach((el) => {
        if (!el.classList.contains("response")) {
          el.classList.add("object-field-hide");
        }
      });

      resetSearch();
    }
  });

  const getNextSearchElement = (direction = "down") => {
    if (summary) {
      switch (direction) {
        case "up":
          currentSummary = currentSummary > 1 ? --currentSummary : summary;
          break;
        default:
          currentSummary = currentSummary < summary ? ++currentSummary : 1;
      }

      scrollToCurrentMark();
    }

    summarySpan.innerText = `${currentSummary}/${summary}`;
    scoreWrapper.classList.add("show");
  };

  arrowButtonDown.addEventListener("click", () => getNextSearchElement());

  arrowButtonUp.addEventListener("click", () => getNextSearchElement("up"));

  const openNestedObjectsForSearch = (listNode) => {
    listNode.classList.remove("object-field-hide");

    if (listNode.parentNode.classList.contains("object-field-hide")) {
      openNestedObjectsForSearch(listNode.parentNode);
    }
  };

  const insideLiItemSearch = (searchValue, list, node) => {
    const searchLength = searchValue.length;
    const upperSearch = searchValue.toUpperCase();

    const prefix = "<mark>";
    const postfix = "</mark>";

    let updatedString = node.innerText;

    let count = 0;

    for (
      let index = 0;
      ~(index = node.innerText.toUpperCase().indexOf(upperSearch, index));
      index += searchLength
    ) {
      let startIndex = index + count * (prefix.length + postfix.length);

      let newSubstr = node.innerText.slice(index, index + searchLength);

      newSubstr = newSubstr
        .split(new RegExp(searchValue, "i"))
        .join(`${prefix}${newSubstr}${postfix}`);

      updatedString =
        updatedString.slice(0, startIndex) +
        newSubstr +
        updatedString.slice(startIndex + searchLength);

      count++;
      summary++;
    }

    if (~node.innerText.toUpperCase().indexOf(upperSearch)) {
      openNestedObjectsForSearch(list);
      node.innerHTML = `${updatedString}`;
    }
  };

  searchInput.addEventListener("input", (e) => {
    if (!e.target.value.length) {
      resetSearch();
    }
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Tab") return;

    clearTimeout(timerId);

    if (e.target.value.length) {
      if (e.key === "Enter" && summary) {
        getNextSearchElement();
      } else {
        resetSearch();

        const recursionSearch = (list) => {
          for (let item of list.children) {
            if (item.tagName === "UL") {
              recursionSearch(item);
            } else {
              for (let node of item.children) {
                insideLiItemSearch(e.target.value, list, node);
              }
            }
          }
        };

        timerId = setTimeout(() => {
          const openRequests = document.getElementsByClassName("show-object");

          console.time("forEach");
          for (let openRequest of openRequests) {
            const response = openRequest.children[1].children[0];

            if (response) {
              recursionSearch(response);
            }
          }
          console.timeEnd("forEach");

          if (prevSearch !== e.target.value) {
            currentSummary = 0;
            prevSearch = e.target.value;
          }

          getNextSearchElement();
        }, 0);
      }
    }
  });
});
