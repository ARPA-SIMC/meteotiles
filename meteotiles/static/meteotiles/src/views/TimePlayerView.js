import { formatDate } from '../utils.js';

class TimePlayerView {
    #root;
    #onStepForwardClicked = () => {};
    #onStepBackwardClicked = () => {};
    #onLoopClicked = () => {};
    #onSelectTimeIndex = (index) => {};
    #onPlayClicked = () => {};

    constructor(element) {
        this.#root = element;
        this.#root.classList.add("meteotiles-time-player");
    }

    render() {
        const divControls = document.createElement("div");
        divControls.classList.add("time-player-controls");

        const divButtons = document.createElement("div");
        divButtons.classList.add("time-player-controls-buttons");

        const stepBackwardButton = document.createElement("button");
        stepBackwardButton.classList.add("step-backward");

        const stepForwardButton = document.createElement("button");
        stepForwardButton.classList.add("step-forward");

        const playForwardButton = document.createElement("button");
        playForwardButton.classList.add("play-forward");

        const loopButton = document.createElement("button");
        loopButton.classList.add("loop");

        playForwardButton.addEventListener("click", () => {
            this.#onPlayClicked();
        });
        stepBackwardButton.addEventListener("click", () => {
            this.#onStepBackwardClicked();
        });
        stepForwardButton.addEventListener("click", () => {
            this.#onStepForwardClicked();
        });
        loopButton.addEventListener("click", (ev) => {
            this.#onLoopClicked();
        });

        divButtons.append(
            stepBackwardButton,
            playForwardButton,
            stepForwardButton,
            loopButton,
        );
        divControls.append(divButtons);

        const timeRangeInput = document.createElement("input");
        timeRangeInput.classList.add("time-range");
        timeRangeInput.type = "range";
        timeRangeInput.value = "0";
        timeRangeInput.step = "0";
        timeRangeInput.min = "0";
        timeRangeInput.max = "1";

        timeRangeInput.addEventListener("change", (event) => {
            this.#onSelectTimeIndex(timeRangeInput.value);
        }, false);

        divControls.addEventListener("wheel", (event) => {
            const direction = event.deltaY;
            const timerangeElement = this.#root.querySelector(".time-range");
            if (!timerangeElement.disabled) {
                if (direction < 0) {
                    this.#onStepForwardClicked();
                } else {
                    this.#onStepBackwardClicked();
                }
            }
        }, {
            passive: true,
        });
        divControls.append(timeRangeInput);

        const loaderSpan = document.createElement("span");
        loaderSpan.classList.add("loader");
        divControls.append(loaderSpan);

        const datetimeSpan = document.createElement("span");
        datetimeSpan.classList.add("datetime-label");
        divControls.append(datetimeSpan);

        this.#root.append(divControls);
    }

    renderTime(currentTime, availableTimes, isEnabled, isPlaying, isPlayForwardEnabled, isStepForwardEnabled, isStepBackwardEnabled, isLoopOn, isLoading, loadingPercentage) {
        const slider = this.#root.querySelector(".time-range");
        if (availableTimes.length == 0) {
            slider.max = "0";
            slider.value = "0";
        } else {
            slider.min = "0";
            slider.max = (availableTimes.length - 1).toString();
            slider.value = availableTimes.indexOf(currentTime).toString();
        }
        if (isEnabled) {
            this.enableControls();
        }
        if (isPlaying) {
            this.#root.querySelector(".play-forward").classList.add("playing");
        } else {
            this.#root.querySelector(".play-forward").classList.remove("playing");
        }
        this.#root.querySelector(".play-forward").disabled = !isPlayForwardEnabled;
        this.#root.querySelector(".step-forward").disabled = !isStepForwardEnabled;
        this.#root.querySelector(".step-backward").disabled = !isStepBackwardEnabled;
        this.#root.querySelector(".datetime-label").innerText = formatDate(currentTime);
        this.setLoop(isLoopOn);
        if (isLoading) {
            this.#root.querySelector(".time-player-controls .loader").classList.add("loading");
        } else {
            this.#root.querySelector(".time-player-controls .loader").classList.remove("loading");
        }
        if ((isLoading || availableTimes.length > 0) && (loadingPercentage != null && !isNaN(loadingPercentage))) {
            this.#root.querySelector(".time-player-controls .loader").innerText = `${loadingPercentage}%`;
        } else {
            this.#root.querySelector(".time-player-controls .loader").innerText = "";
        }
        if (!isEnabled) {
            this.disableControls();
        }
    }

    renderLoading() {
        this.disableControls();
        this.#root.querySelector(".time-player-controls .loader").classList.add("loading");
    }

    renderLoaded() {
        this.#root.querySelector(".time-player-controls .loader").classList.remove("loading");
    }

    disableControls() {
        this.#root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = true);
        this.#root.querySelector(".time-player-controls .time-range").disabled = true;
    }

    enableControls() {
        this.#root.querySelectorAll(".time-player-controls-buttons button").forEach((el) => el.disabled = false);
        this.#root.querySelector(".time-player-controls .time-range").disabled = false;
    }

    setLoop(isActive) {
        if (isActive) {
            this.#root.querySelector(".loop").classList.add("active");
        } else {
            this.#root.querySelector(".loop").classList.remove("active");
        }
    }

    setPlaying() {
        this.#root.querySelector(".play-forward").classList.add("playing");
        this.disableControls();
    }

    setPaused() {
        this.#root.querySelector(".play-forward").classList.remove("playing");
        this.enableControls();
    }

    bindOnStepForwardClicked(callback) {
        this.#onStepForwardClicked = callback;
    }

    bindOnStepBackwardClicked(callback) {
        this.#onStepBackwardClicked = callback;
    }

    bindOnLoopClicked(callback) {
        this.#onLoopClicked = callback;
    }

    bindOnSelectTimeIndex(callback) {
        this.#onSelectTimeIndex = callback;
    }

    bindOnPlayClicked(callback) {
        this.#onPlayClicked = callback;
    }

    bindSelectTimeIndex(callback) {
        this.#onSelectTimeIndex = callback;
    }
}

export default TimePlayerView;
