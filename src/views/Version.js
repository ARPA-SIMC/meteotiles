import { VERSION } from './../settings.js';

class Version {
    #root;

    constructor(element) {
        this.#root = element;
    }

    render() {
        this.#root.querySelector("a.version-link").href += `/releases/tag/v${VERSION}`;
        this.#root.querySelector(".version").innerText = `version ${VERSION} (prototype)`;
    }
}

export default Version;
