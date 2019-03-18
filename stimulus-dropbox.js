/*
 * Stimulus-Dropbox
 *
 * Copyright (C) 2019 Boris Raicheff
 * All rights reserved
 */


import { Controller } from "stimulus";


// https://www.dropbox.com/developers/chooser


export default class extends Controller {

  connect() {

    window.Dropbox ? this._update() : this._inject(this._update.bind(this));

  }

  disconnect() {

    const element = document.getElementById("dropboxjs");
    element.classList.contains("dynamic") && element.parentNode.removeChild(element);

  }

  choose(event) {

    const options = {
      success: this._success.bind(this),
      cancel:  this._cancel.bind(this),
    };

    for (const key of [
      "linkType",
      "multiselect",
      "folderselect",
      "sizeLimit"
    ]) {
      this.data.has(key) && (options[key] = this.data.get(key));
    }

    for (const key of ["extensions"]) {
      this.data.has(key) && (options[key] = this.data.get(key).split(" "));
    }

    Dropbox.choose(options);

    this.element.disabled = true;

  }

  _inject(listener) {

    // https://gomakethings.com/a-better-way-to-load-scripts-with-javascript-or-why-document-write-sucks/

    const script = document.createElement("script");
    script.id = "dropboxjs";
    script.classList.add("dynamic");
    script.src = "https://www.dropbox.com/static/api/2/dropins.js";
    script.dataset.appKey = this.data.get("appKey");
    script.addEventListener("load", listener);

    const ref = document.getElementsByTagName("script")[0];
    ref.parentNode.insertBefore(script, ref);

  }

  _update() {

    this.element.disabled = !Dropbox.isBrowserSupported();

  }

  _success(files) {

    const event = new CustomEvent("choose", { detail: { files: files } });
    this.element.dispatchEvent(event);

    this.element.disabled = false;

  }

  _cancel() {

    this.element.dispatchEvent(new Event("cancel"));

    this.element.disabled = false;

  }

}


/* EOF */
