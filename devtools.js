chrome.devtools.panels.create("JSON Viewer", "/icons/48.png", "devtools.html");

const getShortUrl = (url) => url.slice(url.lastIndexOf("/") + 1);

document.addEventListener("DOMContentLoaded", function () {
  if (chrome.devtools.panels.themeName === "dark") {
    document.body.classList.add("dark-theme");
  }

  const requestList = document.getElementById("request-list");

  chrome.devtools.network.onRequestFinished.addListener(function (request) {
    if (request._resourceType === "xhr" || request._resourceType === "fetch") {
      const requestItem = document.createElement("li");
      requestItem.classList.add("requestItem");

      const requestUrlButton = document.createElement("button");
      requestUrlButton.classList.add("request-url-button");
      requestUrlButton.innerText = getShortUrl(request.request.url);

      const codeContainer = document.createElement("div");
      codeContainer.classList.add("codeContainer");

      request.getContent((content) => {
        try {
          if (Math.floor(request.response.status / 100) === 2) {
            requestUrlButton.classList.add("success");
          } else {
            requestUrlButton.classList.add("failed");
          }

          if (content && !isJsonStructure(content)) {
            codeContainer.append(content);
          } else {
            codeContainer.append(
              createObjectElements("response", JSON.parse(content))
            );
          }
        } catch {
          codeContainer.innerText = request.response._error;
        }
      });

      requestUrlButton.addEventListener("click", () => {
        if (requestItem.classList.contains("show-object")) {
          requestItem.classList.remove("show-object");
          resetSearch();
        } else {
          requestItem.classList.add("show-object");
        }
      });

      requestItem.append(requestUrlButton);
      requestItem.append(codeContainer);

      requestList.append(requestItem);
    }
  });
});
