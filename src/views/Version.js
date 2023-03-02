import { VERSION } from './../settings.js';

class Version {
    #root;

    constructor(element) {
        this.#root = element;
        this.#root.classList.add("meteotiles-version");
    }

    render() {
        const anchor = document.createElement("a");
        anchor.classList.add("version-link");
        anchor.href = `https://github.com/ARPA-SIMC/meteotiles/releases/tag/${VERSION}`;
        anchor.innerText = `meteotiles version ${VERSION} (prototype) - Copyright © 2022-2023 ARPAE-SIMC`;
        this.#root.append(anchor);
    }
}

export default Version;
