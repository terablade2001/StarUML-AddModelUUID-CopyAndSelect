# About

This is an extension for [StarUML.io](https://staruml.io/) S/W which aids the users to generate UUIDs for each selected element of their models in order to make references these elements, at documentation and/or the source code.

The UUIDs are generated as:  

- A new ***Tag*** inside the element, wherever it's permittable.
- The Tag has always name `sUUID` and is of `string` kind.
- It's value is generated using the `crypto.randomUUID()` algorithm and it's of the UUID v4 standard format like:  
  `e4f3c066-87a6-487d-9e89-514b58ab60a2`

> [!IMPORTANT]
>
> If you have already installed the extension [StarUML-ModelIdCopyAndSelect](https://github.com/terablade2001/StarUML-ModelIdCopyAndSelect) <u>it's proposed to uninstalled it first</u>, because it's uses the same shortcuts with this "**StarUML-AddModelUUID-CopyAndSelect**" extension.



Below is shown this extension's menu.  
There are 4 options:

1. **Generate UUID in Clipboard**: It generates a UUID and copies it to Clipboard thus the user to be able to paste it anywhere he may need. So it may be useful if for any case, there is the need to update manually a UUID with another.

2. **Add+Copy Model's Tag UUID**: User must have first select an appropriate element/model. If the selected element/model has not the `sUUID` tag, that tag is created with a new UUID first. Then the UUID value which exist in the `sUUID` tag of the selected element/model is copied to clipboard and is available to the user to use it for reference in documentation or source code.

3. **Select Model by it's Tag UUID**: The user is expected to have copied the wanted UUID from the documentation or source code to the clipboard. Then using this functionality the extensions finds the tag containing the value of the user's UUID, and ***auto-selects the parent element*** of the tag in the *Model Explorer*. To this end, with *Ctrl+E* the user can find directly the element/model with the wanted UUID in the Explorer window, and with *Ctrl+D* to also find it in a used diagram.

4. **Check for duplicated UUIDs**: While the idea behind the UUIDs is to be unique in a global scale, this tool checks if there are any `string`-`sUUID` tags with the same UUID value. If this is the case, then this option copies to Clipboard a report like the following example, where the parent `_id`s are provided:

   ```
    - Duplicated UUID[b539d342-9a61-48e7-bc0b-88bd0e7cb5d8] detected at elements with parent _id's:
   AAAAAAGRDhzKVEZwVEY=
   AAAAAAGRDhzNDEbCH+o=
   ```
   ► Notice that these `_id`s are not unique and not safe to use, but still can be easily accessed and used in a similar manner using the corresponding extension [StarUML-ModelIdCopyAndSelect](https://github.com/terablade2001/StarUML-ModelIdCopyAndSelect). However have in mind that using this old extension it may re-wire the shortcuts Alt+Shift+C and Alt+Shift+V (see  the "*important*" note above).


![Menu_0.1.3](Menu_0.1.3.jpg)


