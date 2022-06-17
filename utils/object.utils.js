const isEmptyObj = (obj) => !obj || Object.keys(obj).length === 0;

const isJsonStructure = (value) => {
  if (typeof value !== "string") return false;

  try {
    const result = JSON.parse(value);
    const type = Object.prototype.toString.call(result);
    return type === "[object Object]" || type === "[object Array]";
  } catch {
    return false;
  }
};

const createObjectElements = (keyName, object) => {
  const expand = document.getElementById("expand");

  const objectField = document.createElement("ul");

  const objectFieldText = document.createElement("p");
  objectFieldText.classList.add("object-field-text");

  const objectFieldTextKey = document.createElement("span");
  objectFieldTextKey.innerHTML = `${keyName}:&nbsp;`;

  if (keyName !== "response") {
    if (!expand.checked) {
      objectField.classList.add("object-field-hide");
    }

    objectFieldText.append(objectFieldTextKey);

    if (Array.isArray(object)) {
      if (object.length === 0) {
        objectFieldText.innerHTML += `[]`;
        objectField.classList.add("object-field-empty");
      } else {
        objectFieldText.innerHTML += `[,...(${object.length})]`;
        objectField.classList.add("object-field");
      }
    } else {
      if (isEmptyObj(object)) {
        objectFieldText.innerHTML += `{}`;
        objectField.classList.add("object-field-empty");
      } else {
        objectFieldText.innerHTML += `{,...(${Object.keys(object).length})}`;
        objectField.classList.add("object-field");
      }
    }

    objectField.append(objectFieldText);
  } else {
    objectField.classList.add("response");
  }

  for (const [key, value] of Object.entries(object)) {
    if (value && (typeof value === "object" || isJsonStructure(value))) {
      const newValue = isJsonStructure(value) ? JSON.parse(value) : value;

      objectField.append(createObjectElements(key, newValue));
    } else {
      const field = document.createElement("li");
      field.classList.add("simple-item");

      const fieldKey = document.createElement("p");
      fieldKey.innerHTML = `${key}:&nbsp;`;

      const fieldValue = document.createElement("p");
      const valueType = value === null ? "null" : typeof value;
      fieldValue.classList.add(`type-${valueType}`);
      fieldValue.innerHTML = `${value}`;

      field.append(fieldKey);
      field.append(fieldValue);
      objectField.append(field);
    }
  }

  objectField.addEventListener("click", (e) => {
    e.stopPropagation();

    if (
      e.target === objectFieldText ||
      e.target === objectFieldText.children[0]
    ) {
      objectField.classList.toggle("object-field-hide");
    }
  });

  return objectField;
};
