function createUUIDTagOnElement(element) {
  var options = {
    id: "Tag",
    field: "tags",
    parent: element,
    modelInitializer: function (elem) {
      elem.name = "sUUID";
      elem.kind = "string";
      elem.value = crypto.randomUUID()
      elem.hidden = true
    }
  }
  tag = app.factory.createModel(options)
  if (typeof(tag) == 'undefined') {
    app.toast.error("Failed to create Tag on selected parent");
    return null
  }
  return tag
}



function findOrCreateUUIDTagOnElement(element, tag) {
  if ((!element.tags) || (element.tags.length <= 0)) {
    tag = createUUIDTagOnElement(element)
    return tag
  }

  var foundOnce = false
  for (var i = 0; i < element.tags.length; i++) {
    var tag = element.tags[i];
    if ((tag.name === "sUUID")&&(tag.kind == "string")) {
      if (foundOnce == true) {
        app.toast.error("Multiple sUUID[string] tags found. Can not proceed..");
        return null
      }
      foundOnce = true;
    }
  }

  var foundTag = null;
  for (var i = 0; i < element.tags.length; i++) {
    var tag = element.tags[i];
    if ((tag.name === "sUUID")&&(tag.kind=="string")) {
      if (tag.value.length != 36 ) {
        app.toast.error("sUUID found but its value is invalid. Please manually delete it and recreate it");
        return null
      } else {
        foundTag = tag
        return tag
      }
    }
  }
  if (foundTag == null) {
    tag = createUUIDTagOnElement(element)
    return tag
  }
  return null
}



function findAllTags(element, tagsList) {
  if (element.tags && element.tags.length > 0) {
    for (var i = 0; i < element.tags.length; i++) {
      var tag = element.tags[i];
      if ((tag.name === "sUUID") && (tag.kind === "string")) {
        tagsList.push(tag);
      }
    }
  }
  if (element.ownedElements && element.ownedElements.length > 0) {
    for (var i = 0; i < element.ownedElements.length; i++) {
      tagsList = findAllTags(element.ownedElements[i], tagsList);
    }
  }
  return tagsList;
}



let copiedTagUUIDValue

function writeToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);

  textarea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy text to clipboard:', err);
    document.body.removeChild(textarea);
    return -1;
  }
  document.body.removeChild(textarea);
  return 0;
}

function readFromClipboard() {
  const textarea = document.createElement('textarea');
  textarea.value = "";
  document.body.appendChild(textarea);

  textarea.select();
  try {
    document.execCommand('paste');
  } catch (err) {
    console.error('Unable to copy text from clipboard:', err);
    copiedTagUUIDValue='';
    document.body.removeChild(textarea);
    return -1;
  }
  copiedTagUUIDValue = textarea.value;
  document.body.removeChild(textarea);
  return 0;
}



function copyModelId () {
  let selected = app.selections.getSelected();
  if (typeof(selected) == 'undefined') {
    app.toast.error("No element has been selected!");
    return -1;
  }

  tag = findOrCreateUUIDTagOnElement(selected)
  if (tag == null) { return -1 }

  var err = writeToClipboard(tag.value);
  if (err != 0) {
    app.toast.error("Failed to copy selected UUID to clipboard!");
    return -1;
  }
  app.toast.info("Id [ "+tag.value+" ] copied to clipboard.")
  return 0;
}


function selectModelById () {
  var err = readFromClipboard();
  if (err != 0) {
    app.toast.error("Failed to read selected id from clipboard!");
    return -1;
  }


  var rootElement = app.repository.select("@Project")[0];
  var tagsList = findAllTags(rootElement, []);

  var tag = null;
  for (var i = 0; i < tagsList.length; i++) {
    var t = tagsList[i];
    if (t.value === copiedTagUUIDValue) {
      tag = t
      break
    }
  }

  if (tag == null) {
    app.toast.error("Tag with value [ "+copiedTagUUIDValue+" ] was not found");
    return -1;
  }

  let modelById = app.repository.get(tag._parent._id)
  if (typeof(modelById) == "undefined") {
    app.toast.error("Model with Tag sUUID [ "+copiedTagUUIDValue+" ] was not found!")
    return -1;
  }

  app.selections.deselectAll();
  app.selections.selectModel(modelById);
  app.modelExplorer.select(modelById, true);
  app.toast.info("Model with Tag sUUID [ "+modelById._id+ "] selected.");
  return 0;
}


function init () {
  copiedTagUUIDValue = ""
  app.commands.register('AddModelUUIdCopyAndSelect:copyModelId', copyModelId)
  app.commands.register('AddModelUUIdCopyAndSelect:selectModelById', selectModelById)
}

exports.init = init;