function createUUIDTagOnElement(element) {
  var uuid = crypto.randomUUID()
  var options = {
    id: "Tag",
    field: "tags",
    parent: element,
    modelInitializer: function (elem) {
      elem.value = ""
      elem.name = "UUID: "+uuid
      elem.kind = "string"
      elem.hidden = true
    }
  }
  tag = app.factory.createModel(options)
  if (typeof(tag) == 'undefined') {
    app.toast.error("Failed to create Tag on selected parent")
    return null
  }
  app.toast.warning("New UUID ["+uuid+"] generated")
  return tag
}



function checkForMultipleUUIDTagsInElement(element) {
  var retString = ""
  if ((!element.tags) || (element.tags.length <= 0)) {
    return retString
  }

  var UUIDTagsList = []
  for (var i = 0; i < element.tags.length; i++) {
    var tag = element.tags[i]
    if (tag.name.startsWith("UUID: ")&&(tag.kind == "string")) {
      if (tag.name.length == 42 ) {
        uuid = tag.name.substring(6)
        UUIDTagsList.push(tag)
      }
    }
  }
  if (UUIDTagsList.length > 1) {
    retString = " - Multiple UUID Tags found at element ["+element.name+"] with _id [ "+element._id+" ]\n"
    for (var i=0; i < UUIDTagsList.length; i++) {
      var tag = UUIDTagsList[i]
      retString += tag.name + "\n"
    }
  }
  return retString
}



function findOrCreateUUIDTagOnElement(element, tag) {
  if ((!element.tags) || (element.tags.length <= 0)) {
    tag = createUUIDTagOnElement(element)
    return tag
  }

  retString = checkForMultipleUUIDTagsInElement(element)
  if (retString != "") {
    console.log(retString)
    app.toast.error("Multiple UUID[string] tags found. See console.log for more info. Can not proceed..")
    return null
  }

  var foundTag = null
  for (var i = 0; i < element.tags.length; i++) {
    var tag = element.tags[i]
    if ((tag.name.startsWith("UUID: "))&&(tag.kind=="string")) {
      if (tag.name.length != 42 ) {
        app.toast.error("UUID found but its value is invalid. Please manually delete it and recreate it")
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
      var tag = element.tags[i]
      if ((tag.name.startsWith("UUID: ")) && (tag.kind === "string")) {
        if (tag.name.length == 42 ) { tagsList.push(tag) }
      }
    }
  }
  if (element.ownedElements && element.ownedElements.length > 0) {
    for (var i = 0; i < element.ownedElements.length; i++) {
      tagsList = findAllTags(element.ownedElements[i], tagsList)
    }
  }
  if (element.operations && element.operations.length > 0) {
    for (var i = 0; i < element.operations.length; i++) {
      tagsList = findAllTags(element.operations[i], tagsList)
    }
  }
  if (element.templateParameters && element.templateParameters.length > 0) {
    for (var i = 0; i < element.templateParameters.length; i++) {
      tagsList = findAllTags(element.templateParameters[i], tagsList)
    }
  }
  if (element.receptions && element.receptions.length > 0) {
    for (var i = 0; i < element.receptions.length; i++) {
      tagsList = findAllTags(element.receptions[i], tagsList)
    }
  }
  if (element.attributes && element.attributes.length > 0) {
    for (var i = 0; i < element.attributes.length; i++) {
      tagsList = findAllTags(element.attributes[i], tagsList)
    }
  }
  return tagsList
}



let copiedTagUUIDValue

function writeToClipboard(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)

  textarea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Unable to copy text to clipboard:', err)
    document.body.removeChild(textarea)
    return -1
  }
  document.body.removeChild(textarea)
  return 0
}

function readFromClipboard() {
  const textarea = document.createElement('textarea')
  textarea.value = ""
  document.body.appendChild(textarea)

  textarea.select()
  try {
    document.execCommand('paste')
  } catch (err) {
    console.error('Unable to copy text from clipboard:', err)
    copiedTagUUIDValue=''
    document.body.removeChild(textarea)
    return -1
  }
  copiedTagUUIDValue = textarea.value
  document.body.removeChild(textarea)
  return 0
}



function copyModelId () {
  let selected = app.selections.getSelected()
  if (typeof(selected) == 'undefined') {
    app.toast.error("No element has been selected!")
    return -1
  }

  tag = findOrCreateUUIDTagOnElement(selected)
  if (tag == null) { return -1 }

  var uuid = tag.name.substring(6)
  var err = writeToClipboard(uuid)
  if (err != 0) {
    app.toast.error("Failed to copy selected UUID to clipboard!")
    return -1
  }
  app.toast.info("UUID [ "+uuid+" ] copied to clipboard.")
  return 0
}


function selectModelById () {
  var err = readFromClipboard()
  if (err != 0) {
    app.toast.error("Failed to read selected UUID from clipboard!")
    return -1
  }


  var rootElement = app.repository.select("@Project")[0]
  var tagsList = findAllTags(rootElement, [])

  var tag = null
  for (var i = 0; i < tagsList.length; i++) {
    var t = tagsList[i]
    var uuid = t.name.substring(6)
    if (uuid === copiedTagUUIDValue) {
      tag = t
      break
    }
  }

  if (tag == null) {
    app.toast.error("Tag with value [ "+copiedTagUUIDValue+" ] was not found")
    return -1
  }

  let modelById = app.repository.get(tag._parent._id)
  if (typeof(modelById) == "undefined") {
    app.toast.error("Model with Tag UUID [ "+copiedTagUUIDValue+" ] was not found!")
    return -1
  }

  app.selections.deselectAll()
  app.selections.selectModel(modelById)
  app.modelExplorer.select(modelById, true)
  app.toast.info("Model with Tag UUID [ "+copiedTagUUIDValue+ "] selected.")
  return 0
}




function generateUUID() {
  var uuid = crypto.randomUUID()
  var err = writeToClipboard(uuid)
  if (err != 0) {
    app.toast.error("Failed to copy generated UUID to clipboard!")
    return -1
  }
  app.toast.info("UUID [ "+uuid+" ] copied to clipboard.")
  return 0
}




function findMultipleUUIDs(element, reportStr) {
  reportStr += checkForMultipleUUIDTagsInElement(element)
  if (element.ownedElements && element.ownedElements.length > 0) {
    for (var i = 0; i < element.ownedElements.length; i++) {
      reportStr = findMultipleUUIDs(element.ownedElements[i], reportStr)
    }
  }
  return reportStr
}


function checkForDuplicatedUUIDs() {
  var rootElement = app.repository.select("@Project")[0]
  var tagList = findAllTags(rootElement, [])

  var tagMap = {}
  for (var i = 0; i < tagList.length; i++) {
    var tag = tagList[i]
    var uuid = tag.name.substring(6)
    if (tagMap[uuid]) {
      tagMap[uuid].push(tag)
    } else {
      tagMap[uuid] = [tag]
    }
  }

  duplicatesStr = ""
  for (var key in tagMap) {
    if (tagMap[key].length > 1) {
      duplicatesStr = " - Duplicated UUID["+key+"] detected at elements with parent _id's:\n"
      for (var j = 0; j < tagMap[key].length; j++) {
        var el = tagMap[key][j]
        duplicatesStr += "name: ["+el._parent.name+"], _id: [ "+el._parent._id+" ]\n"
      }
    }
  }

  if (duplicatesStr!="") {
    console.log(duplicatesStr)
    var err = writeToClipboard(duplicatesStr)
    if (err != 0) {
      app.toast.error("Failed to copy duplicated UUIDs results! See console logs to review them!")
      return -1
    }
    app.toast.info("Duplicated UUIDs detected and copied to clipboard!")
    app.toast.error("Check for duplicated UUIDs (1/2) failed!")
    return 0
  } else {
    app.toast.info("1. No Duplicated UUIDs detected")
  }

  // Check for multiple UUIDs under a single element too.
  multipleUUIDsPerElementStr = findMultipleUUIDs(rootElement, "")
  if (multipleUUIDsPerElementStr != "") {
    console.log(multipleUUIDsPerElementStr)
    var err = writeToClipboard(multipleUUIDsPerElementStr)
    if (err != 0) {
      app.toast.error("Failed to copy multiple UUIDs tags per parent results! See console logs to review them!")
      return -1
    }
    app.toast.info("Multiple UUIDs tags under the same parent element detected and copied to clipboard!")
    app.toast.error("Check for Multiple UUIDs tags under same parent (2/2) failed!")
    return 0
  } else {
    app.toast.info("2. No multiple UUIDs tags per parent element detected")
  }

  app.toast.info("All checks (2/2) passed")

  return 0
}


function init () {
  copiedTagUUIDValue = ""
  app.commands.register('AddModelUUIdCopyAndSelect:generateUUID', generateUUID)
  app.commands.register('AddModelUUIdCopyAndSelect:copyModelId', copyModelId)
  app.commands.register('AddModelUUIdCopyAndSelect:selectModelById', selectModelById)
  app.commands.register('AddModelUUIdCopyAndSelect:checkForDuplicatedUUIDs', checkForDuplicatedUUIDs)
}

exports.init = init